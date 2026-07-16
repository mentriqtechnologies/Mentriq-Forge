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
        "rejected",
        "interview_scheduled",
        "hired",
      ],
      default: "applied",
    },
    startedAt: { type: Date },
    submittedAt: { type: Date },
  },
  { timestamps: true }
);

applicationSchema.index({ project: 1, candidate: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);
