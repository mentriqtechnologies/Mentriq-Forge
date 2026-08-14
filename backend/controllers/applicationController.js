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
  const { projectId, applicantName, mobileNumber, qualification, resumeDriveLink } = req.body;

  const project = await Project.findById(projectId);
  if (!project || project.status !== "open") {
    res.status(400);
    throw new Error("This role is not open for applications");
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

module.exports = {
  applyToProject,
  getMyApplications,
  getApplicationsForProject,
  getAllApplications,
  updateApplicationStatus,
};
