const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    application: { type: mongoose.Schema.Types.ObjectId, ref: "Application", required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    repoUrl: { type: String },
    linkedRepoId: { type: String },
    linkedRepoName: { type: String },
    linkedRepoUrl: { type: String },
    linkedRepoDefaultBranch: { type: String },
    linkedRepoVisibility: { type: String },
    liveDemoUrl: { type: String },
    driveLink: { type: String }, // Google Drive or code repository link for full source code
    fileUrls: [{ type: String }],
    notes: { type: String },
    repoAnalytics: {
      totalCommits: Number,
      commitTimeline: [{ week: Number, count: Number }],
      lastCommitDate: Date,
      branches: [String],
      pullRequests: Number,
      languages: [{ name: String, bytes: Number }],
    },
    submittedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["pending_review", "reviewed"],
      default: "pending_review",
    },
  },
  { timestamps: true }
);

submissionSchema.index({ status: 1, submittedAt: 1 });
submissionSchema.index({ candidate: 1, createdAt: -1 });
submissionSchema.index({ project: 1, status: 1 });
submissionSchema.index({ application: 1 });

module.exports = mongoose.model("Submission", submissionSchema);
