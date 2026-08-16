const express = require("express");
const router = express.Router();
const {
  getCompanyDashboard,
  getCandidateDashboard,
  getAdminDashboard,
  getEvaluatorDashboard,
  getCompanySubmissions,
} = require("../controllers/dashboardController");
const { protect, authorize } = require("../middleware/auth");

router.get("/company", protect, authorize("company"), getCompanyDashboard);
router.get("/company/submissions", protect, authorize("company"), getCompanySubmissions);
router.get("/candidate", protect, authorize("candidate"), getCandidateDashboard);
router.get("/admin", protect, authorize("admin"), getAdminDashboard);
router.get("/evaluator", protect, authorize("evaluator"), getEvaluatorDashboard);

module.exports = router;