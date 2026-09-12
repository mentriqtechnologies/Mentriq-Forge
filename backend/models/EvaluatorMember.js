const mongoose = require("mongoose");

const evaluatorMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    photo: { type: String, default: "" },
    evaluates: { type: String, required: true, trim: true },
    experience: { type: String, required: true, trim: true },
    rating: { type: Number, default: 4.8, min: 0, max: 5 },
    reviews: { type: Number, default: 0, min: 0 },
    bio: { type: String, default: "" },
    tags: [{ type: String }],
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

evaluatorMemberSchema.index({ isActive: 1, sortOrder: 1 });

module.exports = mongoose.model("EvaluatorMember", evaluatorMemberSchema);