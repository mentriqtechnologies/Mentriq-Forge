const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Project = require("../models/Project");
const Application = require("../models/Application");
const Submission = require("../models/Submission");
const Evaluation = require("../models/Evaluation");
const User = require("../models/User");

// @desc Company dashboard stats
// @route GET /api/dashboard/company
const getCompanyDashboard = asyncHandler(async (req, res) => {
  const projects = await Project.find({ company: req.user._id });
  const projectIds = projects.map((p) => p._id);

  const [totalApplications, shortlisted, hired] = await Promise.all([
    Application.countDocuments({ project: { $in: projectIds } }),
    Application.countDocuments({ project: { $in: projectIds }, status: "shortlisted" }),
    Application.countDocuments({ project: { $in: projectIds }, status: "hired" }),
  ]);

  res.json({
    success: true,
    stats: {
      totalProjects: projects.length,
      openProjects: projects.filter((p) => p.status === "open").length,
      totalApplications,
      shortlisted,
      hired,
    },
  });
});

// @desc Candidate dashboard stats
// @route GET /api/dashboard/candidate
const getCandidateDashboard = asyncHandler(async (req, res) => {
  const applications = await Application.find({ candidate: req.user._id });
  const submissions = await Submission.countDocuments({ candidate: req.user._id });

  res.json({
    success: true,
    stats: {
      totalApplications: applications.length,
      inProgress: applications.filter((a) => ["applied", "in_progress"].includes(a.status)).length,
      submitted: submissions,
      shortlisted: applications.filter((a) => a.status === "shortlisted").length,
      hired: applications.filter((a) => a.status === "hired").length,
    },
  });
});

// @desc Admin/evaluator dashboard - platform-wide stats
// @route GET /api/dashboard/admin
const getAdminDashboard = asyncHandler(async (req, res) => {
  const [totalUsers, totalCandidates, totalCompanies, totalProjects, pendingReviews, totalHires, totalJobs, totalDeletedItems, totalActiveCompanies, totalDeletedJobs, totalDeletedProjects, totalActiveJobs, totalActiveProjects, totalApplications, totalProjectsAll, totalJobsAll, companies] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "candidate" }),
      User.countDocuments({ role: "company" }),
      Project.countDocuments({ isDeleted: { $ne: true } }),
      Submission.countDocuments({ status: "pending_review" }),
      Application.countDocuments({ status: "hired" }),
      Project.countDocuments({ applicationMode: "direct_hire", isDeleted: { $ne: true } }),
      Project.countDocuments({ isDeleted: true }),
      User.countDocuments({ role: "company", isActive: true }),
      Project.countDocuments({ applicationMode: "direct_hire", isDeleted: true }),
      Project.countDocuments({ applicationMode: "project", isDeleted: true }),
      Project.countDocuments({ applicationMode: "direct_hire", isDeleted: { $ne: true }, status: "open" }),
      Project.countDocuments({ applicationMode: "project", isDeleted: { $ne: true }, status: "open" }),
      Application.countDocuments(),
      Project.countDocuments({ applicationMode: "project" }),
      Project.countDocuments({ applicationMode: "direct_hire" }),
      User.find({ role: "company" }).select("_id name companyName industry").sort({ createdAt: -1 }),
    ]);

  const companyPipeline = await Promise.all(
    companies.map(async (company) => {
      const companyProjects = await Project.find({ company: company._id, isDeleted: { $ne: true } }).select("_id");
      const companyAllProjects = await Project.find({ company: company._id }).select("_id");
      const projectIds = companyAllProjects.map((project) => project._id);

      const [totalApplications, shortlisted, hired, inProgress, submitted, rejected, interviewScheduled, pendingCompanyReviews] =
        await Promise.all([
          Application.countDocuments({ project: { $in: projectIds } }),
          Application.countDocuments({ project: { $in: projectIds }, status: "shortlisted" }),
          Application.countDocuments({ project: { $in: projectIds }, status: "hired" }),
          Application.countDocuments({ project: { $in: projectIds }, status: { $in: ["applied", "in_progress"] } }),
          Application.countDocuments({ project: { $in: projectIds }, status: "submitted" }),
          Application.countDocuments({ project: { $in: projectIds }, status: "rejected" }),
          Application.countDocuments({ project: { $in: projectIds }, status: "interview_scheduled" }),
          Submission.countDocuments({ project: { $in: projectIds }, status: "pending_review" }),
        ]);

      let currentStage = "No Activity";
      if (hired > 0) currentStage = "Hired";
      else if (shortlisted > 0) currentStage = "Shortlisted";
      else if (interviewScheduled > 0) currentStage = "Interview";
      else if (submitted > 0) currentStage = "Submitted";
      else if (inProgress > 0) currentStage = "In Progress";
      else if (totalApplications > 0) currentStage = "Applied";

      return {
        _id: company._id,
        companyName: company.companyName || company.name,
        industry: company.industry,
        totalProjects: companyProjects.length,
        totalApplications,
        shortlisted,
        hired,
        inProgress,
        submitted,
        rejected,
        interviewScheduled,
        pendingCompanyReviews,
        currentStage,
      };
    })
  );

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalCandidates,
      totalCompanies,
      totalProjects,
      pendingReviews,
      totalHires,
      totalJobs,
      totalDeletedItems,
      totalActiveCompanies,
      totalDeletedJobs,
      totalDeletedProjects,
      totalActiveJobs,
      totalActiveProjects,
      totalApplications,
      totalProjectsAll,
      totalJobsAll,
      companyPipeline,
    },
  });
});

// @desc Get all submissions for a company's projects with GitHub analytics
// @route GET /api/dashboard/company/submissions
const getCompanySubmissions = asyncHandler(async (req, res) => {
  const projects = await Project.find({ company: req.user._id }).select("_id");
  const projectIds = projects.map((p) => p._id);

  const submissions = await Submission.find({ project: { $in: projectIds } })
    .populate("candidate", "name email githubUsername githubAvatar githubProfile githubConnectedAt")
    .populate("project", "title domain")
    .populate("application", "status")
    .sort({ createdAt: -1 });

  const data = submissions.map((s) => ({
    _id: s._id,
    projectTitle: s.project?.title,
    projectDomain: s.project?.domain,
    applicationStatus: s.application?.status,
    submittedAt: s.submittedAt,
    candidate: s.candidate,
    linkedRepoName: s.linkedRepoName,
    linkedRepoUrl: s.linkedRepoUrl,
    repoAnalytics: {
      totalCommits: s.repoAnalytics?.totalCommits,
      lastCommitDate: s.repoAnalytics?.lastCommitDate,
      commitTimeline: s.repoAnalytics?.commitTimeline,
      languages: s.repoAnalytics?.languages,
    },
  }));

  res.json({ success: true, submissions: data });
});

module.exports = { getCompanyDashboard, getCandidateDashboard, getAdminDashboard, getCompanySubmissions };
