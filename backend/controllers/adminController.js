const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Project = require("../models/Project");
const Application = require("../models/Application");
const Submission = require("../models/Submission");
const Evaluation = require("../models/Evaluation");
const Interview = require("../models/Interview");
const { getPagination } = require("../utils/pagination");
const { deleteUserWithCascade } = require("../utils/userCascade");

// @desc Admin creates an evaluator or admin account
// @route POST /api/admin/users
const createStaffUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!["evaluator", "admin"].includes(role)) {
    res.status(400);
    throw new Error("Staff accounts must be created with role 'evaluator' or 'admin'");
  }

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error("A user with this email already exists");
  }

  const user = await User.create({ name, email, password, role });
  res.status(201).json({ success: true, user: user.toSafeObject() });
});

// @desc List all users (admin only)
// @route GET /api/admin/users
const getAllUsers = asyncHandler(async (req, res) => {
  const { role, search } = req.query;
  const { page, limit, skip } = getPagination(req.query);

  const query = {};
  if (role) query.role = role;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { companyName: { $regex: search, $options: "i" } },
    ];
  }

  const [users, total] = await Promise.all([
User.find(query)
      .select("-password -resetPasswordToken -resetPasswordExpire")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments({}),
  ]);

  res.json({
    success: true,
    users,
    total,
    page,
    pages: Math.ceil(total / limit),
  });
});

// @desc Activate or deactivate a user account
// @route PUT /api/admin/users/:id/status
const setUserActiveStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;

  if (req.params.id === req.user._id.toString()) {
    res.status(400);
    throw new Error("You cannot change your own account status");
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.isActive = Boolean(isActive);
  await user.save();
  res.json({ success: true, user: user.toSafeObject() });
});

// @desc Delete a user account (cascades through all data owned by the user)
// @route DELETE /api/admin/users/:id
const deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    res.status(400);
    throw new Error("You cannot delete your own account");
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  await deleteUserWithCascade(user);
  res.json({ success: true, message: "User deleted successfully" });
});

// @desc Admin get all projects (including deleted, with search/filter)
// @route GET /api/admin/projects
const getAdminProjects = asyncHandler(async (req, res) => {
  const { search, status, type } = req.query;
  const { page, limit, skip } = getPagination(req.query);
  const query = {};
  if (status && status !== "all") query.status = status;
  if (type) query.applicationMode = type;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { jobRole: { $regex: search, $options: "i" } },
    ];
  }
  const [projects, total] = await Promise.all([
    Project.find(query)
      .populate("company", "name companyName email industry")
      .populate("deletedBy", "name companyName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Project.countDocuments(query),
  ]);
  res.json({ success: true, projects, total, page, pages: Math.ceil(total / limit) });
});

// @desc Admin soft delete any project
// @route DELETE /api/admin/projects/:id
const adminDeleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }
  project.status = "archived";
  project.isDeleted = true;
  project.deletedAt = new Date();
  project.deletedBy = req.user._id;
  await project.save();
  res.json({ success: true, message: "Project deleted" });
});

// @desc Get all deleted items (projects/jobs) for Deleted Reports
// @route GET /api/admin/deleted-items
const getDeletedItems = asyncHandler(async (req, res) => {
  const { search, type } = req.query;
  const { page, limit, skip } = getPagination(req.query);
  const query = { isDeleted: true };
  if (type && type !== "all") {
    if (type === "job") query.applicationMode = "direct_hire";
    else if (type === "project") query.applicationMode = "project";
  }
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { jobRole: { $regex: search, $options: "i" } },
    ];
  }
  const [items, total] = await Promise.all([
    Project.find(query)
      .populate("company", "name companyName email")
      .populate("deletedBy", "name companyName role")
      .sort({ deletedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Project.countDocuments(query),
  ]);
  const data = items.map((item) => ({
    _id: item._id,
    companyName: item.company?.companyName || item.company?.name || "Unknown",
    company: item.company,
    title: item.title,
    type: item.applicationMode === "direct_hire" ? "Job" : "Project",
    postedDate: item.createdAt,
    deletedDate: item.deletedAt,
    status: item.status,
    deletedBy: item.deletedBy,
    deletedByName: item.deletedBy?.companyName || item.deletedBy?.name || "Unknown",
  }));
  res.json({ success: true, items: data, total, page, pages: Math.ceil(total / limit) });
});

// @desc Restore a deleted item
// @route PUT /api/admin/deleted-items/:id/restore
const restoreDeletedItem = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error("Item not found");
  }
  project.isDeleted = false;
  project.deletedAt = undefined;
  project.deletedBy = undefined;
  project.status = "open";
  await project.save();
  res.json({ success: true, message: "Item restored", project });
});

// @desc Permanently delete an item (cascades through applicants' data for that item)
// @route DELETE /api/admin/deleted-items/:id/permanent
const permanentDeleteItem = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error("Item not found");
  }
  const submissions = await Submission.find({ project: project._id }).select("_id");
  await Evaluation.deleteMany({ submission: { $in: submissions.map((s) => s._id) } });
  await Submission.deleteMany({ project: project._id });
  await Application.deleteMany({ project: project._id });
  await project.deleteOne();
  res.json({ success: true, message: "Item permanently deleted" });
});

