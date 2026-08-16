const asyncHandler = require("express-async-handler");
const Application = require("../models/Application");
const Project = require("../models/Project");
const User = require("../models/User");
const Evaluation = require("../models/Evaluation");
const Interview = require("../models/Interview");
const { getPagination } = require("../utils/pagination");
const { getMissingProfileFields } = require("../utils/profileCompleteness");

// Application statuses the MentriQ team uses to forward a profile to the company
// (includes the company's own pipeline stages, which are only reachable after forwarding).
const FORWARDED_STATUSES = [
  "shortlisted",
  "company_reviewing",
  "company_interview",
  "decision_pending",
  "interview_scheduled",
  "hired",
];

// Statuses a candidate can be in before the evaluator has decided on the profile.
const EVALUATOR_REVIEW_STATUSES = ["applied", "in_progress", "submitted", "under_review"];

// Central status transition helper: records every stage of the candidate's journey
// with the acting user and role, so Admin (and every other role) can track the
// complete history of the recruitment process.
const recordStatus = async (application, status, user) => {
  application.status = status;
  application.statusHistory.push({
    status,
    at: new Date(),
    by: user._id,
    byRole: user.role,
  });
  await application.save();
  return application;
};

// @desc Candidate applies / enrolls to a project
// @route POST /api/applications
const applyToProject = asyncHandler(async (req, res) => {
  const { projectId, applicantName, mobileNumber, qualification, resumeDriveLink } = req.body;
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

  // Profile completeness gate: candidates must complete their profile before applying
  const missingProfile = getMissingProfileFields(req.user);
  if (missingProfile.length > 0) {
    res.status(400);
    throw new Error(`Complete your profile before applying. Missing: ${missingProfile.join(", ")}`);
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
    statusHistory: [{ status: "applied", at: new Date(), by: req.user._id, byRole: req.user.role }],
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

// @desc Get a single application with full context (evaluator/admin/owning company/candidate)
// @route GET /api/applications/:id
const getApplicationDetail = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate("candidate", "name email phone bio avatarUrl skills experienceLevel resumeUrl portfolioLinks githubUsername linkedinUrl githubProfile")
    .populate("project", "title jobRole domain applicationMode difficulty skillsRequired deadline status maxCandidates deliverables isDirectHire")
    .populate("project.company", "name companyName industry");

  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }

  const role = req.user.role;
  const isCandidateOwner = role === "candidate" && application.candidate._id.toString() === req.user._id.toString();
  const isOwningCompany = role === "company" && application.project.company._id.toString() === req.user._id.toString();
  if (!isCandidateOwner && !isOwningCompany && !["evaluator", "admin"].includes(role)) {
    res.status(403);
    throw new Error("Not authorized to view this application");
  }

  // Companies can only view approved (verified) candidates and, for project-based
  // hiring, only profiles the MentriQ team has forwarded to them.
  if (role === "company") {
    if (!application.candidate.isVerified) {
      res.status(403);
      throw new Error("Not authorized to view this application");
    }
    const isDirectJob = application.project.applicationMode === "direct_hire";
    if (!isDirectJob && !FORWARDED_STATUSES.includes(application.status)) {
      res.status(403);
      throw new Error("This profile is still under review by the MentriQ team");
    }
  }

  const [evaluation, interviews] = await Promise.all([
    Evaluation.findOne({ application: application._id }),
    Interview.find({ application: application._id }).sort({ createdAt: -1 }),
  ]);

  res.json({ success: true, application, evaluation, interviews });
});

