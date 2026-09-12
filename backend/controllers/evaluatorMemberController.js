const asyncHandler = require("express-async-handler");
const EvaluatorMember = require("../models/EvaluatorMember");

function normalizePhotoUrl(url) {
  if (!url) return "";
  const driveMatch = String(url).match(
    /(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=download&)?id=))([\w-]{10,})/i
  );
  if (driveMatch) return `https://drive.google.com/thumbnail?id=${driveMatch[1]}&sz=w1000`;
  return String(url).trim();
}

// @desc Get active evaluator team members (public)
// @route GET /api/evaluators
const getPublicEvaluators = asyncHandler(async (req, res) => {
  const members = await EvaluatorMember.find({ isActive: true })
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean();
  res.json({ success: true, members });
});

// @desc Admin list all evaluator team members (incl. inactive)
// @route GET /api/admin/evaluators
const getAllEvaluatorMembers = asyncHandler(async (req, res) => {
  const members = await EvaluatorMember.find({})
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean();
  res.json({ success: true, members });
});

// @desc Admin create evaluator team member
// @route POST /api/admin/evaluators
const createEvaluatorMember = asyncHandler(async (req, res) => {
  const { name, photo, evaluates, experience, rating, reviews, bio, tags, isActive, sortOrder } = req.body;

  if (!name || !evaluates || !experience) {
    res.status(400);
    throw new Error("Name, evaluates, and experience are required");
  }

  const member = await EvaluatorMember.create({
    name,
    photo: normalizePhotoUrl(photo),
    evaluates,
    experience,
    rating: rating != null ? rating : 4.8,
    reviews: reviews != null ? reviews : 0,
    bio: bio || "",
    tags: Array.isArray(tags) ? tags.map((t) => String(t).trim()).filter(Boolean) : [],
    isActive: isActive !== undefined ? Boolean(isActive) : true,
    sortOrder: sortOrder != null ? Number(sortOrder) : 0,
  });

  res.status(201).json({ success: true, member });
});

// @desc Admin update evaluator team member
// @route PUT /api/admin/evaluators/:id
const updateEvaluatorMember = asyncHandler(async (req, res) => {
  const member = await EvaluatorMember.findById(req.params.id);
  if (!member) {
    res.status(404);
    throw new Error("Evaluator member not found");
  }

  const { name, photo, evaluates, experience, rating, reviews, bio, tags, isActive, sortOrder } = req.body;

  if (name !== undefined) member.name = name;
  if (photo !== undefined) member.photo = normalizePhotoUrl(photo);
  if (evaluates !== undefined) member.evaluates = evaluates;
  if (experience !== undefined) member.experience = experience;
  if (rating !== undefined) member.rating = rating;
  if (reviews !== undefined) member.reviews = reviews;
  if (bio !== undefined) member.bio = bio;
  if (tags !== undefined) {
    member.tags = Array.isArray(tags) ? tags.map((t) => String(t).trim()).filter(Boolean) : [];
  }
  if (isActive !== undefined) member.isActive = Boolean(isActive);
  if (sortOrder !== undefined) member.sortOrder = Number(sortOrder);

  await member.save();
  res.json({ success: true, member });
});

// @desc Admin delete evaluator team member
// @route DELETE /api/admin/evaluators/:id
const deleteEvaluatorMember = asyncHandler(async (req, res) => {
  const member = await EvaluatorMember.findById(req.params.id);
  if (!member) {
    res.status(404);
    throw new Error("Evaluator member not found");
  }
  await member.deleteOne();
  res.json({ success: true, message: "Evaluator member removed" });
});

module.exports = {
  getPublicEvaluators,
  getAllEvaluatorMembers,
  createEvaluatorMember,
  updateEvaluatorMember,
  deleteEvaluatorMember,
};