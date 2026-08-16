const asyncHandler = require("express-async-handler");
const Interview = require("../models/Interview");
const Application = require("../models/Application");
const User = require("../models/User");
const { recordStatus } = require("./applicationController");

const validateInterviewFields = (mode, data) => {
  const errors = [];

  if (!data.date) {
    errors.push("Date is required");
  }

  if (mode === "online") {
    if (!data.meetingUrl) {
      errors.push("Meeting URL is required for online interviews");
    }
  } else if (mode === "offline") {
    if (!data.location) {
      errors.push("Location is required for offline interviews");
    }
  }

  return errors;
};

// @desc Create interview for an application
// @route POST /api/interviews/:applicationId
const createInterview = asyncHandler(async (req, res) => {
  const { applicationId } = req.params;
  const { mode, date, startTime, endTime, location, meetingUrl, instructions, interviewType } = req.body;

  let application;
  if (applicationId) {
    application = await Application.findById(applicationId).populate("project");
    if (!application) {
      res.status(404);
      throw new Error("Application not found");
    }
  }

  // Validate based on mode
  const validationErrors = validateInterviewFields(mode, req.body);
  if (validationErrors.length > 0) {
    res.status(400);
    throw new Error(validationErrors.join(", "));
  }

  // Determine interview owner: company if user is company, else evaluator
  const interviewOwner = req.user.role === "company" ? "company" : "evaluator";

  const interview = await Interview.create({
    application: applicationId,
    candidate: application?.candidate || req.user._id,
    interviewOwner,
    mode,
    date: new Date(date),
    startTime,
    endTime,
    location: mode === "offline" ? location : "",
    meetingUrl: mode === "online" ? meetingUrl : "",
    instructions: instructions || "",
    interviewType: interviewType || "",
    createdBy: req.user._id,
  });

  if (applicationId) {
    // Update application status to interview_scheduled
    await recordStatus(application, "interview_scheduled", req.user);
  }

  res.status(201).json({ success: true, interview });
});

// @desc Get single interview
// @route GET /api/interviews/:id
const getInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.findById(req.params.id)
    .populate("application", "project title applicationType")
    .populate("candidate", "name email githubUsername linkedinUsername")
    .populate("createdBy", "name");

  if (!interview) {
    res.status(404);
    throw new Error("Interview not found");
  }

  // Security: check ownership (the candidate who is being interviewed can also view)
  const isCandidateOwner =
    req.user.role === "candidate" &&
    interview.candidate?._id?.toString() === req.user._id.toString();
  if (interview.interviewOwner === "company" && req.user.role !== "company" && !isCandidateOwner) {
    res.status(403);
    throw new Error("Not authorized to view this interview");
  }
  if (
    interview.interviewOwner === "evaluator" &&
    !["evaluator", "admin"].includes(req.user.role) &&
    !isCandidateOwner
  ) {
    res.status(403);
    throw new Error("Not authorized to view this interview");
  }

  res.json({ success: true, interview });
});

// @desc Get interviews by application
// @route GET /api/interviews/application/:applicationId
const getInterviewsByApplication = asyncHandler(async (req, res) => {
  const interviews = await Interview.find({ application: req.params.applicationId })
    .sort({ createdAt: -1 });
  res.json({ success: true, interviews });
});

// @desc Get interviews by candidate
// @route GET /api/interviews/candidate/:candidateId
const getInterviewsByCandidate = asyncHandler(async (req, res) => {
  const interviews = await Interview.find({ candidate: req.params.candidateId })
    .sort({ createdAt: -1 });
  res.json({ success: true, interviews });
});

// @desc Get the logged-in candidate's own interviews
// @route GET /api/interviews/my
const getMyInterviews = asyncHandler(async (req, res) => {
  const interviews = await Interview.find({ candidate: req.user._id })
    .populate({
      path: "application",
      select: "applicationType status",
      populate: { path: "project", select: "title domain company" },
    })
    .populate("createdBy", "name")
    .sort({ date: 1, startTime: 1 });
  res.json({ success: true, interviews });
});

