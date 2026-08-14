import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, ArrowRight, Building2, Users } from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const normalizedEmail = form.email.trim().toLowerCase();
      const user = await login(normalizedEmail, form.password);
      const path =
        user.role === "company"
          ? "/company/dashboard"
          : user.role === "candidate"
          ? "/candidate/dashboard"
          : "/admin/dashboard";
      navigate(path);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const apiBaseUrl = import.meta.env.VITE_API_URL || "/api";
  const githubAuthUrl = `${apiBaseUrl.replace(/\/$/, "")}/auth/github`;

  return (
    <div className="min-h-screen flex">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 flex items-center justify-center px-6 py-12"
      >
        <div className="w-full max-w-sm">
          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <img src="/logo.png" alt="MentriQ Forge" className="h-9 w-auto" />
              <span className="font-heading font-bold text-xl text-slate-900">MentriQ Forge</span>
            </div>
            <h1 className="text-3xl font-bold font-heading text-slate-900 mb-2">Welcome back</h1>
            <p className="text-slate-500">Sign in to your account to continue.</p>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert"
              className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4 mb-6 flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4 text-red-600" aria-hidden="true" />
              </div>
              {error}
            </motion.div>
          )}

          <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@company.com"
              icon={Mail}
              autoComplete="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <div>
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                icon={Lock}
                autoComplete="current-password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <div className="flex items-center justify-between mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-forge-primary focus:ring-forge-primary/30" />
                  <span className="text-xs text-slate-500">Remember me</span>
                </label>
                <div className="flex items-center gap-3">
                  <Link to="/forgot-password" className="text-xs text-forge-primary hover:text-forge-primary-dark font-medium">
                    Forgot password?
                  </Link>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-pressed={showPassword}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="text-xs text-forge-primary hover:text-forge-primary-dark font-medium"
                  >
                    {showPassword ? "Hide" : "Show"} password
                  </button>
                </div>
              </div>
            </div>

            <Button type="submit" fullWidth loading={loading} icon={ArrowRight} size="lg">
              Sign In
            </Button>
          </motion.form>

          <motion.p variants={itemVariants} className="text-center text-xs text-slate-400 mt-4">
            By continuing, you agree to MentriQ Forge's{" "}
            <Link to="/terms-of-service" className="text-forge-primary hover:text-forge-primary-dark font-medium underline underline-offset-2">Terms of Service</Link>{" "}
            and{" "}
            <Link to="/privacy-policy" className="text-forge-primary hover:text-forge-primary-dark font-medium underline underline-offset-2">Privacy Policy</Link>.
          </motion.p>

          <motion.div variants={itemVariants} className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-xs font-medium text-slate-400">OR CONTINUE WITH</span>
            </div>
          </motion.div>

          <motion.p variants={itemVariants} className="text-center text-xs text-slate-500 -mt-4 mb-4">
            Use your Google account to get into MentriQ Forge in one tap.
          </motion.p>

          <motion.div variants={itemVariants} className="space-y-3">
            <a
              href={`${apiBaseUrl.replace(/\/$/, "")}/auth/google`}
              aria-label="Continue with Google"
              className="flex items-center justify-center gap-3 w-full py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" fill="#34A853" />
                <path d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z" fill="#EA4335" />
              </svg>
              Continue with Google
            </a>
            <a
              href={githubAuthUrl}
              className="flex items-center justify-center gap-3 w-full py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub
            </a>
          </motion.div>

          <motion.p variants={itemVariants} className="text-sm text-slate-500 mt-8 text-center">
            Don't have an account?{" "}
            <Link to="/register" className="text-forge-primary hover:text-forge-primary-dark font-semibold">
              Create one
            </Link>
          </motion.p>

          <motion.div variants={itemVariants} className="flex items-center justify-center gap-6 mt-6">
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <Building2 className="w-3.5 h-3.5" /> For Companies
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <Users className="w-3.5 h-3.5" /> For Candidates
            </span>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="hidden lg:flex flex-1 bg-gradient-to-br from-forge-primary via-forge-primary-dark to-slate-900 relative overflow-hidden"
      >
        <div className="absolute inset-0">
          <div className="absolute top-20 -right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-forge-secondary/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-white/[0.03] rounded-full blur-2xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 py-24">
          <div className="max-w-md">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping-slow" />
              Platform Status — Active
            </div>
            <h2 className="text-4xl font-bold font-heading text-white leading-tight mb-4">
              The future of<br />
              <span className="text-gradient-light">skill-based hiring</span>
            </h2>
            <p className="text-white/70 text-lg leading-relaxed mb-8">
              MentriQ Forge connects companies with top talent through real-world projects. 
              Show what you can build, not just what you know.
            </p>
            <div className="space-y-4">
              {[
                { label: "Project Based Job Assessments", desc: "Real challenges, real skills" },
                { label: "Expert Evaluation", desc: "Rubric-based scoring by MentriQ experts" },
                { label: "Direct Hiring Pipeline", desc: "Shortlisted to interview in one flow" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{item.label}</p>
                    <p className="text-white/50 text-xs">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
