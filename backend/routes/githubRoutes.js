const express = require("express");
const router = express.Router();
const { getMyRepos } = require("../controllers/githubController");
const { protect } = require("../middleware/auth");

router.get("/repos", protect, getMyRepos);

module.exports = router;
