const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    applicationType: {
      type: String,
      enum: ["project", "direct_hire"],
      default: "project",
    },
    applicantName: { type: String, default: "" },
    mobileNumber: { type: String, default: "" },
    qualification: { type: String, default: "" },
    resumeDriveLink: { type: String, default: "" },
    status: {
      type: String,
      enum: [
        "applied",
        "in_progress",
        "submitted",
        "under_review",
        "shortlisted",
        "company_reviewing",
        "company_interview",
        "decision_pending",
        "interview_scheduled",
        "rejected",
        "hired",
      ],
      default: "applied",
    },
    // Full journey of the candidate through the recruitment process.
    // Each entry is recorded by the acting role (candidate, evaluator, company, admin).
    statusHistory: [
      {
        status: { type: String, required: true },
        at: { type: Date, default: Date.now },
        by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        byRole: { type: String, default: "" },
      },
    ],
    startedAt: { type: Date },
    submittedAt: { type: Date },
  },
  { timestamps: true }
);

applicationSchema.index({ project: 1, candidate: 1 }, { unique: true });
applicationSchema.index({ candidate: 1, createdAt: -1 });
applicationSchema.index({ project: 1, status: 1 });
applicationSchema.index({ status: 1 });

module.exports = mongoose.model("Application", applicationSchema);
