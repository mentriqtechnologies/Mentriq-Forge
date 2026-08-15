const express = require("express");
const router = express.Router();
const {
  createInterview,
  getInterview,
  getInterviewsByApplication,
  getInterviewsByCandidate,
  updateInterview,
  completeInterview,
  cancelInterview,
  getEvaluatorInterviews,
  getCompanyInterviews,
} = require("../controllers/interviewController");
const { protect, authorize } = require("../middleware/auth");

router.post(
  "/",
  protect,
  authorize("evaluator", "company"),
  createInterview
);
router.get("/:id", protect, getInterview);
router.get(
  "/application/:applicationId",
  protect,
  authorize("evaluator", "company", "admin"),
  getInterviewsByApplication
);
router.get(
  "/candidate/:candidateId",
  protect,
  authorize("evaluator", "admin"),
  getInterviewsByCandidate
);
router.put("/:id", protect, authorize("evaluator", "company"), updateInterview);
router.post("/:id/complete", protect, authorize("evaluator", "company"), completeInterview);
router.post("/:id/cancel", protect, authorize("evaluator", "company"), cancelInterview);

module.exports = router;