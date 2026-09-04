const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Project = require("../models/Project");
const Application = require("../models/Application");
const Submission = require("../models/Submission");
const Evaluation = require("../models/Evaluation");
const Interview = require("../models/Interview");
const User = require("../models/User");
const { FORWARDED_STATUSES } = require("./applicationController");

// Review-turnaround commitment: pending submissions older than this many days
// are surfaced as "overdue" on the evaluator dashboard.
const EVALUATOR_SLA_DAYS = 7;

// @desc Company dashboard stats
// @route GET /api/dashboard/company
const getCompanyDashboard = asyncHandler(async (req, res) => {
  const projects = await Project.find({ company: req.user._id });
  const projectIds = projects.map((p) => p._id);

  const directProjectIds = projects
    .filter((p) => p.applicationMode === "direct_hire")
    .map((p) => p._id);

  // Companies only see forwarded profiles for project-based hiring, but every
  // applicant on direct-hire jobs. Count the dashboard stats using the same rule
  // so the numbers always match what the company can actually manage. The
  // forwarded set must mirror applicationController's FORWARDED_STATUSES so the
  // company's applicant list and its dashboard counts never disagree.
  const visibilityFilter = directProjectIds.length > 0
    ? {
        $or: [
          { project: { $in: directProjectIds } },
          {
            project: { $in: projectIds },
            status: { $in: FORWARDED_STATUSES },
          },
        ],
      }
    : { project: { $in: projectIds }, status: { $in: FORWARDED_STATUSES } };

  const [totalApplications, shortlisted, interviewScheduled, hired, rejected] = await Promise.all([
    Application.countDocuments(visibilityFilter),
    Application.countDocuments({ ...visibilityFilter, status: "shortlisted" }),
    Application.countDocuments({ ...visibilityFilter, status: "interview_scheduled" }),
    Application.countDocuments({ ...visibilityFilter, status: "hired" }),
    Application.countDocuments({ ...visibilityFilter, status: "rejected" }),
  ]);

  res.json({
    success: true,
    stats: {
      totalProjects: projects.length,
      openProjects: projects.filter((p) => p.status === "open").length,
      totalApplications,
      shortlisted,
      interviewScheduled,
      hired,
      rejected,
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

  // Aggregated company pipeline in ONE query instead of N queries per company
  const companyStats = await Application.aggregate([
    { $lookup: { from: "projects", localField: "project", foreignField: "_id", as: "projectDoc" } },
    { $unwind: "$projectDoc" },
    { $match: { "projectDoc.company": { $exists: true } } },
    { $group: { _id: "$projectDoc.company", applied: { $sum: 1 } } },
  ]);
  const companyStatusCounts = await Application.aggregate([
    { $lookup: { from: "projects", localField: "project", foreignField: "_id", as: "projectDoc" } },
    { $unwind: "$projectDoc" },
    { $match: { "projectDoc.company": { $exists: true } } },
    { $group: { _id: { company: "$projectDoc.company", status: "$status" }, count: { $sum: 1 } } },
  ]);
  const companyPendingReviews = await Submission.aggregate([
    { $lookup: { from: "projects", localField: "project", foreignField: "_id", as: "projectDoc" } },
    { $unwind: "$projectDoc" },
    { $match: { "projectDoc.company": { $exists: true }, status: "pending_review" } },
    { $group: { _id: "$projectDoc.company", count: { $sum: 1 } } },
  ]);
  const companyProjectCounts = await Project.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    { $group: { _id: "$company", count: { $sum: 1 } } },
  ]);

  const appliedMap = new Map(companyStats.map((s) => [String(s._id), s.applied]));
  const statusMap = new Map(companyStatusCounts.map((s) => [`${String(s._id.company)}:${s._id.status}`, s.count]));
  const pendingMap = new Map(companyPendingReviews.map((s) => [String(s._id), s.count]));
  const projectCountMap = new Map(companyProjectCounts.map((s) => [String(s._id), s.count]));

  const companyPipeline = companies.map((company) => {
    const key = String(company._id);
    const totalApplications = appliedMap.get(key) || 0;
    const shortlisted = statusMap.get(`${key}:shortlisted`) || 0;
    const hired = statusMap.get(`${key}:hired`) || 0;
    const inProgress = (statusMap.get(`${key}:applied`) || 0) + (statusMap.get(`${key}:in_progress`) || 0);
    const submitted = statusMap.get(`${key}:submitted`) || 0;
    const rejected = statusMap.get(`${key}:rejected`) || 0;
    const interviewScheduled = statusMap.get(`${key}:interview_scheduled`) || 0;
    const pendingCompanyReviews = pendingMap.get(key) || 0;

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
      totalProjects: projectCountMap.get(key) || 0,
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
  });

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

// @desc Evaluator dashboard - evaluation workload stats
// @route GET /api/dashboard/evaluator
const getEvaluatorDashboard = asyncHandler(async (req, res) => {
  const overdueDate = new Date(Date.now() - EVALUATOR_SLA_DAYS * 24 * 60 * 60 * 1000);

  const [
    pendingSubmissions,
    reviewedSubmissions,
    myEvaluations,
    avgAgg,
    recAgg,
    scoreAgg,
    domainAgg,
    upcomingInterviews,
    recentPending,
    overduePending,
    profileReviewsPending,
    overdueTotal,
    interviewOutcomesPending,
    pendingInterviewOutcomes,
  ] = await Promise.all([
    Submission.countDocuments({ status: "pending_review" }),
    Submission.countDocuments({ status: "reviewed" }),
    Evaluation.countDocuments({ evaluator: req.user._id }),
    Evaluation.aggregate([{ $group: { _id: null, avg: { $avg: "$overallScore" } } }]),
    Evaluation.aggregate([{ $group: { _id: "$recommendation", count: { $sum: 1 } } }]),
    Evaluation.aggregate([
      { $match: { evaluator: req.user._id } },
      {
        $group: {
          _id: null,
          codeQuality: { $avg: "$scores.codeQuality" },
          problemSolving: { $avg: "$scores.problemSolving" },
          standardsAdherence: { $avg: "$scores.standardsAdherence" },
          completeness: { $avg: "$scores.completeness" },
          communication: { $avg: "$scores.communication" },
          overall: { $avg: "$overallScore" },
        },
      },
    ]),
    // Workload split by project domain so the evaluator can see where the queue is heaviest.
    Submission.aggregate([
      { $match: { status: "pending_review" } },
      {
        $lookup: {
          from: "projects",
          localField: "project",
          foreignField: "_id",
          as: "project",
        },
      },
      { $unwind: { path: "$project", preserveNullAndEmptyArrays: true } },
      { $group: { _id: { $ifNull: ["$project.domain", "Other"] }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Interview.find({ interviewOwner: "evaluator", status: "scheduled" })
      .select("date startTime endTime mode interviewType application")
      .sort({ date: 1 })
      .limit(5),
    Submission.find({ status: "pending_review" })
      .populate("candidate", "name email avatarUrl experienceLevel")
      .populate("project", "title domain")
      .sort({ submittedAt: 1 })
      .limit(5),
    // The evaluation team commits to a review SLA; submissions waiting longer get flagged.
    Submission.find({ status: "pending_review", submittedAt: { $lte: overdueDate } })
      .populate("candidate", "name email avatarUrl experienceLevel")
      .populate("project", "title domain")
      .sort({ submittedAt: 1 })
      .limit(5),
    Application.countDocuments({
      applicationType: "project",
      status: { $in: ["applied", "in_progress", "submitted", "under_review"] },
    }),
    Submission.countDocuments({ status: "pending_review", submittedAt: { $lte: overdueDate } }),
    Interview.countDocuments({
      interviewOwner: "evaluator",
      status: "completed",
      feedback: { $in: ["", null] },
    }),
    Interview.find({ interviewOwner: "evaluator", status: "completed", feedback: { $in: ["", null] } })
      .populate("candidate", "name email")
      .populate({ path: "application", select: "candidate", populate: { path: "candidate", select: "name email" } })
      .sort({ updatedAt: -1 })
      .limit(5),
  ]);

  // Candidates the evaluator reviewed that were later officially hired by the
  // company — the evaluator can see the outcome of their review.
  const myReviewApps = await Evaluation.find({ evaluator: req.user._id })
    .select("application")
    .lean();
  const myAppIds = myReviewApps.map((e) => e.application).filter(Boolean);

  const [hiredFromMyReviews, hiredCountFromMyReviews, recentEvaluations] = await Promise.all([
    myAppIds.length
      ? Application.find({ _id: { $in: myAppIds }, status: "hired" })
          .populate("candidate", "name email avatarUrl")
          .populate({
            path: "project",
            select: "title jobRole applicationMode company",
            populate: { path: "company", select: "name companyName" },
          })
          .sort({ updatedAt: -1 })
          .limit(5)
      : Promise.resolve([]),
    myAppIds.length
      ? Application.countDocuments({ _id: { $in: myAppIds }, status: "hired" })
      : Promise.resolve(0),
    // The evaluator's own recent decisions so they can double-check consistency.
    Evaluation.find({ evaluator: req.user._id })
      .populate("submission", "repoUrl linkedRepoName")
      .populate({
        path: "application",
        select: "candidate project",
        populate: { path: "project", select: "title domain" },
      })
      .sort({ createdAt: -1 })
      .limit(5),
  ]);

  // Every officially hired candidate (both project-based and direct jobs) so the
  // evaluation team can see all hires on the platform.
  const [recentHires, totalHires] = await Promise.all([
    Application.find({ status: "hired" })
      .populate("candidate", "name email avatarUrl")
      .populate({
        path: "project",
        select: "title jobRole applicationMode company",
        populate: { path: "company", select: "name companyName" },
      })
      .sort({ updatedAt: -1 })
      .limit(6),
    Application.countDocuments({ status: "hired" }),
  ]);

  const avgScore = avgAgg.length ? Number(avgAgg[0].avg.toFixed(2)) : 0;
  const recommendations = { shortlist: 0, reject: 0, needs_upskilling: 0 };
  recAgg.forEach((r) => {
    if (recommendations[r._id] !== undefined) recommendations[r._id] = r.count;
  });

  const scoreTrend = scoreAgg.length
    ? {
        codeQuality: Number(scoreAgg[0].codeQuality.toFixed(1)),
        problemSolving: Number(scoreAgg[0].problemSolving.toFixed(1)),
        standardsAdherence: Number(scoreAgg[0].standardsAdherence.toFixed(1)),
        completeness: Number(scoreAgg[0].completeness.toFixed(1)),
        communication: Number(scoreAgg[0].communication.toFixed(1)),
        overall: Number(scoreAgg[0].overall.toFixed(1)),
      }
    : null;

  res.json({
    success: true,
    stats: {
      pendingSubmissions,
      reviewedSubmissions,
      myEvaluations,
      avgScore,
      hiredFromMyReviews: hiredCountFromMyReviews,
      totalHires,
      profileReviewsPending,
      interviewOutcomesPending,
      overdueCount: overdueTotal,
      ...recommendations,
    },
    slaDays: EVALUATOR_SLA_DAYS,
    scoreTrend,
    workloadByDomain: domainAgg,
    upcomingInterviews,
    recentPending,
    overduePending,
    pendingInterviewOutcomes,
    hiredFromMyReviews,
    recentHires,
    recentEvaluations,
  });
});

// @desc Get all submissions for a company's projects with GitHub analytics.
//       Companies only receive submissions that have passed the MentriQ team review
//       (i.e. whose application is shortlisted / interviewing / hired). Unreviewed or
//       rejected submissions are never exposed to the company.
// @route GET /api/dashboard/company/submissions
const getCompanySubmissions = asyncHandler(async (req, res) => {
  const projects = await Project.find({ company: req.user._id }).select("_id");
  const projectIds = projects.map((p) => p._id);

  const approvedStatuses = ["shortlisted", "interview_scheduled", "hired"];

  const submissions = await Submission.find({ project: { $in: projectIds } })
    .populate({
      path: "candidate",
      match: { isVerified: true },
      select: "name email githubUsername githubAvatar githubProfile githubConnectedAt",
    })
    .populate("project", "title domain")
    .populate("application", "status")
    .sort({ createdAt: -1 });

  const data = submissions
    .filter((s) => s.candidate)
    .filter((s) => approvedStatuses.includes(s.application?.status))
    .map((s) => ({
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

module.exports = { getCompanyDashboard, getCandidateDashboard, getAdminDashboard, getEvaluatorDashboard, getCompanySubmissions };
