import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  // The popup that slides in when a new notification arrives.
  const [toast, setToast] = useState(null);
  const seenIds = useRef(new Set());
  const firstFetch = useRef(true);
  const toastTimer = useRef(null);

  const showToast = useCallback((notification) => {
    clearTimeout(toastTimer.current);
    setToast(notification);
    toastTimer.current = setTimeout(() => setToast(null), 8000);
  }, []);

  // Fetch the latest list for the logged-in user. Detects brand-new items and
  // raises the popup, but only for notifications that arrive after this session
  // has loaded (older unread notifications never pop).
  const refresh = useCallback(async () => {
    try {
      const res = await api.get("/notifications/my");
      const list = res.data.notifications || [];
      setNotifications(list);
      setUnreadCount(list.filter((n) => !n.read).length);

      if (firstFetch.current) {
        firstFetch.current = false;
        seenIds.current = new Set(list.map((n) => n._id));
      } else {
        const prevIds = seenIds.current;
        const fresh = list.filter((n) => !n.read && !prevIds.has(n._id));
        if (fresh.length > 0) {
          const newest = fresh.reduce(
            (a, b) => (new Date(a.createdAt) > new Date(b.createdAt) ? a : b)
          );
          showToast(newest);
        }
        seenIds.current = new Set(list.map((n) => n._id));
      }
      return list;
    } catch {
      return [];
    }
  }, [showToast]);

  const refreshCount = useCallback(async () => {
    try {
      const res = await api.get("/notifications/my/unread-count");
      setUnreadCount(res.data.count || 0);
    } catch {
      /* ignore */
    }
  }, []);

  // Load on login / role change, then poll for new notifications every 20s.
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setToast(null);
      clearTimeout(toastTimer.current);
      seenIds.current = new Set();
      firstFetch.current = true;
      return;
    }
    refresh();
    const timer = setInterval(refresh, 20000);
    return () => {
      clearInterval(timer);
      clearTimeout(toastTimer.current);
    };
  }, [user, refresh]);

  const markRead = useCallback(
    async (id) => {
      try {
        await api.put(`/notifications/${id}/read`);
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, read: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {
        /* ignore */
      }
    },
    []
  );

  const markAllRead = useCallback(async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      /* ignore */
    }
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  const openInbox = useCallback(() => {
    navigate("/notifications");
  }, [navigate]);

  const createNotification = useCallback(
    async (payload) => api.post("/notifications", payload),
    []
  );

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toast,
        refresh,
        refreshCount,
        markRead,
        markAllRead,
        dismissToast,
        openInbox,
        createNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);