import React, { useState, useRef, useEffect } from "react";
import { Bell, CheckCheck, Megaphone, Info, BellRing, Inbox } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "../context/NotificationContext";

const typeMeta = {
  announcement: { icon: BellRing, cls: "bg-purple-100 text-purple-600" },
  info: { icon: Info, cls: "bg-sky-100 text-sky-600" },
  reminder: { icon: Megaphone, cls: "bg-amber-100 text-amber-600" },
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

const NotificationBell = () => {
  const { notifications, unreadCount, markRead, markAllRead, refresh } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
        onClick={() => {
          setOpen((o) => !o);
          refresh();
        }}
        className="relative p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
      >
        <Bell className="w-5 h-5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-modal border border-slate-200 z-40 overflow-hidden"
            role="dialog"
            aria-label="Notifications"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm font-bold text-slate-900"
              >
                Notifications
              </button>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="inline-flex items-center gap-1 text-xs font-medium text-forge-primary hover:text-forge-primary-dark"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="p-8 flex flex-col items-center justify-center text-center">
                  <Inbox className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-sm text-slate-500">No notifications yet</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Updates from the MentriQ Forge Management Team will appear here.
                  </p>
                </div>
              ) : (
                notifications.slice(0, 20).map((n) => {
                  const meta = typeMeta[n.type] || typeMeta.info;
                  const Icon = meta.icon;
                  return (
                    <button
                      key={n._id}
                      type="button"
                      onClick={() => markRead(n._id)}
                      className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors ${n.read ? "" : "bg-forge-primary/5"}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`p-2 rounded-lg shrink-0 ${meta.cls}`}>
                          <Icon className="w-4 h-4" />
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            {!n.read && (
                              <span className="w-2 h-2 rounded-full bg-forge-primary shrink-0" aria-label="Unread" />
                            )}
                            <p className={`text-sm ${n.read ? "text-slate-700" : "font-semibold text-slate-900"} truncate`}>
                              {n.title}
                            </p>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-[11px] text-slate-400 mt-1">
                            {timeAgo(n.createdAt)} · MentriQ Forge Management Team
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;