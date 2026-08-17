import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, User, Building2, ArrowRight, Users, Briefcase, Check } from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import api from "../api/axios";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const benefits = {
  candidate: [
    "Work on real-world projects",
    "Get evaluated by industry experts",
    "Build your portfolio",
    "Get shortlisted for top companies",
  ],
  company: [
    "Post real project briefs",
    "Evaluate candidates through work",
    "Access pre-vetted talent pool",
    "Reduce hiring time by 60%",
  ],
};

const decodeJwtPayload = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
};

const Register = () => {
  const { register, setUser } = useAuth();
  const navigate = useNavigate();
  const [googleSignup, setGoogleSignup] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("google_signup");
  });
  const googleDraft = googleSignup ? decodeJwtPayload(googleSignup) : null;
  const [role, setRole] = useState(googleDraft?.role === "company" ? "company" : "candidate");
  const [form, setForm] = useState({
    name: googleDraft?.name || "",
    email: googleDraft?.email || "",
    password: "",
    companyName: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (googleSignup) {
        const res = await api.post("/auth/google/signup", {
          signupToken: googleSignup,
          role,
          companyName: form.companyName,
        });
        localStorage.setItem("forge_token", res.data.token);
        localStorage.setItem("forge_user", JSON.stringify(res.data.user));
        setUser(res.data.user);
        navigate(res.data.user.role === "company" ? "/company/dashboard" : "/candidate/dashboard");
      } else {
        const user = await register({ ...form, role });
        navigate(user.role === "company" ? "/company/dashboard" : "/candidate/dashboard");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Registration failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-3xl font-bold font-heading text-slate-900 mb-2">
              {googleSignup ? "Complete your registration" : "Create your account"}
            </h1>
            <p className="text-slate-500">
              {googleSignup
                ? "Your Google account is verified. Pick a role to finish."
                : "Start your journey with MentriQ Forge."}
            </p>
          </motion.div>

          {googleSignup && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              role="status"
              className="bg-sky-50 border border-sky-200 text-sky-700 text-sm rounded-xl p-4 mb-6 flex items-start gap-3"
            >
              <Mail className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
              <span>
                No account found with <strong>{form.email}</strong>. Please create your account below to continue — you'll
                get access based on the role you choose.
              </span>
            </motion.div>
          )}

          <motion.div variants={itemVariants} className="flex gap-2 p-1 rounded-xl bg-slate-100 mb-6">
            {[
              { value: "candidate", label: "Candidate", icon: Users },
              { value: "company", label: "Company", icon: Building2 },
            ].map((r) => {
              const Icon = r.icon;
              const isActive = role === r.value;
              return (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  aria-pressed={isActive}
                  aria-label={`Register as ${r.label}`}
                  className={`
                    flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold capitalize
                    transition-all duration-200
                    ${isActive
                      ? "bg-white text-forge-primary shadow-subtle"
                      : "text-slate-500 hover:text-slate-700"
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {r.label}
                </button>
              );
            })}
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

          {!googleSignup && (
            <>
              <motion.div variants={itemVariants} className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 text-xs font-medium text-slate-400">OR CONTINUE WITH</span>
                </div>
              </motion.div>

              <motion.a
                variants={itemVariants}
                href={`${(import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "")}/auth/google?role=${role}`}
                aria-label="Continue with Google"
                className="flex items-center justify-center gap-3 w-full py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 mb-6"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" fill="#34A853" />
                  <path d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z" fill="#EA4335" />
                </svg>
                Continue with Google
              </motion.a>
            </>
          )}

          <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full name"
              placeholder="John Doe"
              icon={User}
              autoComplete="name"
              required
              disabled={Boolean(googleSignup)}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            {role === "company" && (
              <Input
                label="Company name"
                placeholder="Acme Inc."
                icon={Building2}
                autoComplete="organization"
                required
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              />
            )}

            <Input
              label="Email address"
              type="email"
              placeholder="you@company.com"
              icon={Mail}
              autoComplete="email"
              required
              disabled={Boolean(googleSignup)}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            {!googleSignup && (
              <Input
                label="Password"
                type="password"
                placeholder="Min. 6 characters"
                icon={Lock}
                autoComplete="new-password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            )}

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-forge-primary focus:ring-forge-primary/30 shrink-0"
              />
              <span className="text-xs text-slate-500 leading-relaxed">
                I have read and agree to the{" "}
                <Link to="/terms-of-service" className="text-forge-primary hover:text-forge-primary-dark font-medium underline underline-offset-2">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy-policy" className="text-forge-primary hover:text-forge-primary-dark font-medium underline underline-offset-2">
                  Privacy Policy
                </Link>.
              </span>
            </label>

            <Button type="submit" fullWidth loading={loading} icon={ArrowRight} size="lg" disabled={!accepted}>
              Create Account
            </Button>
          </motion.form>

          <motion.p variants={itemVariants} className="text-center text-xs text-slate-400 mt-4">
            By continuing, you agree to MentriQ Forge's{" "}
            <Link to="/terms-of-service" className="text-forge-primary hover:text-forge-primary-dark font-medium underline underline-offset-2">Terms of Service</Link>{" "}
            and{" "}
            <Link to="/privacy-policy" className="text-forge-primary hover:text-forge-primary-dark font-medium underline underline-offset-2">Privacy Policy</Link>.
          </motion.p>

          <motion.p variants={itemVariants} className="text-sm text-slate-500 mt-8 text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-forge-primary hover:text-forge-primary-dark font-semibold">
              Sign in
            </Link>
          </motion.p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="hidden lg:flex flex-1 bg-gradient-to-br from-slate-900 to-slate-950 relative overflow-hidden"
      >
        <div className="absolute inset-0">
          <div className="absolute top-20 -right-20 w-96 h-96 bg-forge-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-forge-secondary/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 py-24">
          <div className="max-w-md">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-semibold mb-8">
              <Briefcase className="w-3.5 h-3.5" />
              {role === "candidate" ? "For Candidates" : "For Companies"}
            </div>

            <h2 className="text-4xl font-bold font-heading text-white leading-tight mb-4">
              {role === "candidate"
                ? "Build your career with real projects"
                : "Hire the best through real work"}
            </h2>

            <p className="text-white/60 text-lg leading-relaxed mb-10">
              {role === "candidate"
                ? "Skip the resume black hole. Show your skills through real projects and get noticed by top companies."
                : "Stop relying on resumes. See what candidates can actually build before you interview them."}
            </p>

            <div className="space-y-4">
              {benefits[role].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span className="text-white/80 text-sm">{item}</span>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-12 pt-8 border-t border-white/10"
            >
              <p className="text-white/40 text-xs">
                By creating an account, you agree to our{" "}
                <Link to="/terms-of-service" className="text-white/60 hover:text-white underline underline-offset-2">Terms of Service</Link>{" "}
                and{" "}
                <Link to="/privacy-policy" className="text-white/60 hover:text-white underline underline-offset-2">Privacy Policy</Link>.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
