const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, required: true },
    message: { type: String, trim: true, required: true },

    // Presentation type — used only to style the inbox list.
    type: {
      type: String,
      enum: ["announcement", "info", "reminder"],
      default: "announcement",
    },

    // Who the admin chose to notify when this was sent.
    targetAudience: {
      type: String,
      enum: ["all", "roles"],
      default: "all",
    },
    targetRoles: [{ type: String, enum: ["candidate", "company", "evaluator", "admin"] }],

    // The resolved recipient list captured at send time, plus who has read it.
    recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Admin can pull the notification so it disappears for everyone.
    active: { type: Boolean, default: true },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

notificationSchema.index({ recipients: 1, createdAt: -1 });
notificationSchema.index({ recipients: 1, active: 1 });

module.exports = mongoose.model("Notification", notificationSchema);