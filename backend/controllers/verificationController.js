const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const { sendEmail } = require("../utils/email");
const { getPagination } = require("../utils/pagination");
const { getMissingProfileFields } = require("../utils/profileCompleteness");

// @desc Get logged-in candidate's verification status
// @route GET /api/verification/me
const getMyVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({
    success: true,
    verification: {
      status: user.verificationStatus || "none",
      reason: user.verificationReason || "",
      submittedAt: user.verificationSubmittedAt,
      reviewedAt: user.verificationReviewedAt,
      isVerified: user.isVerified,
    },
    missingFields: getMissingProfileFields(user),
  });
});

// @desc Candidate submits completed profile for MentriQ team review
// @route POST /api/verification/submit
const submitVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user.verificationStatus === "approved") {
    res.status(400);
    throw new Error("Your profile is already verified");
  }

  if (user.verificationStatus === "pending") {
    res.status(400);
    throw new Error("Your profile is already submitted and under review");
  }

  const missing = getMissingProfileFields(user);
  if (missing.length > 0) {
    res.status(400);
    throw new Error(`Complete your profile first. Missing: ${missing.join(", ")}`);
  }

  user.verificationStatus = "pending";
  user.verificationReason = "";
  user.verificationSubmittedAt = new Date();
  await user.save();

  res.status(201).json({
    success: true,
    message: "Profile submitted for review. The MentriQ team will review it shortly.",
    verification: {
      status: user.verificationStatus,
      reason: user.verificationReason,
      submittedAt: user.verificationSubmittedAt,
      isVerified: user.isVerified,
    },
  });
});

// @desc List candidates for review (MentriQ team: admin/evaluator)
// @route GET /api/verification/candidates
const getCandidatesForReview = asyncHandler(async (req, res) => {
  const { status = "pending", search } = req.query;
  const { page, limit, skip } = getPagination(req.query);

  const query = { role: "candidate" };
  if (status && status !== "all") query.verificationStatus = status;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const [candidates, total] = await Promise.all([
    User.find(query)
      .select(
        "name email phone bio skills experienceLevel isVerified avatarUrl verificationStatus verificationReason verificationSubmittedAt verificationReviewedAt verificationReviewedBy"
      )
      .populate("verificationReviewedBy", "name")
      .sort({ verificationSubmittedAt: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(query),
  ]);

  res.json({
    success: true,
    candidates,
    total,
    page,
    pages: Math.ceil(total / limit),
  });
});

// @desc Approve or reject a candidate's profile (MentriQ team)
// @route PUT /api/verification/candidates/:userId
const reviewCandidate = asyncHandler(async (req, res) => {
  const { status, reason } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    res.status(400);
    throw new Error("Status must be 'approved' or 'rejected'");
  }

  if (status === "rejected" && !reason || (typeof reason === "string" && !reason.trim())) {
    res.status(400);
    throw new Error("A reason is required when rejecting a candidate");
  }

  const user = await User.findById(req.params.userId);
  if (!user || user.role !== "candidate") {
    res.status(404);
    throw new Error("Candidate not found");
  }

  if (user.verificationStatus === "approved" && status === "approved") {
    res.status(400);
    throw new Error("Candidate is already approved");
  }

  user.verificationStatus = status;
  user.verificationReason = status === "rejected" ? reason.trim() : "";
  user.verificationReviewedAt = new Date();
  user.verificationReviewedBy = req.user._id;
  await user.save();

  // Notify the candidate by email (best effort — never fails the request)
  try {
    const emailContent =
      status === "approved"
        ? {
            subject: "Profile Approved — MentriQ Forge",
            html: `
              <div style="max-width:600px;margin:0 auto;font-family:system-ui,sans-serif;">
                <h2 style="color:#1e293b;">Congratulations, your profile is approved!</h2>
                <p style="color:#475569;">Your candidate profile has been approved by the MentriQ team and is now visible to companies.</p>
                <p style="color:#475569;">Keep your profile updated and keep an eye on new project-based opportunities.</p>
                <p style="color:#94a3b8;font-size:13px;">MentriQ Forge Team</p>
              </div>
            `,
          }
        : {
            subject: "Profile Update Needed — MentriQ Forge",
            html: `
              <div style="max-width:600px;margin:0 auto;font-family:system-ui,sans-serif;">
                <h2 style="color:#1e293b;">Your profile needs some updates</h2>
                <p style="color:#475569;">The MentriQ team reviewed your profile and could not approve it yet.</p>
                <p style="color:#475569;">Reason: <strong>${reason.trim()}</strong></p>
                <p style="color:#475569;">Please update your profile with the suggested changes and submit it again for review.</p>
                <p style="color:#94a3b8;font-size:13px;">MentriQ Forge Team</p>
              </div>
            `,
          };
    await sendEmail({ to: user.email, ...emailContent });
  } catch (err) {
    console.warn("Verification notification email could not be sent:", err.message);
  }

  res.json({ success: true, message: `Candidate ${status}`, user: user.toSafeObject() });
});

module.exports = { getMyVerification, submitVerification, getCandidatesForReview, reviewCandidate };
