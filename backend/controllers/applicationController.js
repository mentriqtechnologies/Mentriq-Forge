const asyncHandler = require("express-async-handler");
const Application = require("../models/Application");
const Project = require("../models/Project");
const User = require("../models/User");
const { getPagination } = require("../utils/pagination");

// Application statuses the MentriQ team uses to forward a profile to the company
const FORWARDED_STATUSES = ["shortlisted", "interview_scheduled", "hired"];

// @desc Candidate applies / enrolls to a project
// @route POST /api/applications
const applyToProject = asyncHandler(async (req, res) => {
  const { projectId } = req.body;
  const candidateId = req.user._id;

  const project = await Project.findById(projectId).select("+deadline");
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  // Job must be open for applications
  if (project.status !== "open") {
    res.status(400);
    throw new Error("This role is not open for applications");
  }

  // Deadline check: if project has a deadline and it has passed, reject application
  if (project.deadline) {
    const now = new Date();
    if (now > new Date(project.deadline)) {
      res.status(400);
      throw new Error("Application deadline has passed");
    }
  }

  if (project.isDirectHire) {
    if (!applicantName?.trim() || !mobileNumber?.trim() || !qualification?.trim() || !resumeDriveLink?.trim()) {
      res.status(400);
      throw new Error("Please fill your name, mobile number, qualification and resume drive link");
    }
  }

  const exists = await Application.findOne({ project: projectId, candidate: req.user._id });
  if (exists) {
    res.status(400);
    throw new Error("You have already applied to this project");
  }

  if (project.maxCandidates > 0) {
    const count = await Application.countDocuments({ project: projectId });
    if (count >= project.maxCandidates) {
      res.status(400);
      throw new Error("This project has reached its candidate capacity");
    }
  }

  const application = await Application.create({
    project: projectId,
    candidate: req.user._id,
    applicationType: project.isDirectHire ? "direct_hire" : "project",
    applicantName: applicantName?.trim() || req.user.name || "",
    mobileNumber: mobileNumber?.trim() || "",
    qualification: qualification?.trim() || "",
    resumeDriveLink: resumeDriveLink?.trim() || "",
    status: "applied",
    startedAt: new Date(),
  });

  res.status(201).json({ success: true, application });
});

// @desc Get logged-in candidate's applications
// @route GET /api/applications/my
const getMyApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ candidate: req.user._id })
    .populate("project", "title domain difficulty deadline status company")
    .sort({ createdAt: -1 });
  res.json({ success: true, applications });
});

// @desc Get applications for a specific project (company/admin view)
// @route GET /api/applications/project/:projectId
const getApplicationsForProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.projectId);
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }
  if (project.company.toString() !== req.user._id.toString() && !["admin", "evaluator"].includes(req.user.role)) {
    res.status(403);
    throw new Error("Not authorized to view these applications");
  }

  // Companies can only view approved (verified) candidates. Admins/evaluators see all.
  const candidatePopulate =
    req.user.role === "company"
      ? { path: "candidate", match: { isVerified: true }, select: "name email skills experienceLevel resumeUrl" }
      : { path: "candidate", select: "name email skills experienceLevel resumeUrl" };

  const applications = await Application.find({ project: req.params.projectId })
    .populate(candidatePopulate)
    .sort({ createdAt: -1 });

  const visible =
    req.user.role === "company" ? applications.filter((a) => a.candidate) : applications;

  // Company visibility rule:
  // - Project-based hiring: candidates only reach the company after the MentriQ
  //   team reviews and forwards (shortlists) their profile.
  // - Direct jobs: candidates appear on the company page immediately after applying.
  if (req.user.role === "company") {
    const isDirectJob = project.applicationMode === "direct_hire";
    const data = isDirectJob
      ? visible
      : visible.filter((a) => FORWARDED_STATUSES.includes(a.status));
    return res.json({ success: true, applications: data });
  }

  res.json({ success: true, applications: visible });
});

