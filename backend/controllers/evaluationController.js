const asyncHandler = require("express-async-handler");
const Evaluation = require("../models/Evaluation");
const Interview = require("../models/Interview");
const Application = require("../models/Application");
const Submission = require("../models/Submission");
const User = require("../models/User");
const { recordStatus } = require("./applicationController");

// Application statuses the MentriQ team uses to forward a profile to the company
const FORWARDED_STATUSES = ["shortlisted", "interview_scheduled", "hired"];

// Recommendation -> application status mapping used to drive the hiring pipeline.
// An evaluator's recommendation automatically moves the application forward so the
// company sees the candidate only after the MentriQ team has reviewed the work.
const STATUS_BY_RECOMMENDATION = {
  shortlist: "shortlisted",
  reject: "rejected",
  needs_upskilling: "under_review",
};

// @desc Get all evaluations (evaluator/admin monitoring view)
// @route GET /api/evaluations?applicationId=...&search=...
const getEvaluations = asyncHandler(async (req, res) => {
  const { applicationId } = req.query;
  const query = {};
  if (applicationId) query.application = applicationId;

  const evaluations = await Evaluation.find(query)
    .populate("evaluator", "name")
    .populate("submission", "repoUrl liveDemoUrl driveLink notes")
    .populate("application", "candidate project")
    .sort({ createdAt: -1 })
    .limit(100);

  const results = evaluations.map((ev) => ({
    evaluation: ev,
    submission: ev.submission,
    project: ev.application?.project,
  }));

  res.json({ success: true, evaluations: results });
});

// @desc Get all evaluations for the logged-in candidate's own submissions (feedback view)
const getMyEvaluations = asyncHandler(async (req, res) => {
  const submissions = await Submission.find({ candidate: req.user._id }).populate(
    "project",
    "title domain"
  );
  const submissionIds = submissions.map((s) => s._id);

  const evaluations = await Evaluation.find({ submission: { $in: submissionIds } })
    .populate("evaluator", "name")
    .sort({ createdAt: -1 });

  const results = evaluations.map((ev) => {
    const submission = submissions.find((s) => s._id.toString() === ev.submission.toString());
    return { evaluation: ev, project: submission?.project };
  });

  res.json({ success: true, results });
});

// @desc Evaluator scores a submission
const createEvaluation = asyncHandler(async (req, res) => {
  const { submissionId, scores, feedback, recommendation } = req.body;

  const submission = await Submission.findById(submissionId);
  if (!submission) {
    res.status(404);
    throw new Error("Submission not found");
  }

  if (!feedback || typeof feedback.trim !== "function" || !feedback.trim()) {
    res.status(400);
    throw new Error("Detailed feedback is required");
  }

  if (!["shortlist", "reject", "needs_upskilling"].includes(recommendation)) {
    res.status(400);
    throw new Error("Recommendation must be 'shortlist', 'reject' or 'needs_upskilling'");
  }

  const existing = await Evaluation.findOne({ submission: submissionId });
  if (existing) {
    res.status(400);
    throw new Error("This submission has already been evaluated");
  }

  // Validate and normalize rubric scores (0-10 each)
  const scoreKeys = [
    "codeQuality",
    "problemSolving",
    "standardsAdherence",
    "completeness",
    "communication",
  ];
  const normalizedScores = {};
  for (const key of scoreKeys) {
    if (scores && scores[key] !== undefined) {
      const value = Number(scores[key]);
      if (Number.isNaN(value) || value < 0 || value > 10) {
        res.status(400);
        throw new Error(`Score for ${key} must be a number between 0 and 10`);
      }
      normalizedScores[key] = value;
    }
  }

  const evaluation = await Evaluation.create({
    submission: submissionId,
    application: submission.application,
    evaluator: req.user._id,
    scores: normalizedScores,
    feedback: feedback.trim(),
    recommendation,
  });

  submission.status = "reviewed";
  await submission.save();

  // Drive the hiring pipeline: the recommendation updates the application status so
  // the company only sees profiles the MentriQ team has moved forward (shortlist),
  // and rejected/needs-upskilling candidates are routed accordingly.
  if (submission.application) {
    const targetStatus = STATUS_BY_RECOMMENDATION[recommendation];
    if (targetStatus) {
      const application = await Application.findById(submission.application);
      if (application) await recordStatus(application, targetStatus, req.user);
    }
  }

  // Also create an linked interview evaluation if an interview exists
  const interview = await Interview.findOne({ application: submission.application });
  if (interview) {
    // Interview outcomes use their own vocabulary (recommended / not_recommended /
    // needs_further_review), so map the submission verdict onto it — writing the
    // submission recommendation directly would violate the enum and fail to save.
    const interviewRecByEvaluation = {
      shortlist: "recommended",
      reject: "not_recommended",
      needs_upskilling: "needs_further_review",
    };
    interview.feedback = feedback.trim();
    interview.recommendation = interviewRecByEvaluation[recommendation] || interview.recommendation;
    interview.status = "completed";
    await interview.save();
  }

  res.status(201).json({ success: true, evaluation });
});

