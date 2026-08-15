const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    interviewOwner: {
      type: String,
      enum: ["evaluator", "company"],
      default: "evaluator",
    },

    interviewType: {
      type: String,
      trim: true,
      default: "",
    },

    mode: {
      type: String,
      enum: ["online", "offline"],
      default: "online",
    },

    date: {
      type: Date,
    },

    startTime: {
      type: String,
    },

    endTime: {
      type: String,
    },

    location: {
      type: String,
      trim: true,
      default: "",
    },

    meetingUrl: {
      type: String,
      trim: true,
      default: "",
    },

    instructions: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: ["scheduled", "confirmed", "completed", "cancelled", "rescheduled"],
      default: "scheduled",
    },

    feedback: {
      type: String,
      trim: true,
      default: "",
    },

    recommendation: {
      type: String,
      enum: ["recommended", "not_recommended", "needs_further_review"],
      default: "needs_further_review",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

interviewSchema.index({ application: 1 });
interviewSchema.index({ candidate: 1 });
interviewSchema.index({ status: 1 });
interviewSchema.index({ mode: 1 });

module.exports = mongoose.model("Interview", interviewSchema);