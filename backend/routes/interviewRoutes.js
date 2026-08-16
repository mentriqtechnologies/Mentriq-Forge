const express = require("express");
const router = express.Router();
const {
  createInterview,
  getInterview,
  getInterviews,
  getInterviewsByApplication,
  getInterviewsByCandidate,
  updateInterview,
  completeInterview,
  cancelInterview,
  getInterviewEvaluations,
} = require("../controllers/interviewController");
const { protect, authorize } = require("../middleware/auth");

// NOTE: list routes are registered before parameterized routes so that
// "/" and "/application/:applicationId" are not swallowed by "/:id".

router.post(
  "/:applicationId",
  protect,
  authorize("evaluator", "company"),
  createInterview
);
router.get(
  "/",
  protect,
  authorize("evaluator", "company", "admin"),
  getInterviews
);
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
router.get("/:id", protect, getInterview);
router.get("/:id/evaluations", protect, getInterviewEvaluations);
router.put("/:id", protect, authorize("evaluator", "company"), updateInterview);
router.post("/:id/complete", protect, authorize("evaluator", "company"), completeInterview);
router.post("/:id/cancel", protect, authorize("evaluator", "company"), cancelInterview);

module.exports = router;