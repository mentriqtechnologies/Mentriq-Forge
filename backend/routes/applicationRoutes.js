const express = require("express");
const router = express.Router();
const {
  applyToProject,
  getMyApplications,
  getApplicationsForProject,
  getAllApplications,
  getApplicationDetail,
  getEvaluatorApplicationQueue,
  updateApplicationStatus,
  shortlistApplication,
  rejectApplication,
  getCompanyShortlistedApplications,
  getCompanyApplicationDetail,
  companyUpdateApplicationReview,
  companyMakeFinalDecision,
  companyScheduleInterview,
} = require("../controllers/applicationController");
const { protect, authorize } = require("../middleware/auth");

router.post("/", protect, authorize("candidate"), applyToProject);
router.get("/my", protect, authorize("candidate"), getMyApplications);
router.get("/all", protect, authorize("admin"), getAllApplications);
router.get(
  "/queue",
  protect,
  authorize("evaluator"),
  getEvaluatorApplicationQueue
);
router.get(
  "/project/:projectId",
  protect,
  authorize("company", "admin"),
  getApplicationsForProject
);
router.put(
  "/:id/status",
  protect,
  authorize("company", "admin"),
  updateApplicationStatus
);

// @desc Evaluator forwards a candidate profile to the company (project-based hiring)
// @route POST /api/applications/:id/shortlist
router.post(
  "/:id/shortlist",
  protect,
  authorize("evaluator", "admin"),
  shortlistApplication
);

// @desc Evaluator/Admin rejects a project-based application
// @route POST /api/applications/:id/reject
router.post(
  "/:id/reject",
  protect,
  authorize("evaluator", "admin"),
  rejectApplication
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

// @desc Company makes final hiring decision (Hire is Company-exclusive)
// @route PUT /api/company/applications/:id/final-decision
router.put(
  "/company/:applicationId/final-decision",
  protect,
  authorize("company"),
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

// @desc Get a single application with full context (evaluator/admin/owning company/candidate)
// @route GET /api/applications/:id
// NOTE: registered last so specific routes above (e.g. /my, /all, /company/...) win
router.get(
  "/:id",
  protect,
  authorize("candidate", "company", "evaluator", "admin"),
  getApplicationDetail
);

module.exports = router;
