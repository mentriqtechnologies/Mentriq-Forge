const express = require("express");
const router = express.Router();
const {
  getCompanyDashboard,
  getCandidateDashboard,
  getAdminDashboard,
  getCompanySubmissions,
} = require("../controllers/dashboardController");
const { protect, authorize } = require("../middleware/auth");

router.get("/company", protect, authorize("company"), getCompanyDashboard);
router.get("/company/submissions", protect, authorize("company"), getCompanySubmissions);
router.get("/candidate", protect, authorize("candidate"), getCandidateDashboard);
router.get("/admin", protect, authorize("admin", "evaluator"), getAdminDashboard);

module.exports = router;
