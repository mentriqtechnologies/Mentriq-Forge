import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Megaphone, X } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";

// Branded popup shown to every user when the Management Team publishes a new
// announcement — "You have a new notification from the MentriQ Forge Management Team".
const NotificationToast = () => {
  const { toast, dismissToast, markRead } = useNotifications();

  const handleView = () => {
    if (toast) markRead(toast._id);
    dismissToast();
  };

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 80 }}
          transition={{ type: "spring", damping: 22, stiffness: 260 }}
          className="fixed bottom-5 right-5 z-[60] w-[360px] max-w-[calc(100vw-2.5rem)]"
          role="status"
          aria-live="polite"
        >
          <div className="bg-white rounded-2xl shadow-modal border border-slate-200 overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-forge-primary to-forge-secondary" />
            <div className="flex items-start gap-3 p-4">
              <span className="p-2.5 rounded-xl bg-forge-primary/10 text-forge-primary shrink-0">
                <Megaphone className="w-5 h-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  MentriQ Forge Management Team
                </p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{toast.title}</p>
                <p className="text-xs text-slate-500 mt-1 line-clamp-3">{toast.message}</p>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    type="button"
                    onClick={handleView}
                    className="text-xs font-bold text-forge-primary hover:text-forge-primary-dark"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={dismissToast}
                    className="text-xs font-medium text-slate-400 hover:text-slate-600"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={dismissToast}
                aria-label="Dismiss notification"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 self-start shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationToast;