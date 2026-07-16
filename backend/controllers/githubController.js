const asyncHandler = require("express-async-handler");
const User = require("../models/User");

// @desc Fetch authenticated user's GitHub repos
// @route GET /api/github/repos
const getMyRepos = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const accessToken = user.getDecryptedGithubToken();
  if (!accessToken) {
    res.status(400);
    throw new Error("GitHub account not connected. Link your GitHub from Profile Settings first.");
  }

  const repoRes = await fetch("https://api.github.com/user/repos?per_page=100&sort=updated", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!repoRes.ok) {
    res.status(502);
    throw new Error("Failed to fetch repositories from GitHub");
  }

  const repos = await repoRes.json();

  const mapped = repos.map((r) => ({
    id: String(r.id),
    name: r.name,
    fullName: r.full_name,
    url: r.html_url,
    defaultBranch: r.default_branch,
    visibility: r.visibility,
    description: r.description,
    language: r.language,
    updatedAt: r.updated_at,
  }));

  res.json({ success: true, repos: mapped });
});

module.exports = { getMyRepos };
