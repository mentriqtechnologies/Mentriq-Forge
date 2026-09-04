const asyncHandler = require("express-async-handler");
const Notification = require("../models/Notification");
const User = require("../models/User");

// Only self-registered candidates/companies that have activated their account
// (verified email) count as recipients. Staff (admin/evaluator) accounts are
// created directly by admins and are trusted without email activation.
const activeUserMatch = {
  $or: [{ role: { $in: ["admin", "evaluator"] } }, { isVerified: true }],
};

const VALID_ROLES = ["candidate", "company", "evaluator", "admin"];

// @desc Admin sends a notification to a chosen audience
// @route POST /api/notifications
const createNotification = asyncHandler(async (req, res) => {
  const { title, message, type, targetAudience = "all", targetRoles } = req.body;

  if (!title?.trim()) {
    res.status(400);
    throw new Error("Notification title is required");
  }
  if (!message?.trim()) {
    res.status(400);
    throw new Error("Notification message is required");
  }
  if (!["all", "roles"].includes(targetAudience)) {
    res.status(400);
    throw new Error("Audience must be 'all' or 'roles'");
  }

  let recipientsQuery = activeUserMatch;
  if (targetAudience === "roles") {
    const roles = Array.isArray(targetRoles)
      ? targetRoles.filter((r) => VALID_ROLES.includes(r))
      : [];
    if (roles.length === 0) {
      res.status(400);
      throw new Error("Select at least one role to notify");
    }
    recipientsQuery = { ...activeUserMatch, role: { $in: roles } };
  }

  const recipients = await User.find(recipientsQuery).select("_id").lean();
  if (recipients.length === 0) {
    res.status(400);
    throw new Error("No active users match the selected audience");
  }

  const notification = await Notification.create({
    title: title.trim(),
    message: message.trim(),
    type: type && ["announcement", "info", "reminder"].includes(type) ? type : "announcement",
    targetAudience,
    targetRoles: targetAudience === "roles" ? (Array.isArray(targetRoles) ? targetRoles.filter((r) => VALID_ROLES.includes(r)) : []) : [],
    recipients: recipients.map((u) => u._id),
    createdBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    notification,
    recipientsCount: recipients.length,
  });
});

// @desc Logged-in user's own notifications (newest first)
// @route GET /api/notifications/my
const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({
    recipients: req.user._id,
    active: true,
  })
    .sort({ createdAt: -1 })
    .limit(100);

  const results = notifications.map((n) => ({
    _id: n._id,
    title: n.title,
    message: n.message,
    type: n.type,
    createdAt: n.createdAt,
    read: n.readBy.some((id) => id.toString() === req.user._id.toString()),
  }));

  res.json({ success: true, notifications: results });
});

// @desc Unread count for the logged-in user (powers the badge)
// @route GET /api/notifications/my/unread-count
const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({
    recipients: req.user._id,
    active: true,
    readBy: { $ne: req.user._id },
  });
  res.json({ success: true, count });
});

// @desc Mark one notification as read
// @route PUT /api/notifications/:id/read
const markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    recipients: req.user._id,
  });
  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }
  await Notification.updateOne(
    { _id: notification._id },
    { $addToSet: { readBy: req.user._id } }
  );
  res.json({ success: true });
});

// @desc Mark all of the user's notifications as read
// @route PUT /api/notifications/read-all
const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipients: req.user._id, readBy: { $ne: req.user._id } },
    { $addToSet: { readBy: req.user._id } }
  );
  res.json({ success: true });
});

// @desc Admin overview of all sent notifications (with audience + read stats)
// @route GET /api/notifications
const getAllNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find()
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 })
    .limit(200);

  const results = notifications.map((n) => ({
    _id: n._id,
    title: n.title,
    message: n.message,
    type: n.type,
    targetAudience: n.targetAudience,
    targetRoles: n.targetRoles,
    createdAt: n.createdAt,
    active: n.active,
    createdByName: n.createdBy?.name || "MentriQ Forge",
    recipientsCount: n.recipients.length,
    readCount: n.readBy.length,
  }));

  res.json({ success: true, notifications: results });
});

// @desc Admin deletes / pulls a notification (disappears for everyone)
// @route DELETE /api/notifications/:id
const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }
  await notification.deleteOne();
  res.json({ success: true, message: "Notification removed" });
});

module.exports = {
  createNotification,
  getMyNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
  getAllNotifications,
  deleteNotification,
};