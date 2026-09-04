import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu } from "lucide-react";
import Avatar from "./ui/Avatar";
import NotificationBell from "./NotificationBell";
import Dropdown, { DropdownItem, DropdownDivider } from "./ui/Dropdown";
import { Settings, LogOut, UserCircle } from "lucide-react";

const Topbar = ({ onMenuToggle, mobileOpen }) => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          aria-label="Open navigation menu"
          aria-expanded={mobileOpen}
          aria-controls="mobile-sidebar"
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <Menu className="w-5 h-5" aria-hidden="true" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {user?.role}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <NotificationBell />

        <Dropdown
          label="Account menu"
          trigger={
            <button type="button" className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors">
              <Avatar name={user?.name} size="sm" />
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-slate-900 leading-tight">{user?.name}</p>
                <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
              </div>
            </button>
          }
        >
          <div className="px-4 py-2 border-b border-slate-200">
            <p className="text-sm font-medium text-slate-900">{user?.name}</p>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>
          <DropdownItem icon={UserCircle} onClick={() => window.location.href = "/profile"}>
            Profile
          </DropdownItem>
          {(user?.role === "company" || user?.role === "candidate") && (
            <DropdownItem icon={Settings} onClick={() => window.location.href = user?.role === "company" ? "/company/settings" : "/candidate/settings"}>
              Settings
            </DropdownItem>
          )}
          <DropdownDivider />
          <DropdownItem icon={LogOut} onClick={logout} danger>
            Log Out
          </DropdownItem>
        </Dropdown>
      </div>
    </header>
  );
};

export default Topbar;