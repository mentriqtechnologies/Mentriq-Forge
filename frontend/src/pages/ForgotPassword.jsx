import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Lock } from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import api from "../api/axios";

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

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email: email.trim().toLowerCase() });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
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
            <h1 className="text-3xl font-bold font-heading text-slate-900 mb-2">Forgot password?</h1>
            <p className="text-slate-500">Enter your email and we'll send you a reset link.</p>
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

          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              role="status"
              className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl p-6 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                <Mail className="w-6 h-6 text-emerald-600" aria-hidden="true" />
              </div>
              <p className="font-semibold mb-1">Check your email</p>
              <p className="text-emerald-600">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
            </motion.div>
          ) : (
            <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email address"
                type="email"
                placeholder="you@company.com"
                icon={Mail}
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Button type="submit" fullWidth loading={loading} size="lg">
                Send Reset Link
              </Button>
            </motion.form>
          )}

          <motion.p variants={itemVariants} className="text-sm text-slate-500 mt-8 text-center">
            <Link to="/login" className="text-forge-primary hover:text-forge-primary-dark font-semibold inline-flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Back to login
            </Link>
          </motion.p>
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
              Password Reset
            </div>
            <h2 className="text-4xl font-bold font-heading text-white leading-tight mb-4">
              Reset your<br />
              <span className="text-gradient-light">password</span>
            </h2>
            <p className="text-white/70 text-lg leading-relaxed mb-8">
              Enter the email associated with your MentriQ Forge account and we'll send you instructions to reset your password.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
