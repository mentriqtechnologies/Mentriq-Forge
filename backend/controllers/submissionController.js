const asyncHandler = require("express-async-handler");
const Submission = require("../models/Submission");
const Application = require("../models/Application");
const User = require("../models/User");

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
  if (!repoUrl && !liveDemoUrl && !driveLink && (!fileUrls || fileUrls.length === 0)) {
    res.status(400);
    throw new Error("Provide at least a repo URL, live demo URL, drive link, or file");
  }

  const submission = await Submission.create({
    application: applicationId,
    project: application.project,
    candidate: req.user._id,
    repoUrl: linkedRepoUrl || repoUrl,
    linkedRepoId,
    linkedRepoName,
    linkedRepoUrl,
    linkedRepoDefaultBranch,
    linkedRepoVisibility,
    liveDemoUrl,
    driveLink,
    fileUrls,
    notes,
  });

  application.status = "submitted";
  application.submittedAt = new Date();
  await application.save();

  res.status(201).json({ success: true, submission });
});

// @desc Get submissions pending review (evaluator/admin)
// @route GET /api/submissions/pending
const getPendingSubmissions = asyncHandler(async (req, res) => {
  const { projectId, search } = req.query;
  let filter = { status: "pending_review" };

  if (projectId) {
    filter.project = projectId;
  }

  const submissions = await Submission.find(filter)
    .populate("candidate", "name email skills experienceLevel githubUsername githubAvatar githubProfile githubConnectedAt")
    .populate("project", "title domain company description")
    .populate("application", "appliedAt")
    .sort({ submittedAt: 1 });

  // Filter by search term if provided (search candidate name)
  let results = submissions;
  if (search) {
    const searchLower = search.toLowerCase();
    results = submissions.filter((s) => s.candidate?.name?.toLowerCase().includes(searchLower));
  }

  res.json({ success: true, submissions: results, total: results.length });
});

// @desc Get a single submission
// @route GET /api/submissions/:id
const getSubmissionById = asyncHandler(async (req, res) => {
  const submission = await Submission.findById(req.params.id)
    .populate("candidate", "name email skills")
    .populate("project");
  if (!submission) {
    res.status(404);
    throw new Error("Submission not found");
  }
  res.json({ success: true, submission });
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
