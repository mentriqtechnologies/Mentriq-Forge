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

// Platform verification review (admin only - platform governance)
router.get("/candidates", protect, authorize("admin"), getCandidatesForReview);
router.put("/candidates/:userId", protect, authorize("admin"), reviewCandidate);

module.exports = router;
