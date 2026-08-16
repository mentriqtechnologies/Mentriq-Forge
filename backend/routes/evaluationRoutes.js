const express = require("express");
const router = express.Router();
const {
  createEvaluation,
  getEvaluations,
  getEvaluationBySubmission,
  getMyEvaluations,
} = require("../controllers/evaluationController");
const {
  getShortlistForProject,
} = require("../controllers/applicationController");
const { protect, authorize } = require("../middleware/auth");

// Evaluator owns the evaluation workflow
router.post("/", protect, authorize("evaluator"), createEvaluation);
router.get("/my", protect, authorize("candidate"), getMyEvaluations);
router.get("/", protect, authorize("evaluator", "admin"), getEvaluations);
router.get("/submission/:submissionId", protect, getEvaluationBySubmission);
router.get(
  "/project/:projectId/shortlist",
  protect,
  authorize("company", "admin", "evaluator"),
  getShortlistForProject
);

module.exports = router;