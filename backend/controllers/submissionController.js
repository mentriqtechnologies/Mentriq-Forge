const asyncHandler = require("express-async-handler");
const Submission = require("../models/Submission");
const Application = require("../models/Application");
const User = require("../models/User");
const { cleanUrl } = require("../utils/urls");
const { getPagination } = require("../utils/pagination");
const { recordStatus } = require("./applicationController");

// Application statuses that mean the review process has concluded favourably;
// submissions for these are not open for re-submission.
const FINAL_APPROVED_STATUSES = [
  "shortlisted",
  "company_reviewing",
  "company_interview",
  "decision_pending",
  "interview_scheduled",
  "hired",
];

// @desc Candidate submits work for an application
// @route POST /api/submissions
const createSubmission = asyncHandler(async (req, res) => {
  const { applicationId, repoUrl, linkedRepoId, linkedRepoName, linkedRepoUrl, linkedRepoDefaultBranch, linkedRepoVisibility, liveDemoUrl, driveLink, fileUrls, notes } = req.body;

  const application = await Application.findById(applicationId);
  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }
  if (application.candidate.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to submit for this application");
  }

  // Sanitize all user-supplied URLs (block javascript:/data: XSS links)
  const sanitizedRepoUrl = linkedRepoUrl ? cleanUrl(linkedRepoUrl) : cleanUrl(repoUrl);
  const sanitizedLiveDemoUrl = cleanUrl(liveDemoUrl);
  const sanitizedDriveLink = cleanUrl(driveLink);
  const sanitizedFileUrls = Array.isArray(fileUrls)
    ? fileUrls.map((u) => cleanUrl(u)).filter(Boolean)
    : [];

  if (!sanitizedRepoUrl && !sanitizedLiveDemoUrl && !sanitizedDriveLink && sanitizedFileUrls.length === 0) {
    res.status(400);
    throw new Error("Provide at least a valid repo URL, live demo URL, drive link, or file URL");
  }

  // Only one submission may be in the review queue at a time per application
  const existingPending = await Submission.findOne({
    application: applicationId,
    status: "pending_review",
  });
  if (existingPending) {
    res.status(400);
    throw new Error("You already have a submission under review for this project");
  }

  // Submissions already approved by the MentriQ team cannot be re-submitted
  if (FINAL_APPROVED_STATUSES.includes(application.status)) {
    res.status(400);
    throw new Error("This project has already been approved and is not open for re-submission");
  }

  const submission = await Submission.create({
    application: applicationId,
    project: application.project,
    candidate: req.user._id,
    repoUrl: sanitizedRepoUrl,
    linkedRepoId,
    linkedRepoName,
    linkedRepoUrl: sanitizedRepoUrl,
    linkedRepoDefaultBranch,
    linkedRepoVisibility,
    liveDemoUrl: sanitizedLiveDemoUrl,
    driveLink: sanitizedDriveLink,
    fileUrls: sanitizedFileUrls,
    notes: typeof notes === "string" ? notes.trim() : "",
  });

  application.submittedAt = new Date();
  await recordStatus(application, "submitted", req.user);

  res.status(201).json({ success: true, submission });
});

