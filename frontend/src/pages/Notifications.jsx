import React from "react";
import { motion } from "framer-motion";
import { BellRing, CheckCheck, Inbox, Megaphone, Info, Trash2 } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";
import { PageHeader, Card, Badge } from "../components/ui";
import { useAuth } from "../context/AuthContext";

const typeMeta = {
  announcement: { label: "Announcement", icon: BellRing, cls: "bg-purple-100 text-purple-600", badge: "purple" },
  info: { label: "Info", icon: Info, cls: "bg-sky-100 text-sky-600", badge: "blue" },
  reminder: { label: "Reminder", icon: Megaphone, cls: "bg-amber-100 text-amber-600", badge: "amber" },
};

const formatDate = (d) =>
  new Date(d).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const NotificationsPage = () => {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <PageHeader
          title="Notifications"
          subtitle={`Updates from the MentriQ Forge Management Team${user ? ` • ${user.name}` : ""}`}
        />
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-forge-primary/10 px-4 py-2 text-sm font-bold text-forge-primary hover:bg-forge-primary/20 transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read ({unreadCount})
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card className="py-16 flex flex-col items-center justify-center text-center">
          <span className="p-4 rounded-2xl bg-slate-100 text-slate-400 mb-4">
            <Inbox className="w-8 h-8" />
          </span>
          <p className="text-base font-semibold text-slate-700">No notifications yet</p>
          <p className="text-sm text-slate-400 mt-1">
            When the Management Team shares an update, it will appear here.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const meta = typeMeta[n.type] || typeMeta.info;
            const Icon = meta.icon;
            return (
              <motion.div
                key={n._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl border p-4 transition-colors ${
                  n.read ? "bg-white border-slate-200" : "bg-forge-primary/5 border-forge-primary/20"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`p-2.5 rounded-xl shrink-0 ${meta.cls}`}>
                    <Icon className="w-5 h-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-forge-primary" aria-label="Unread" />
                      )}
                      <p className={`text-sm ${n.read ? "font-medium text-slate-800" : "font-bold text-slate-900"}`}>
                        {n.title}
                      </p>
                      <Badge color={meta.badge}>{meta.label}</Badge>
                    </div>
                    <p className="text-sm text-slate-600 mt-1.5 whitespace-pre-line">{n.message}</p>
                    <div className="flex items-center justify-between mt-2.5">
                      <p className="text-xs text-slate-400">
                        MentriQ Forge Management Team · {formatDate(n.createdAt)}
                      </p>
                      {!n.read && (
                        <button
                          type="button"
                          onClick={() => markRead(n._id)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-forge-primary hover:text-forge-primary-dark"
                        >
                          <CheckCheck className="w-3.5 h-3.5" /> Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;