const asyncHandler = require("express-async-handler");
const Project = require("../models/Project");
const Application = require("../models/Application");
const { getPagination } = require("../utils/pagination");

// @desc Create a project (company only)
// @route POST /api/projects
const createProject = asyncHandler(async (req, res) => {
  const { title, description, jobDescription, requirements, skillsRequired, domain, difficulty, type, deliverables, durationDays, hiringGoal, salary, salaryMin, salaryMax, workLocation, experienceRequired, customExperience, isDirectHire, acceptApplications, status } = req.body;

  // Validate required fields
  if (!title?.trim()) {
    res.status(400);
    throw new Error("Job title is required");
  }
  if (!description?.trim()) {
    res.status(400);
    throw new Error("Job description is required");
  }
  const skillsValue = Array.isArray(skillsRequired) ? skillsRequired.join(",") : skillsRequired;
  if (!skillsValue?.trim()) {
    res.status(400);
    throw new Error("At least one skill is required");
  }
  if (!durationDays || Number(durationDays) < 1) {
    res.status(400);
    throw new Error("Duration must be at least 1 day");
  }
  if (!hiringGoal || Number(hiringGoal) < 1) {
    res.status(400);
    throw new Error("Hiring goal must be at least 1");
  }

  const isDirectHireValue = Boolean(isDirectHire);
  const applicationMode = isDirectHireValue ? "direct_hire" : "project";
  const normalizedStatus = acceptApplications !== false && status !== "closed" ? "open" : "closed";

  const project = await Project.create({
    company: req.user._id,
    title: title.trim(),
    jobRole: req.body.jobRole || title.trim(),
    description: description.trim(),
    jobDescription: jobDescription?.trim() || description.trim(),
    requirements: Array.isArray(req.body.requirements)
      ? req.body.requirements
      : (req.body.requirements || "").split(",").map((s) => s.trim()).filter(Boolean),
    skillsRequired: Array.isArray(req.body.skillsRequired)
      ? req.body.skillsRequired
      : (req.body.skillsRequired || "").split(",").map((s) => s.trim()).filter(Boolean),
    domain: domain || "Full Stack",
    difficulty: difficulty || "intermediate",
    type: type || "simulated",
    deliverables: Array.isArray(req.body.deliverables)
      ? req.body.deliverables
      : (req.body.deliverables || "").split(",").map((s) => s.trim()).filter(Boolean),
    durationDays: Number(durationDays),
    hiringGoal: Number(hiringGoal),
    salary: salary || "Negotiable",
    salaryMin: salaryMin ? Number(salaryMin) : null,
    salaryMax: salaryMax ? Number(salaryMax) : null,
    workLocation: workLocation || "",
    experienceRequired: experienceRequired || "fresher",
    customExperience: customExperience || "",
isDirectHireValue,
    applicationMode,
    status: normalizedStatus,
  });
  res.status(201).json({ success: true, project });
});

// @desc Get all projects (public listing, with filters)
// @route GET /api/projects
const getProjects = asyncHandler(async (req, res) => {
  const { domain, difficulty, status, search } = req.query;
  const { page, limit, skip } = getPagination(req.query, { defaultLimit: 12 });

  const query = {};
  if (domain) query.domain = domain;
  if (difficulty) query.difficulty = difficulty;
  if (status && status !== "all") {
    query.status = status;
  } else if (!status) {
    query.status = "open";
  }
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { skillsRequired: { $regex: search, $options: "i" } },
    ];
  }

  const [projects, total] = await Promise.all([
Project.find(query)
      .select("title jobRole description applicationMode salary salaryMin salaryMax workLocation durationDays hiringGoal maxCandidates skillsRequired requirements deliverables deadline status company createdAt")
      .populate("company", "name companyName industry")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Project.countDocuments(query),
  ]);

  res.json({
    success: true,
    projects,
    total,
    page,
    pages: Math.ceil(total / limit),
  });
});

// @desc Get single project
// @route GET /api/projects/:id
const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).populate(
    "company",
    "name companyName industry website"
  );
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }
  res.json({ success: true, project });
});