// @desc Update interview
// @route PUT /api/interviews/:id
const updateInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.findById(req.params.id);

  if (!interview) {
    res.status(404);
    throw new Error("Interview not found");
  }

  // Security: only owner can update
  if (interview.interviewOwner === "company" && req.user.role !== "company") {
    res.status(403);
    throw new Error("Not authorized to update this interview");
  }
  if (
    interview.interviewOwner === "evaluator" &&
    !["evaluator", "admin"].includes(req.user.role)
  ) {
    res.status(403);
    throw new Error("Not authorized to update this interview");
  }

  const { mode, date, startTime, endTime, location, meetingUrl, instructions } = req.body;

  if (date) interview.date = new Date(date);
  if (startTime !== undefined) interview.startTime = startTime;
  if (endTime !== undefined) interview.endTime = endTime;
  if (location !== undefined) interview.location = mode === "offline" ? location : interview.location;
  if (meetingUrl !== undefined) interview.meetingUrl = mode === "online" ? meetingUrl : interview.meetingUrl;
  if (instructions !== undefined) interview.instructions = instructions;

  await interview.save();
  res.json({ success: true, interview });
});

// @desc Mark interview as completed
// @route POST /api/interviews/:id/complete
const completeInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.findById(req.params.id);

  if (!interview) {
    res.status(404);
    throw new Error("Interview not found");
  }

  // Security: only owner can complete
  if (interview.interviewOwner === "company" && req.user.role !== "company") {
    res.status(403);
    throw new Error("Not authorized to complete this interview");
  }
  if (
    interview.interviewOwner === "evaluator" &&
    !["evaluator", "admin"].includes(req.user.role)
  ) {
    res.status(403);
    throw new Error("Not authorized to complete this interview");
  }

  interview.status = "completed";
  await interview.save();

  // Update application status if needed
  const application = await Application.findById(interview.application);
  if (application) {
    // Keep existing status - don't force transitions in Part 5
    application.status = application.status;
    await application.save();
  }

  res.json({ success: true, interview });
});

// @desc Cancel interview
// @route POST /api/interviews/:id/cancel
const cancelInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.findById(req.params.id);

  if (!interview) {
    res.status(404);
    throw new Error("Interview not found");
  }

  // Security: only owner can cancel
  if (interview.interviewOwner === "company" && req.user.role !== "company") {
    res.status(403);
    throw new Error("Not authorized to cancel this interview");
  }
  if (
    interview.interviewOwner === "evaluator" &&
    !["evaluator", "admin"].includes(req.user.role)
  ) {
    res.status(403);
    throw new Error("Not authorized to cancel this interview");
  }

  interview.status = "cancelled";
  await interview.save();

  res.json({ success: true, interview });
});

// @desc Get interviews (role-scoped list)
// - Evaluator: interviews owned by the evaluation team
// - Company: interviews owned by the company
// - Admin: all interviews (monitoring)
// @route GET /api/interviews?status=...&mode=...&search=...
const getInterviews = asyncHandler(async (req, res) => {
  const { status, mode, search } = req.query;
  const query = {};

  if (req.user.role === "evaluator") query.interviewOwner = "evaluator";
  else if (req.user.role === "company") query.interviewOwner = "company";

  if (status && status !== "all") query.status = status;
  if (mode && mode !== "all") query.mode = mode;

  const interviews = await Interview.find(query)
    .populate("candidate", "name email githubUsername linkedinUsername")
    .populate("application", "project")
    .populate("createdBy", "name")
    .sort({ createdAt: -1 })
    .limit(100);

  res.json({ success: true, interviews });
});

// @desc Get evaluations for an interview
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

  // Get evaluations associated with this interview's application/submission
  const application = await Application.findById(interview.application);
  if (!application) {
    return res.json({ success: true, evaluations: [] });
  }

  const evaluations = await Evaluation.find({ application: interview.application });
  res.json({ success: true, evaluations });
});

module.exports = {
  createInterview,
  getInterview,
  getInterviews,
  getInterviewsByApplication,
  getInterviewsByCandidate,
  getMyInterviews,
  updateInterview,
  completeInterview,
  cancelInterview,
  getInterviewEvaluations,
};