// @desc Update application status (role-scoped pipeline control)
// @route PUT /api/applications/:id/status
const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = [
    "applied",
    "in_progress",
    "submitted",
    "under_review",
    "shortlisted",
    "company_reviewing",
    "company_interview",
    "decision_pending",
    "interview_scheduled",
    "rejected",
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

  // Enterprise pipeline rules:
  // - "shortlisted" is the Evaluator's forward gate (see shortlistApplication).
  //   Companies cannot move a project-based candidate into this state themselves.
  // - "hired" is the Company's exclusive final decision (see companyMakeFinalDecision).
  if (req.user.role === "company" && status === "shortlisted") {
    res.status(403);
    throw new Error("Profiles are forwarded to the company by the evaluation team only");
  }
  if (status === "hired" && req.user.role !== "company") {
    res.status(403);
    throw new Error("Only the company can officially hire a candidate");
  }

  await recordStatus(application, status, req.user);
  res.json({ success: true, application });
});

// @desc Evaluator forwards a candidate profile to the company (project-based hiring)
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

  await recordStatus(application, "shortlisted", req.user);
  res.json({ success: true, application });
});

// @desc Evaluator/Admin rejects a project-based application (terminal decision)
// @route POST /api/applications/:id/reject
const rejectApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id).populate("project");
  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }

  if (["hired", "rejected"].includes(application.status)) {
    res.status(400);
    throw new Error(`Cannot reject application with status "${application.status}"`);
  }

  await recordStatus(application, "rejected", req.user);
  res.json({ success: true, application });
});

// @desc Evaluator's project-based application review queue
//       Project-based applications are reviewed by the evaluation team and only
//       forwarded to the company once the evaluator decides the profile is suitable.
// @route GET /api/applications/queue?stage=to_review|forwarded|decided&status=...&search=...
const getEvaluatorApplicationQueue = asyncHandler(async (req, res) => {
  const { stage, status, search } = req.query;
  const { page, limit, skip } = getPagination(req.query, { defaultLimit: 20 });

  const query = { applicationType: "project" };
  if (status && status !== "all") {
    query.status = status;
  } else if (stage === "forwarded") {
    query.status = { $in: FORWARDED_STATUSES };
  } else if (stage === "decided") {
    query.status = { $in: ["hired", "rejected"] };
  } else {
    query.status = { $in: EVALUATOR_REVIEW_STATUSES };
  }

  if (search) {
    const candidates = await User.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    })
      .select("_id")
      .lean();
    const candidateIds = candidates.map((c) => c._id);
    query.$or = [];
    if (candidateIds.length) query.$or.push({ candidate: { $in: candidateIds } });
    if (query.$or.length === 0) query.$or = [{ _id: null }];
  }

  const [applications, total] = await Promise.all([
    Application.find(query)
      .populate("candidate", "name email skills experienceLevel avatarUrl isVerified")
      .populate({
        path: "project",
        select: "title jobRole domain applicationMode company",
        populate: { path: "company", select: "name companyName industry" },
      })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Application.countDocuments(query),
  ]);

  res.json({ success: true, applications, total, page, pages: Math.ceil(total / limit) });
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

  // Visibility gate: companies may only see approved (verified) candidates whose
  // profiles the evaluation team has forwarded (project-based hiring).
  if (req.user.role === "company") {
    if (!application.candidate?.isVerified) {
      res.status(403);
      throw new Error("Not authorized to view this application");
    }
    const isDirectJob = application.project.applicationMode === "direct_hire";
    if (!isDirectJob && !FORWARDED_STATUSES.includes(application.status)) {
      res.status(403);
      throw new Error("This profile is still under review by the evaluation team");
    }
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
    await recordStatus(application, reviewStatus, req.user);
  } else {
    await application.save();
  }

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
  await recordStatus(application, decision, req.user);

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
  await recordStatus(application, "interview_scheduled", req.user);

  res.status(201).json({ success: true, interview, application });
});

module.exports = {
  applyToProject,
  getMyApplications,
  getApplicationsForProject,
  getAllApplications,
  getApplicationDetail,
  getEvaluatorApplicationQueue,
  updateApplicationStatus,
  shortlistApplication,
  rejectApplication,
  recordStatus,
  getShortlistForProject,
  getCompanyShortlistedApplications,
  getCompanyApplicationDetail,
  companyUpdateApplicationReview,
  companyMakeFinalDecision,
  companyScheduleInterview,
};