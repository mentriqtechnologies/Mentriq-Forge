const express = require("express");
const router = express.Router();
const {
  applyToProject,
  getMyApplications,
  getApplicationsForProject,
  getAllApplications,
  updateApplicationStatus,
  shortlistApplication,
  getCompanyShortlistedApplications,
  getCompanyApplicationDetail,
  companyUpdateApplicationReview,
  companyMakeFinalDecision,
  companyScheduleInterview,
} = require("../controllers/applicationController");
const { protect, authorize } = require("../middleware/auth");

router.post("/", protect, authorize("candidate"), applyToProject);
router.get("/my", protect, authorize("candidate"), getMyApplications);
router.get(
  "/all",
  protect,
  authorize("admin", "evaluator"),
  getAllApplications
);
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

// @desc Evaluator shortlists a candidate application
// @route POST /api/applications/:id/shortlist
router.post(
  "/:id/shortlist",
  protect,
  authorize("evaluator", "admin"),
  shortlistApplication
);

// @desc Get shortlisted candidates for a company's projects
// @route GET /api/company/applications/shortlisted
router.get(
  "/company/shortlisted",
  protect,
  authorize("company", "admin"),
  getCompanyShortlistedApplications
);

// @desc Get a shortlisted candidate for company review
// @route GET /api/company/applications/:id
router.get(
  "/company/:applicationId",
  protect,
  authorize("company", "admin"),
  getCompanyApplicationDetail
);

// @desc Company updates application review status
// @route PUT /api/company/applications/:id/review
router.put(
  "/company/:applicationId/review",
  protect,
  authorize("company", "admin"),
  companyUpdateApplicationReview
);

// @desc Company makes final hiring decision
// @route PUT /api/company/applications/:id/final-decision
router.put(
  "/company/:applicationId/final-decision",
  protect,
  authorize("company", "admin"),
  companyMakeFinalDecision
);

// @desc Company schedules interview for shortlisted candidate
// @route POST /api/company/applications/:id/interview
router.post(
  "/company/:applicationId/interview",
  protect,
  authorize("company", "admin"),
  companyScheduleInterview
);

module.exports = router;
