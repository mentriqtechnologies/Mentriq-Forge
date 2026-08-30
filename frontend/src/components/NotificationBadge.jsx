import React from "react";
import { Bell, XCircle, CheckCircle, Clock } from "lucide-react";
import { Badge } from "./ui";

const notificationColors = {
  applied: "blue",
  submitted: "green",
  under_review: "orange",
  shortlisted: "purple",
  company_reviewing: "blue",
  company_interview: "blue",
  decision_pending: "gray",
  interview_scheduled: "teal",
  rejected: "red",
  hired: "green",
};

export const NotificationBadge = ({ count, status }) => {
  const color = notificationColors[status] || "slate";

  if (count === 0) return null;

  return (
    <Badge
      color={color}
      className="relative"
      title={count > 99 ? "99+" : `${count} new`}
    >
      <Bell className="w-3.5 h-3.5 text-white" />
      {count > 0 && count <= 99 ? count : ""}
      {count > 99 && <span className="absolute -top-0.5 -right-0.5 text-xs font-bold bg-red-500 text-white rounded-full w-4 h-4">99+</span>}
    </Badge>
  );
};

export const useNotifications = () => {
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [recentNotifications, setRecentNotifications] = React.useState([]);

  // Mark notification as read
  const markAsRead = (id) => {
    setRecentNotifications((notifications) =>
      notifications.filter((n) => n.id !== id)
    );
    // Could also update unreadCount here
  };

  return {
    unreadCount,
    setUnreadCount,
    recentNotifications,
    setRecentNotifications,
    markAsRead,
  };
};