// @desc Get evaluation for a submission
const getEvaluationBySubmission = asyncHandler(async (req, res) => {
  const evaluation = await Evaluation.findOne({ submission: req.params.submissionId }).populate(
    "evaluator",
    "name"
  );
  if (!evaluation) {
    res.status(404);
    throw new Error("No evaluation found for this submission");
  }
  res.json({ success: true, evaluation });
});

// @desc Get evaluations for an interview (Part 5 feature)
// @route GET /api/interviews/:id/evaluations
const getInterviewEvaluations = asyncHandler(async (req, res) => {
  const interview = await Interview.findById(req.params.id);
  if (!interview) {
    res.status(404);
    throw new Error("Interview not found");
  }

  // Security check
  if (interview.interviewOwner === "company" && req.user.role !== "company") {
    res.status(403);
    throw new Error("Not authorized to view evaluations");
  }
  if (
    interview.interviewOwner === "evaluator" &&
    !["evaluator", "admin"].includes(req.user.role)
  ) {
    res.status(403);
    throw new Error("Not authorized to view evaluations");
  }

  // Get evaluations associated with this interview's application
  const evaluations = await Evaluation.find({ application: interview.application });
  res.json({ success: true, evaluations });
});

// @desc Create evaluation for an interview (Part 5 feature)
// Evaluator records feedback and recommendation after interview
const createInterviewEvaluation = asyncHandler(async (req, res) => {
  const { interviewId, feedback, recommendation } = req.body;

  const interview = await Interview.findById(interviewId);
  if (!interview) {
    res.status(404);
    throw new Error("Interview not found");
  }

  // Security check
  if (interview.interviewOwner === "company" && req.user.role !== "company") {
    res.status(403);
    throw new Error("Not authorized to evaluate this interview");
  }
  if (
    interview.interviewOwner === "evaluator" &&
    !["evaluator", "admin"].includes(req.user.role)
  ) {
    res.status(403);
    throw new Error("Not authorized to evaluate this interview");
  }

  if (!feedback || typeof feedback.trim !== "function" || !feedback.trim()) {
    res.status(400);
    throw new Error("Detailed feedback is required");
  }

  // Recommendation options for Part 5
  const validRecommendations = ["recommended", "not_recommended", "needs_further_review"];
  if (!validRecommendations.includes(recommendation)) {
    res.status(400);
    throw new Error(`Recommendation must be one of: ${validRecommendations.join(", ")}`);
  }

  // Check if an evaluation already exists for this interview/application
  const existing = await Evaluation.findOne({ application: interview.application });
  if (existing) {
    // Update existing evaluation
    existing.feedback = feedback.trim();
    existing.recommendation = recommendation;
    existing.evaluator = req.user._id;
    await existing.save();
    res.json({ success: true, evaluation: existing });
  } else {
    // Create new evaluation linked to the application
    const evaluation = await Evaluation.create({
      application: interview.application,
      candidate: interview.candidate,
      evaluator: req.user._id,
      feedback: feedback.trim(),
      recommendation,
      // Set default scores to 0 or leave undefined for Part 5
      scores: {},
      overallScore: 0,
    });

    // Update interview with feedback and recommendation
    interview.feedback = feedback.trim();
    interview.recommendation = recommendation;
    interview.status = "completed";
    await interview.save();

    res.status(201).json({ success: true, evaluation });
  }
});

// @desc Get interview detail with evaluation
const getInterviewDetail = asyncHandler(async (req, res) => {
  const interview = await Interview.findById(req.params.id)
    .populate("application", "project title applicationType")
    .populate("candidate", "name email githubUsername linkedinUsername")
    .populate("createdBy", "name");

  if (!interview) {
    res.status(404);
    throw new Error("Interview not found");
  }

  // Security check
  if (interview.interviewOwner === "company" && req.user.role !== "company") {
    res.status(403);
    throw new Error("Not authorized to view this interview");
  }
  if (
    interview.interviewOwner === "evaluator" &&
    !["evaluator", "admin"].includes(req.user.role)
  ) {
    res.status(403);
    throw new Error("Not authorized to view this interview");
  }

  // Get associated evaluation
  const evaluation = await Evaluation.findOne({ application: interview.application });

  res.json({ success: true, interview, evaluation });
});

module.exports = {
  createEvaluation,
  getEvaluations,
  getEvaluationBySubmission,
  getInterviewEvaluations,
  createInterviewEvaluation,
  getInterviewDetail,
  getMyEvaluations,
};