const asyncHandler = require("express-async-handler");
const Evaluation = require("../models/Evaluation");
const Submission = require("../models/Submission");
const Application = require("../models/Application");

// @desc Get all evaluations for the logged-in candidate's own submissions (feedback view)
// @route GET /api/evaluations/my
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
// @route POST /api/evaluations
const createEvaluation = asyncHandler(async (req, res) => {
  const { submissionId, scores, feedback, recommendation } = req.body;

  const submission = await Submission.findById(submissionId);
  if (!submission) {
    res.status(404);
    throw new Error("Submission not found");
  }

  const existing = await Evaluation.findOne({ submission: submissionId });
  if (existing) {
    res.status(400);
    throw new Error("This submission has already been evaluated");
  }

  const evaluation = await Evaluation.create({
    submission: submissionId,
    application: submission.application,
    evaluator: req.user._id,
    scores,
    feedback,
    recommendation,
  });

  submission.status = "reviewed";
  await submission.save();

  const application = await Application.findById(submission.application);
  if (application) {
    application.status = recommendation === "shortlist" ? "shortlisted" : "under_review";
    if (recommendation === "reject") application.status = "rejected";
    await application.save();
  }

  res.status(201).json({ success: true, evaluation });
});

// @desc Get evaluation for a submission
// @route GET /api/evaluations/submission/:submissionId
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

// @desc Get top-scored / shortlisted candidates for a project (company view)
// @route GET /api/evaluations/project/:projectId/shortlist
const getShortlistForProject = asyncHandler(async (req, res) => {
  const applications = await Application.find({
    project: req.params.projectId,
    status: { $in: ["shortlisted", "interview_scheduled", "hired"] },
  }).populate("candidate", "name email skills experienceLevel resumeUrl");

  const results = await Promise.all(
    applications.map(async (app) => {
      const submission = await Submission.findOne({ application: app._id });
      const evaluation = submission
        ? await Evaluation.findOne({ submission: submission._id })
        : null;
      return {
        application: app,
        overallScore: evaluation ? evaluation.overallScore : null,
        recommendation: evaluation ? evaluation.recommendation : null,
      };
    })
  );

  results.sort((a, b) => (b.overallScore || 0) - (a.overallScore || 0));
  res.json({ success: true, shortlist: results });
});

module.exports = {
  createEvaluation,
  getEvaluationBySubmission,
  getShortlistForProject,
  getMyEvaluations,
};
