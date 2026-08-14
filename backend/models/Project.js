const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    jobRole: { type: String, trim: true, default: "" },
    description: { type: String, required: true },
    jobDescription: { type: String, default: "" },
    requirements: [{ type: String }],
    salary: { type: String, default: "Negotiable" },
    salaryMin: { type: Number, default: null },
    salaryMax: { type: Number, default: null },
    workLocation: { type: String, default: "" },
    isDirectHire: { type: Boolean, default: false },
    applicationMode: {
      type: String,
      enum: ["project", "direct_hire"],
      default: "project",
    },
    domain: {
      type: String,
      enum: [
        "Full Stack",
        "Frontend",
        "Backend",
        "UI/UX",
        "Data Science",
        "DevOps",
        "Blockchain/Web3",
        "Game Development",
        "Networking",
        "Business Analytics",
        "Cybersecurity",
        "AI/ML",
        "Other",
      ],
      default: "Full Stack",
    },
    skillsRequired: [{ type: String, required: true }],
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "intermediate",
    },
    type: {
      type: String,
      enum: ["live", "simulated"],
      default: "simulated",
    },
    deliverables: [{ type: String }],
    resources: [{ type: String }], // links / attachments
    durationDays: { type: Number, required: true, default: 7 },
    deadline: { type: Date },
    maxCandidates: { type: Number, default: 0 }, // 0 = unlimited
    status: {
      type: String,
      enum: ["draft", "open", "closed", "archived"],
      default: "open",
    },
    experienceRequired: {
      type: String,
      enum: ["fresher", "0-1", "1+", "2+", "3+", "5+", "custom"],
      default: "fresher",
    },
    customExperience: { type: String, default: "" },
    hiringGoal: { type: Number, default: 1 },
    isPaidSlot: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

projectSchema.index({ status: 1, domain: 1 });
projectSchema.index({ company: 1, createdAt: -1 });
projectSchema.index({ applicationMode: 1, isDeleted: 1, status: 1 });
projectSchema.index({ isDeleted: 1, deletedAt: -1 });
projectSchema.index({ applicationMode: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model("Project", projectSchema);
