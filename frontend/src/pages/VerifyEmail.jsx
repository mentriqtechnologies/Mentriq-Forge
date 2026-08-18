import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

const getRolePath = (role) => {
  if (role === "company") return "/company/dashboard";
  if (role === "candidate") return "/candidate/dashboard";
  if (role === "evaluator") return "/evaluator/dashboard";
  if (role === "admin") return "/admin/dashboard";
  return "/";
};

const VerifyEmail = () => {
  const navigate = useNavigate();
  const { user, verifyEmail } = useAuth();
  const [status, setStatus] = useState("verifying"); // verifying | success | needsLogin | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oobCode = params.get("oobCode");
    const mode = params.get("mode");

    if (mode !== "verifyEmail" || !oobCode) {
      setStatus("error");
      setMessage("This link is invalid or incomplete.");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const user = await verifyEmail(oobCode);
        if (cancelled) return;
        if (user) {
          setStatus("success");
        } else {
          setStatus("needsLogin");
        }
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        setMessage(
          err.code === "auth/expired-action-code"
            ? "This activation link has expired. Please request a new one from the login page."
            : err.code === "auth/invalid-action-code"
            ? "This activation link is invalid. Please try logging in again."
            : err.message || "Could not verify your email. Please try again."
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-surface">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="flex items-center gap-3 justify-center mb-8">
          <img src="/logo.png" alt="MentriQ Forge" className="h-9 w-auto" />
          <span className="font-heading font-bold text-xl text-slate-900">MentriQ Forge</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-subtle p-8 text-center">
          {status === "verifying" && (
            <>
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-7 h-7 text-forge-primary animate-spin" aria-hidden="true" />
              </div>
              <h1 className="text-xl font-bold font-heading text-slate-900 mb-2">Activating your account...</h1>
              <p className="text-sm text-slate-500">Please wait a moment.</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-emerald-600" aria-hidden="true" />
              </div>
              <h1 className="text-xl font-bold font-heading text-slate-900 mb-2">Account activated!</h1>
              <p className="text-sm text-slate-500 mb-6">
                Your email has been verified. You are now signed in.
              </p>
              <Button onClick={() => navigate(getRolePath(user?.role))} fullWidth>
                Continue to Dashboard
              </Button>
            </>
          )}

          {status === "needsLogin" && (
            <>
              <div className="w-14 h-14 rounded-full bg-sky-100 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-7 h-7 text-sky-600" aria-hidden="true" />
              </div>
              <h1 className="text-xl font-bold font-heading text-slate-900 mb-2">Email verified!</h1>
              <p className="text-sm text-slate-500 mb-6">
                Your account has been activated. Sign in with your email and password to continue.
              </p>
              <Button onClick={() => navigate("/login")} fullWidth>
                Go to Login
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-7 h-7 text-red-600" aria-hidden="true" />
              </div>
              <h1 className="text-xl font-bold font-heading text-slate-900 mb-2">Verification failed</h1>
              <p className="text-sm text-slate-500 mb-6">{message}</p>
              <Button onClick={() => navigate("/login")} fullWidth>
                Go to Login
              </Button>
            </>
          )}

          <p className="text-xs text-slate-400 mt-6">
            <Link to="/" className="text-forge-primary hover:text-forge-primary-dark font-medium">
              Back to home
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
