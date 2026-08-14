import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "./ui/Button";
import { LogIn, UserPlus, ChevronDown, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Dropdown, { DropdownItem } from "./ui/Dropdown";
import Avatar from "./ui/Avatar";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  let mobilePortal = null;
  if (mobileOpen && typeof document !== "undefined") {
    mobilePortal = createPortal(
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
        onClick={() => setMobileOpen(false)}
      >
        <motion.aside
          initial={{ x: -320 }}
          animate={{ x: 0 }}
          exit={{ x: -320 }}
          transition={{ type: "spring", damping: 25, stiffness: 250 }}
          className="absolute left-0 top-0 bottom-0 w-11/12 max-w-sm sm:w-80 md:w-96 bg-white border-r border-slate-200 p-0 overflow-y-auto h-full"
          id="mobile-site-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 bg-gradient-to-br from-forge-primary/8 to-forge-secondary/8 rounded-b-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="MentriQ Forge" className="h-8 w-auto" />
                <div>
                  <p className="font-heading font-bold text-slate-900 ">MentriQ</p>
                  <p className="text-xs text-slate-400">Forge</p>
                </div>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="p-4">
            <nav className="space-y-2 mb-4">
              <Link to="/projects" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100">Browse Hiring</Link>
              <Link to="/how-it-works" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100">How It Works</Link>
            </nav>

            <div className="mb-4">
              <Link to="/register" onClick={() => setMobileOpen(false)} className="block w-full text-center px-3 py-2 rounded-xl bg-forge-primary text-white font-medium">Get Started</Link>
            </div>

            <div className="border-t border-slate-100 pt-4">
              {user ? (
                <div className="flex items-center gap-3 mb-4">
                  <Avatar name={user.name} size="md" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 mb-4">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100">Log In</Link>
                </div>
              )}

              {user && (
                <div className="space-y-2">
                  <button onClick={() => { navigate('/' + user.role + '/dashboard'); setMobileOpen(false); }} className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100">Dashboard</button>
                  <button onClick={() => { navigate('/profile'); setMobileOpen(false); }} className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100">Profile</button>
                  <button onClick={() => { logout(); setMobileOpen(false); navigate('/'); }} className="w-full text-left px-3 py-2 rounded-xl text-red-600 hover:bg-red-50">Log Out</button>
                </div>
              )}
            </div>
          </div>
        </motion.aside>
      </motion.div>, document.body);
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="app-container h-16 lg:h-18 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="MentriQ Forge" className="h-8 w-auto" />
          <div className="hidden sm:block">
            <span className="font-heading font-bold text-lg text-slate-900">MentriQ</span>
            <span className="font-heading font-light text-lg text-slate-400"> Forge</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <Link
            to="/projects"
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
          >
            Browse Hiring
          </Link>
          <Link
            to="/how-it-works"
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
          >
            How It Works
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-site-menu"
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>
          {user ? (
            <Dropdown
              trigger={
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors">
                  <Avatar name={user.name} size="sm" />
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-slate-900 leading-tight">{user.name}</p>
                    <p className="text-xs text-slate-400 capitalize">{user.role}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
              }
            >
              <DropdownItem
                icon={() => (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                )}
                onClick={() => navigate("/" + user.role + "/dashboard")}
              >
                Dashboard
              </DropdownItem>
              <DropdownItem
                icon={() => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                onClick={() => navigate("/profile")}
              >
                Profile
              </DropdownItem>
              <hr className="my-1 border-slate-200" />
              <DropdownItem
                icon={() => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>}
                onClick={() => { logout(); navigate("/"); }}
                danger
              >
                Log Out
              </DropdownItem>
            </Dropdown>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 transition-all"
              >
                <LogIn className="w-4 h-4" />
                Log In
              </Link>
              <Link to="/register">
                <Button size="md">
                  <UserPlus className="w-4 h-4" />
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
      {mobilePortal}
    </header>
  );
};

export default Navbar;