// @desc Get submissions for review (evaluator/admin), filtered by review status
// @route GET /api/submissions/pending?status=pending_review|reviewed|all
const getPendingSubmissions = asyncHandler(async (req, res) => {
  const { projectId, search, status = "pending_review" } = req.query;
  const { page, limit, skip } = getPagination(req.query, { defaultLimit: 20 });

  const filter = {};
  if (status && status !== "all") filter.status = status;
  if (projectId) {
    filter.project = projectId;
  }

  // Find matching candidates first so the search filter is applied at the DB level
  let candidateIds;
  if (search) {
    const candidates = await User.find({ name: { $regex: search, $options: "i" } }).select("_id").limit(limit).lean();
    candidateIds = candidates.map((c) => c._id);
    if (candidateIds.length === 0) {
      return res.json({ success: true, submissions: [], total: 0, page, pages: 0 });
    }
    filter.candidate = { $in: candidateIds };
  }

  const [submissions, total] = await Promise.all([
Submission.find(filter)
      .select("candidate project application linkedRepoName linkedRepoUrl linkedRepoVisibility repoUrl liveDemoUrl driveLink fileUrls notes repoAnalytics submittedAt status")
      .populate("candidate", "name email skills githubUsername githubAvatar githubProfile githubConnectedAt")
      .populate("project", "title domain company description")
      .populate("application", "appliedAt status")
      .sort({ submittedAt: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Submission.countDocuments(filter),
  ]);

  res.json({ success: true, submissions, total, page, limit, pages: Math.ceil(total / limit) });
});

// @desc Get a single submission (owner candidate, MentriQ team, or owning company of an approved submission)
// @route GET /api/submissions/:id
const getSubmissionById = asyncHandler(async (req, res) => {
  const submission = await Submission.findById(req.params.id)
    .populate("candidate", "name email skills")
    .populate("project");
  if (!submission) {
    res.status(404);
    throw new Error("Submission not found");
  }

  const role = req.user.role;
  if (role === "candidate" && submission.candidate._id.toString() === req.user._id.toString()) {
    return res.json({ success: true, submission });
  }
  if (role === "admin" || role === "evaluator") {
    return res.json({ success: true, submission });
  }

  // Companies may only view submissions MentriQ has approved for their project
  if (role === "company") {
    const application = await Application.findById(submission.application).populate("project");
    const isOwner =
      application?.project?.company &&
      application.project.company.toString() === req.user._id.toString();
    const isApproved = FINAL_APPROVED_STATUSES.includes(application?.status);
    if (isOwner && isApproved) {
      return res.json({ success: true, submission });
    }
  }

  res.status(403);
  throw new Error("Not authorized to view this submission");
});

// @desc Get submissions by logged-in candidate
// @route GET /api/submissions/my
const getMySubmissions = asyncHandler(async (req, res) => {
  const submissions = await Submission.find({ candidate: req.user._id })
    .populate("project", "title domain")
    .sort({ createdAt: -1 });
  res.json({ success: true, submissions });
});

// @desc Fetch and store GitHub analytics for a submission's linked repo
// @route PUT /api/submissions/:id/github-stats
const fetchGithubStats = asyncHandler(async (req, res) => {
  const submission = await Submission.findById(req.params.id);
  if (!submission) {
    res.status(404);
    throw new Error("Submission not found");
  }
  if (submission.candidate.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }
  if (!submission.linkedRepoUrl) {
    res.status(400);
    throw new Error("No linked repository found on this submission");
  }

  const user = await User.findById(req.user._id);
  const accessToken = user.getDecryptedGithubToken();
  if (!accessToken) {
    res.status(400);
    throw new Error("GitHub account not connected");
  }

  const match = submission.linkedRepoUrl.match(/github\.com\/([^/]+)\/([^/]+?)(?:\/|$)/);
  if (!match) {
    res.status(400);
    throw new Error("Could not parse repository owner/name from URL");
  }
  const owner = match[1];
  const repo = match[2].replace(/\.git$/, "");

  const headers = { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github.v3+json" };

  // 1. Commits — get last commit date and total count
  const commitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`, { headers });
  const commits = await commitRes.json();
  const lastCommitDate = Array.isArray(commits) && commits[0]?.commit?.committer?.date
    ? new Date(commits[0].commit.committer.date)
    : null;

  let totalCommits = 0;
  const linkHeader = commitRes.headers.get("link");
  if (linkHeader) {
    const lastMatch = linkHeader.match(/page=(\d+)>; rel="last"/);
    if (lastMatch) totalCommits = parseInt(lastMatch[1], 10);
  }
  if (!totalCommits && Array.isArray(commits)) totalCommits = commits.length;

  // 2. Commit activity (weekly timeline, last 52 weeks)
  const activityRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/stats/commit_activity`, { headers });
  const activity = await activityRes.json();
  const commitTimeline = Array.isArray(activity)
    ? activity.filter((w) => w.total > 0).map((w) => ({ week: w.week, count: w.total })).slice(-12)
    : [];

  // 3. Branches
  const branchRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches?per_page=50`, { headers });
  const branchData = await branchRes.json();
  const branches = Array.isArray(branchData) ? branchData.map((b) => b.name) : [];

  // 4. Pull requests (open + closed count)
  const prRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls?state=all&per_page=1`, { headers });
  let pullRequests = 0;
  const prLink = prRes.headers.get("link");
  if (prLink) {
    const prLastMatch = prLink.match(/page=(\d+)>; rel="last"/);
    if (prLastMatch) pullRequests = parseInt(prLastMatch[1], 10);
  }

  // 5. Languages
  const langRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, { headers });
  const langData = await langRes.json();
  const languages = typeof langData === "object" && !Array.isArray(langData)
    ? Object.entries(langData).map(([name, bytes]) => ({ name, bytes })).sort((a, b) => b.bytes - a.bytes)
    : [];

  submission.repoAnalytics = {
    totalCommits,
    commitTimeline,
    lastCommitDate,
    branches,
    pullRequests,
    languages,
  };
  await submission.save();

  res.json({ success: true, repoAnalytics: submission.repoAnalytics });
});

module.exports = {
  createSubmission,
  getPendingSubmissions,
  getSubmissionById,
  getMySubmissions,
  fetchGithubStats,
};
