const express = require("express");
const router = express.Router();
const {
  createNotification,
  getMyNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
  getAllNotifications,
  deleteNotification,
} = require("../controllers/notificationController");
const { protect, authorize } = require("../middleware/auth");

// User-facing endpoints (any logged-in role)
router.get("/my", protect, getMyNotifications);
router.get("/my/unread-count", protect, getUnreadCount);
router.put("/read-all", protect, markAllRead);
router.put("/:id/read", protect, markRead);

// Admin management endpoints
router.post("/", protect, authorize("admin"), createNotification);
router.get("/", protect, authorize("admin"), getAllNotifications);
router.delete("/:id", protect, authorize("admin"), deleteNotification);

module.exports = router;