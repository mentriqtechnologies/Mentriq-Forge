const express = require("express");
const router = express.Router();
const {
  createEvaluation,
  getEvaluationBySubmission,
  getShortlistForProject,
  getMyEvaluations,
} = require("../controllers/evaluationController");
const { protect, authorize } = require("../middleware/auth");

router.post("/", protect, authorize("evaluator", "admin"), createEvaluation);
router.get("/my", protect, authorize("candidate"), getMyEvaluations);
router.get("/submission/:submissionId", protect, getEvaluationBySubmission);
router.get(
  "/project/:projectId/shortlist",
  protect,
  authorize("company", "admin", "evaluator"),
  getShortlistForProject
);

module.exports = router;
