const express = require("express");
const router = express.Router();
const {
  createSubmission,
  getPendingSubmissions,
  getSubmissionById,
  getMySubmissions,
  fetchGithubStats,
} = require("../controllers/submissionController");
const { protect, authorize } = require("../middleware/auth");

router.post("/", protect, authorize("candidate"), createSubmission);
router.get("/pending", protect, authorize("evaluator", "admin"), getPendingSubmissions);
router.get("/my", protect, authorize("candidate"), getMySubmissions);
router.get("/:id", protect, getSubmissionById);
router.put("/:id/github-stats", protect, authorize("candidate"), fetchGithubStats);

module.exports = router;
