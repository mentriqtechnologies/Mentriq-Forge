const asyncHandler = require("express-async-handler");
const Project = require("../models/Project");
const Application = require("../models/Application");
const { getPagination } = require("../utils/pagination");

// @desc Create a project (company only)
// @route POST /api/projects
const createProject = asyncHandler(async (req, res) => {
  const normalizedStatus = req.body.status || (req.body.status === "closed" ? "closed" : "open");
  const isDirectHire = Boolean(req.body.isDirectHire);
  const project = await Project.create({
    ...req.body,
    company: req.user._id,
    title: req.body.title?.trim() || req.body.jobRole?.trim() || "New Job",
    jobRole: req.body.jobRole || req.body.title,
    description: req.body.description || req.body.jobDescription || req.body.jobRole || req.body.title,
    jobDescription: req.body.jobDescription || req.body.description,
    requirements: Array.isArray(req.body.requirements)
      ? req.body.requirements
      : (req.body.requirements || "").split(",").map((s) => s.trim()).filter(Boolean),
    skillsRequired: Array.isArray(req.body.skillsRequired)
      ? req.body.skillsRequired
      : (req.body.skillsRequired || "").split(",").map((s) => s.trim()).filter(Boolean),
    salary: req.body.salary || (req.body.salaryMin && req.body.salaryMax ? `₹${req.body.salaryMin} - ₹${req.body.salaryMax}` : "Negotiable"),
    salaryMin: req.body.salaryMin ? Number(req.body.salaryMin) : null,
    salaryMax: req.body.salaryMax ? Number(req.body.salaryMax) : null,
    workLocation: req.body.workLocation || "",
    isDirectHire,
    applicationMode: isDirectHire ? "direct_hire" : "project",
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

  if (req.body.jobRole) project.jobRole = req.body.jobRole;
  if (req.body.jobDescription) project.jobDescription = req.body.jobDescription;
  if (req.body.description) project.description = req.body.description;
  if (req.body.requirements) {
    project.requirements = Array.isArray(req.body.requirements)
      ? req.body.requirements
      : req.body.requirements.split(",").map((s) => s.trim()).filter(Boolean);
  }
  if (req.body.salary) project.salary = req.body.salary;
  if (req.body.salaryMin !== undefined) project.salaryMin = req.body.salaryMin;
  if (req.body.salaryMax !== undefined) project.salaryMax = req.body.salaryMax;
  if (req.body.workLocation !== undefined) project.workLocation = req.body.workLocation;
  if (req.body.isDirectHire !== undefined) {
    project.isDirectHire = Boolean(req.body.isDirectHire);
    project.applicationMode = project.isDirectHire ? "direct_hire" : "project";
  }
  if (req.body.experienceRequired) project.experienceRequired = req.body.experienceRequired;
  if (req.body.customExperience !== undefined) project.customExperience = req.body.customExperience;

  Object.assign(project, req.body);
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
