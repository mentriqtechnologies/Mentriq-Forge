const asyncHandler = require("express-async-handler");
const Application = require("../models/Application");
const Project = require("../models/Project");

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

  const applications = await Application.find({ project: req.params.projectId })
    .populate("candidate", "name email skills experienceLevel resumeUrl")
    .sort({ createdAt: -1 });

  res.json({ success: true, applications });
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
  updateApplicationStatus,
};
