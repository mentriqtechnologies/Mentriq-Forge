const express = require("express");
const router = express.Router();
const {
  applyToProject,
  getMyApplications,
  getApplicationsForProject,
  updateApplicationStatus,
} = require("../controllers/applicationController");
const { protect, authorize } = require("../middleware/auth");

router.post("/", protect, authorize("candidate"), applyToProject);
router.get("/my", protect, authorize("candidate"), getMyApplications);
router.get(
  "/project/:projectId",
  protect,
  authorize("company", "admin", "evaluator"),
  getApplicationsForProject
);
router.put(
  "/:id/status",
  protect,
  authorize("company", "admin", "evaluator"),
  updateApplicationStatus
);

module.exports = router;