// @desc Get all applications across jobs and project-based hiring (admin/evaluator)
// @route GET /api/applications/all?type=job|project&status=...&search=...
const getAllApplications = asyncHandler(async (req, res) => {
  const { type, status, search } = req.query;
  const { page, limit, skip } = getPagination(req.query, { defaultLimit: 20 });

  const query = {};
  if (type && type !== "all") {
    query.applicationType = type === "job" ? "direct_hire" : "project";
  }
  if (status && status !== "all") query.status = status;
  if (search) {
    const candidates = await User.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    })
      .select("_id")
      .lean();
    const projects = await Project.find({
      title: { $regex: search, $options: "i" },
    })
      .select("_id")
      .lean();
    const candidateIds = candidates.map((c) => c._id);
    const projectIds = projects.map((p) => p._id);
    query.$or = [];
    if (candidateIds.length) query.$or.push({ candidate: { $in: candidateIds } });
    if (projectIds.length) query.$or.push({ project: { $in: projectIds } });
    if (query.$or.length === 0) query.$or = [{ _id: null }];
  }

  const [applications, total] = await Promise.all([
    Application.find(query)
      .populate("candidate", "name email skills experienceLevel resumeUrl avatarUrl isVerified")
      .populate({
        path: "project",
        select: "title jobRole applicationMode company",
        populate: { path: "company", select: "name companyName industry" },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Application.countDocuments(query),
  ]);

  res.json({ success: true, applications, total, page, pages: Math.ceil(total / limit) });
});

// @desc Update application status (e.g., shortlist, reject, interview_scheduled, hired)
// @route PUT /api/applications/:id/status
const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = [
    "applied",
    "in_progress",
    "submitted",
    "under_review",
    "shortlisted",
    "rejected",
    "interview_scheduled",
    "hired",
  ];
  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error("Invalid status value");
  }

  const application = await Application.findById(req.params.id).populate("project");
  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }

  const isOwningCompany = application.project.company.toString() === req.user._id.toString();
  if (!isOwningCompany && !["admin", "evaluator"].includes(req.user.role)) {
    res.status(403);
    throw new Error("Not authorized to update this application");
  }

  application.status = status;
  await application.save();
  res.json({ success: true, application });
});

// @desc Evaluator shortlists a candidate application
// @route POST /api/applications/:id/shortlist
const shortlistApplication = asyncHandler(async (req, res) => {
  const applicationId = req.params.id;

  const application = await Application.findById(applicationId).populate("project");
  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }

  // Security: only evaluator, admin, or owning company can shortlist
  if (
    req.user.role !== "evaluator" &&
    req.user.role !== "admin" &&
    application.project.company.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error("Not authorized to shortlist this application");
  }

  // Eligibility: application must be in a reviewable state
  // Applications that are already shortlisted, rejected, or hired cannot be shortlisted again
  const terminalStatuses = ["shortlisted", "rejected", "hired"];
  if (terminalStatuses.includes(application.status)) {
    res.status(400);
    throw new Error(`Cannot shortlist application with status "${application.status}". Application must be under review first.`);
  }

  // Update status to shortlisted
  application.status = "shortlisted";
  await application.save();

  res.json({ success: true, application });
});

// @desc Get shortlist for project (enhanced)
// @route GET /api/evaluations/project/:projectId/shortlist
const getShortlistForProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.projectId);
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  // Security: only company owner, admin, or evaluator can view shortlist
  if (
    project.company.toString() !== req.user._id.toString() &&
    !["admin", "evaluator"].includes(req.user.role)
  ) {
    res.status(403);
    throw new Error("Not authorized to view shortlist for this project");
  }

  // Get applications that are shortlisted for this project
  const shortlistedApplications = await Application.find({
    project: req.params.projectId,
    status: "shortlisted",
  })
    .populate("candidate", "name email githubUsername linkedinUsername experienceLevel")
    .sort({ createdAt: -1 });

  res.json({ success: true, applications: shortlistedApplications });
});

// @desc Get shortlisted candidates for company's projects
// @route GET /api/company/applications/shortlisted
const getCompanyShortlistedApplications = asyncHandler(async (req, res) => {
  // Get all projects owned by this company
  const projects = await Project.find({ company: req.user._id }).select("_id");

  const projectIds = projects.map((p) => p._id);

  // Find all shortlisted applications for these projects
  const shortlistedApps = await Application.find({
    project: { $in: projectIds },
    status: "shortlisted",
  })
    .populate("candidate", "name email githubUsername linkedinUsername experienceLevel bio")
    .populate("project", "title domain applicationMode")
    .sort({ createdAt: -1 });

  res.json({ success: true, applications: shortlistedApps });
});

