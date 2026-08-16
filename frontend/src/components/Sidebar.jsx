import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  UserCircle,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut,
  FolderKanban,
  Send,
  MessageSquareQuote,
  Shield,
  Menu,
  X,
  Archive,
  Building2,
  Award,
  ClipboardList,
  CalendarClock,
} from "lucide-react";

const roleNavItems = {
  candidate: [
    { to: "/candidate/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/projects", label: "Browse Hiring", icon: Briefcase },
    { to: "/candidate/feedback", label: "My Feedback", icon: MessageSquareQuote },
    { to: "/profile", label: "Profile", icon: UserCircle },
  ],
  company: [
    { to: "/company/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/company/projects/new", label: "Create Project Based Job", icon: FolderKanban },
    { to: { pathname: "/company/projects/new", search: "?mode=direct" }, label: "Create Job", icon: Briefcase },
    { to: "/profile", label: "Profile", icon: UserCircle },
  ],
  evaluator: [
    { to: "/evaluator/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/evaluator/applications", label: "Application Review", icon: Users },
    { to: "/evaluator/submissions", label: "Evaluation Queue", icon: FileText },
    { to: "/evaluator/interview/dashboard", label: "Interviews", icon: CalendarClock },
    { to: "/profile", label: "Profile", icon: UserCircle },
  ],
  admin: [
    { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/applications", label: "Applications", icon: Briefcase },
    { to: "/admin/verifications", label: "Verify Candidates", icon: Users },
    { to: "/admin/manage-jobs", label: "Manage Jobs & Projects", icon: ClipboardList },
    { to: "/admin/users", label: "Manage Users", icon: Shield },
    { to: "/admin/deleted-reports", label: "Deleted Reports", icon: Archive },
    { to: "/admin/hired-candidates", label: "Hired Candidates", icon: Award },
    { to: "/profile", label: "Profile", icon: UserCircle },
  ],
};

const Sidebar = ({ isMobileOpen, onMobileClose }) => {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const navItems = roleNavItems[user?.role] || [];

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 h-16 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="MentriQ Forge" className="h-8 w-auto" />
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-heading font-bold text-slate-900"
            >
              MentriQ Forge
            </motion.span>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
        <button
          onClick={onMobileClose}
          aria-label="Close navigation menu"
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto hide-scrollbar">
        {navItems.map((item) => {
          const toPath = typeof item.to === "string" ? item.to : item.to.pathname;
          const isActive = location.pathname === toPath || location.pathname.startsWith(toPath + "/");
          return (
            <NavLink
              key={toPath}
              to={item.to}
              onClick={onMobileClose}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200 group
                ${isActive
                  ? "bg-forge-primary/10 text-forge-primary"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }
              `}
            >
              <item.icon className={`w-5 h-5 shrink-0 ${isActive ? "text-forge-primary" : "text-slate-400 group-hover:text-slate-600"}`} />
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {item.label}
                </motion.span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-3 space-y-1">
        {(user?.role === "company" || user?.role === "candidate") && (
          <NavLink
            to={user?.role === "company" ? "/company/settings" : "/candidate/settings"}
            onClick={onMobileClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200"
          >
            <Settings className="w-5 h-5 shrink-0 text-slate-400" />
            {!collapsed && <span>Settings</span>}
          </NavLink>
        )}
        <button
          onClick={() => { logout(); onMobileClose(); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Log Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={`
          hidden lg:flex flex-col bg-white border-r border-slate-200 h-screen sticky top-0
          transition-all duration-300 ease-in-out
          ${collapsed ? "w-[72px]" : "w-64"}
        `}
      >
        {sidebarContent}
      </aside>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={onMobileClose}
          >
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="absolute left-0 top-0 bottom-0 w-11/12 max-w-sm sm:w-80 md:w-96 bg-white border-r border-slate-200"
              id="mobile-sidebar"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              onClick={(e) => e.stopPropagation()}
            >
              {sidebarContent}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
