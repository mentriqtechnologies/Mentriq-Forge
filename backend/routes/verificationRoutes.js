const express = require("express");
const router = express.Router();
const {
  getMyVerification,
  submitVerification,
  getCandidatesForReview,
  reviewCandidate,
} = require("../controllers/verificationController");
const { protect, authorize } = require("../middleware/auth");

// Candidate self-service
router.get("/me", protect, authorize("candidate"), getMyVerification);
router.post("/submit", protect, authorize("candidate"), submitVerification);

// MentriQ team review (admin / evaluator)
router.get("/candidates", protect, authorize("admin", "evaluator"), getCandidatesForReview);
router.put("/candidates/:userId", protect, authorize("admin", "evaluator"), reviewCandidate);

module.exports = router;