// @desc Get a shortlisted candidate for company review
// @route GET /api/company/applications/:id
const getCompanyApplicationDetail = asyncHandler(async (req, res) => {
  const applicationId = req.params.applicationId;

  const application = await Application.findById(applicationId)
    .populate("candidate", "name email githubUsername linkedinUsername bio experienceLevel skills githubProfile linkedinUrl portfolioUrl resumeUrl")
    .populate("project", "title domain applicationMode difficulty skillsRequired type deadline maxCandidates hiringGoal deliverables isPaidSlot")
    .populate("project.company", "companyName industry");

  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }

  // Security: only company owner or admin can view
  if (application.project.company.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to view this application");
  }

  // Get evaluation for this application
  const evaluation = await Evaluation.findOne({ application: applicationId });

  res.json({ success: true, application, evaluation });
});

// @desc Company updates application review status
// @route PUT /api/company/applications/:id/review
const companyUpdateApplicationReview = asyncHandler(async (req, res) => {
  const applicationId = req.params.applicationId;
  const { reviewStatus } = req.body; // e.g., "company_reviewing", "company_interview", "decision_pending"

  const application = await Application.findById(applicationId).populate("project");
  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }

  // Security: only company owner or admin can update
  if (application.project.company.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to update this application");
  }

  // Valid review statuses
  const validStatuses = ["company_reviewing", "company_interview", "decision_pending"];
  if (reviewStatus && !validStatuses.includes(reviewStatus)) {
    res.status(400);
    throw new Error(`Invalid review status. Must be one of: ${validStatuses.join(", ")}`);
  }

  // Terminal state protection: once hired or rejected, cannot change review status
  const terminalStatuses = ["hired", "rejected"];
  if (terminalStatuses.includes(application.status)) {
    res.status(400);
    throw new Error(`Cannot update review status. Application is already terminal (${application.status}).`);
  }

  if (reviewStatus) {
    application.status = reviewStatus;
  }

  await application.save();

  res.json({ success: true, application });
});

// @desc Company makes final hiring decision
// @route PUT /api/company/applications/:id/final-decision
const companyMakeFinalDecision = asyncHandler(async (req, res) => {
  const applicationId = req.params.applicationId;
  const { decision } = req.body; // "hired" or "rejected"

  const application = await Application.findById(applicationId).populate("project");
  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }

  // Security: only company owner or admin can make final decision
  if (application.project.company.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to make final decision for this application");
  }

  // Terminal state protection: cannot decide if already terminal
  if (application.status === "hired" || application.status === "rejected") {
    res.status(400);
    throw new Error(`Cannot make final decision. Application is already ${application.status}.`);
  }

  // Valid decisions
  const validDecisions = ["hired", "rejected"];
  if (!validDecisions.includes(decision)) {
    res.status(400);
    throw new Error(`Invalid decision. Must be one of: ${validDecisions.join(", ")}`);
  }

  // Apply the final decision
  application.status = decision;
  await application.save();

  res.json({ success: true, application });
});

// @desc Company schedules interview for shortlisted candidate
// @route POST /api/company/applications/:id/interview
const companyScheduleInterview = asyncHandler(async (req, res) => {
  const applicationId = req.params.applicationId;
  const { mode, date, startTime, endTime, location, meetingUrl, interviewType, instructions } = req.body;

  const application = await Application.findById(applicationId).populate("project");
  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }

  // Security: only company owner or admin can schedule
  if (application.project.company.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to schedule interview for this application");
  }

  // Validate based on mode
  if (mode === "online" && !meetingUrl) {
    res.status(400);
    throw new Error("Meeting URL is required for online interviews");
  }
  if (mode === "offline" && !location) {
    res.status(400);
    throw new Error("Location is required for offline interviews");
  }

  // Create interview
  const interview = await Interview.create({
    application: applicationId,
    candidate: application.candidate,
    interviewOwner: "company",
    mode,
    date: new Date(date),
    startTime,
    endTime,
    location: mode === "offline" ? location : "",
    meetingUrl: mode === "online" ? meetingUrl : "",
    interviewType: interviewType || "Company Review",
    instructions: instructions || "",
    createdBy: req.user._id,
  });

  // Update application status to interview_scheduled
  application.status = "interview_scheduled";
  await application.save();

  res.status(201).json({ success: true, interview, application });
});

module.exports = {
  applyToProject,
  getMyApplications,
  getApplicationsForProject,
  getAllApplications,
  updateApplicationStatus,
  shortlistApplication,
  getShortlistForProject,
  getCompanyShortlistedApplications,
  getCompanyApplicationDetail,
  companyUpdateApplicationReview,
  companyMakeFinalDecision,
  companyScheduleInterview,
};