// @desc Admin dashboard analytics
// @route GET /api/admin/analytics
const getAdminAnalytics = asyncHandler(async (req, res) => {
  const [
    totalCompanies,
    totalActiveCompanies,
    totalJobs,
    totalProjects,
    totalDeletedJobs,
    totalDeletedProjects,
    totalActiveJobs,
    totalActiveProjects,
    totalHired,
    totalApplications,
  ] = await Promise.all([
    User.countDocuments({ role: "company" }),
    User.countDocuments({ role: "company", isActive: true }),
    Project.countDocuments({ applicationMode: "direct_hire" }),
    Project.countDocuments({ applicationMode: "project" }),
    Project.countDocuments({ applicationMode: "direct_hire", isDeleted: true }),
    Project.countDocuments({ applicationMode: "project", isDeleted: true }),
    Project.countDocuments({ applicationMode: "direct_hire", isDeleted: { $ne: true }, status: "open" }),
    Project.countDocuments({ applicationMode: "project", isDeleted: { $ne: true }, status: "open" }),
    Application.countDocuments({ status: "hired" }),
    Application.countDocuments(),
  ]);
  res.json({
    success: true,
    stats: {
      totalCompanies,
      totalActiveCompanies,
      totalJobs,
      totalProjects,
      totalDeletedJobs,
      totalDeletedProjects,
      totalActiveJobs,
      totalActiveProjects,
      totalHired,
      totalApplications,
    },
  });
});

// @desc Get hired candidates with complete hiring details
// @route GET /api/admin/hired-candidates
const getHiredCandidates = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const { page, limit, skip } = getPagination(req.query);
  const query = { status: "hired" };
  if (search) {
    query.$or = [
      { applicantName: { $regex: search, $options: "i" } },
    ];
  }
  const [applications, total] = await Promise.all([
    Application.find(query)
      .populate("candidate", "name email skills experienceLevel")
      .populate({
        path: "project",
        select: "title jobRole applicationMode company",
        populate: { path: "company", select: "name companyName industry" },
      })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Application.countDocuments(query),
  ]);

  const applicationIds = applications.map((a) => a._id);
  const evaluations = await Evaluation.find({ application: { $in: applicationIds } })
    .populate("evaluator", "name")
    .lean();

  const evaluationByApp = new Map();
  evaluations.forEach((ev) => {
    if (!evaluationByApp.has(String(ev.application))) evaluationByApp.set(String(ev.application), []);
    evaluationByApp.get(String(ev.application)).push(ev);
  });

  const data = applications.map((app) => ({
    _id: app._id,
    candidateName: app.candidate?.name || app.applicantName,
    candidateEmail: app.candidate?.email,
    candidateSkills: app.candidate?.skills || [],
    projectTitle: app.project?.title,
    jobRole: app.project?.jobRole,
    projectType: app.project?.applicationMode === "direct_hire" ? "job" : "project",
    companyName: app.project?.company?.companyName || app.project?.company?.name,
    company: app.project?.company,
    hiredAt: getHiredAt(app),
    hiredBy: app.statusHistory?.find((h) => h.status === "hired")?.byRole || null,
    journey: app.statusHistory || [],
    evaluations: (evaluationByApp.get(String(app._id)) || []).map((ev) => ({
      _id: ev._id,
      recommendation: ev.recommendation,
      overallScore: ev.overallScore,
      feedback: ev.feedback,
      evaluatorName: ev.evaluator?.name,
      createdAt: ev.createdAt,
    })),
  }));
  res.json({ success: true, items: data, total, page, pages: Math.ceil(total / limit) });
});

// @desc Get full hiring record for one candidate (journey, evaluations, submission, interviews)
// @route GET /api/admin/hired-candidates/:id
const getHiredCandidateDetail = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate("candidate", "name email phone bio skills experienceLevel resumeUrl portfolioLinks githubUsername linkedinUrl")
    .populate({
      path: "project",
      select: "title jobRole domain applicationMode deadline status company deliverables",
      populate: { path: "company", select: "name companyName industry" },
    })
    .populate("statusHistory.by", "name role companyName");

  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }
  if (application.status !== "hired") {
    res.status(400);
    throw new Error("This application is not hired");
  }

  const [evaluations, submission, interviews] = await Promise.all([
    Evaluation.find({ application: application._id })
      .populate("evaluator", "name")
      .sort({ createdAt: -1 }),
    Submission.findOne({ application: application._id }),
    Interview.find({ application: application._id }).sort({ createdAt: -1 }),
  ]);

  res.json({
    success: true,
    application,
    evaluations,
    submission,
    interviews,
    hiredAt: getHiredAt(application),
  });
});

const getHiredAt = (application) => {
  const entry = (application.statusHistory || []).find((h) => h.status === "hired");
  return entry?.at || application.updatedAt;
};

module.exports = {
  createStaffUser,
  getAllUsers,
  setUserActiveStatus,
  deleteUser,
  getAdminProjects,
  adminDeleteProject,
  getDeletedItems,
  restoreDeletedItem,
  permanentDeleteItem,
  getAdminAnalytics,
  getHiredCandidates,
  getHiredCandidateDetail,
};
