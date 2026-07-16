const mongoose = require("mongoose");

const evaluationSchema = new mongoose.Schema(
  {
    submission: { type: mongoose.Schema.Types.ObjectId, ref: "Submission", required: true },
    application: { type: mongoose.Schema.Types.ObjectId, ref: "Application", required: true },
    evaluator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Scoring rubric (0-10 each)
    scores: {
      codeQuality: { type: Number, min: 0, max: 10, default: 0 },
      problemSolving: { type: Number, min: 0, max: 10, default: 0 },
      standardsAdherence: { type: Number, min: 0, max: 10, default: 0 },
      completeness: { type: Number, min: 0, max: 10, default: 0 },
      communication: { type: Number, min: 0, max: 10, default: 0 },
    },
    overallScore: { type: Number, min: 0, max: 10, default: 0 }, // computed average
    feedback: { type: String, required: true },
    recommendation: {
      type: String,
      enum: ["shortlist", "reject", "needs_upskilling"],
      required: true,
    },
  },
  { timestamps: true }
);

evaluationSchema.pre("save", function (next) {
  const s = this.scores;
  const values = [s.codeQuality, s.problemSolving, s.standardsAdherence, s.completeness, s.communication];
  this.overallScore = Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2));
  next();
});

module.exports = mongoose.model("Evaluation", evaluationSchema);