// @desc Update project (owning company only)
// @route PUT /api/projects/:id
const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }
  if (project.company.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to modify this project");
  }

  // Prevent role changes and ownership transfer via update
  if (req.body.company && req.body.company.toString() !== project.company.toString()) {
    res.status(403);
    throw new Error("Cannot transfer project ownership");
  }

  // Only allow relevant fields to be updated
  if (req.body.title !== undefined) project.title = req.body.title.trim();
  if (req.body.jobRole !== undefined) project.jobRole = req.body.jobRole.trim();
  if (req.body.description !== undefined) project.description = req.body.description.trim();
  if (req.body.jobDescription !== undefined) project.jobDescription = req.body.jobDescription?.trim();
  if (req.body.requirements !== undefined) {
    project.requirements = Array.isArray(req.body.requirements)
      ? req.body.requirements
      : req.body.requirements.split(",").map((s) => s.trim()).filter(Boolean);
  }
  if (req.body.skillsRequired !== undefined) {
    project.skillsRequired = Array.isArray(req.body.skillsRequired)
      ? req.body.skillsRequired
      : req.body.skillsRequired.split(",").map((s) => s.trim()).filter(Boolean);
  }
  if (req.body.domain !== undefined) project.domain = req.body.domain;
  if (req.body.difficulty !== undefined) project.difficulty = req.body.difficulty;
  if (req.body.type !== undefined) project.type = req.body.type;
  if (req.body.deliverables !== undefined) {
    project.deliverables = Array.isArray(req.body.deliverables)
      ? req.body.deliverables
      : req.body.deliverables.split(",").map((s) => s.trim()).filter(Boolean);
  }
  if (req.body.durationDays !== undefined) project.durationDays = Number(req.body.durationDays);
  if (req.body.hiringGoal !== undefined) project.hiringGoal = Number(req.body.hiringGoal);
  if (req.body.salary !== undefined) project.salary = req.body.salary || "Negotiable";
  if (req.body.salaryMin !== undefined) project.salaryMin = req.body.salaryMin ? Number(req.body.salaryMin) : null;
  if (req.body.salaryMax !== undefined) project.salaryMax = req.body.salaryMax ? Number(req.body.salaryMax) : null;
  if (req.body.workLocation !== undefined) project.workLocation = req.body.workLocation;
  if (req.body.experienceRequired !== undefined) project.experienceRequired = req.body.experienceRequired;
  if (req.body.customExperience !== undefined) project.customExperience = req.body.customExperience;
  if (req.body.isDirectHire !== undefined) {
    project.isDirectHire = Boolean(req.body.isDirectHire);
    project.applicationMode = project.isDirectHire ? "direct_hire" : "project";
  }
  if (req.body.experienceRequired !== undefined) project.experienceRequired = req.body.experienceRequired;
  if (req.body.customExperience !== undefined) project.customExperience = req.body.customExperience;
  if (req.body.acceptApplications !== undefined) {
    // Update status based on acceptApplications
    project.status = req.body.acceptApplications !== false && req.body.status !== "closed" ? "open" : "closed";
  }
  if (req.body.status !== undefined) {
    // Allow explicit status change (e.g., open/closed/archived)
    project.status = req.body.status;
  }

  const updated = await project.save();
  res.json({ success: true, project: updated });
});

// @desc Delete / archive project (soft delete)
// @route DELETE /api/projects/:id
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }
  if (project.company.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to delete this project");
  }
  project.status = "archived";
  project.isDeleted = true;
  project.deletedAt = new Date();
  project.deletedBy = req.user._id;
  await project.save();
  res.json({ success: true, message: "Project deleted" });
});

// @desc Get projects posted by the logged-in company
// @route GET /api/projects/my/company
const getMyCompanyProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ company: req.user._id, isDeleted: { $ne: true } })
    .sort({ createdAt: -1 })
    .lean();

  // Single aggregate instead of one count query per project (N+1)
  const counts = await Application.aggregate([
    { $match: { project: { $in: projects.map((p) => p._id) } } },
    { $group: { _id: "$project", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

  const withCounts = projects.map((p) => ({ ...p, applicantCount: countMap.get(String(p._id)) || 0 }));

  res.json({ success: true, projects: withCounts });
});

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getMyCompanyProjects,
};
