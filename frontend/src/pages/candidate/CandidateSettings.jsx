import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import {
  User, Phone, FileText, Link, Award, Globe,
  CheckCircle, XCircle, Save, Shield, Lock,
  Eye, EyeOff, Bell, Trash2, AlertTriangle,
  GitBranch, BadgeCheck, Clock, Send,
} from "lucide-react";
import { PageHeader, Card, Input, Select, Button, Avatar, Badge, StatusBadge, Modal } from "../../components/ui";
import { getMissingProfileFields } from "../../utils/profileCompleteness";

const CandidateSettings = () => {
  const { user, setUser, logout } = useAuth();

  const [verification, setVerification] = useState(null);
  const [missingFields, setMissingFields] = useState([]);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");
  const [verificationError, setVerificationError] = useState("");

  useEffect(() => {
    api
      .get("/verification/me")
      .then((res) => {
        setVerification(res.data.verification);
        setMissingFields(res.data.missingFields || []);
      })
      .catch(() => {});
  }, []);

  const refreshVerification = async () => {
    try {
      const res = await api.get("/verification/me");
      setVerification(res.data.verification);
      setMissingFields(res.data.missingFields || []);
    } catch {}
  };

  const handleSubmitVerification = async () => {
    setVerificationError("");
    setVerificationMessage("");
    setVerificationLoading(true);
    try {
      const res = await api.post("/verification/submit");
      setVerification(res.data.verification);
      setMissingFields([]);
      setVerificationMessage(res.data.message);
    } catch (err) {
      setVerificationError(err.response?.data?.message || "Failed to submit profile for review");
    } finally {
      setVerificationLoading(false);
    }
  };

  const [profile, setProfile] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
    skills: (user?.skills || []).join(", "),
    experienceLevel: user?.experienceLevel || "",
    education: user?.education || "",
    resumeUrl: user?.resumeUrl || "",
    portfolioLinks: (user?.portfolioLinks || []).join(", "),
    linkedinUrl: user?.linkedinUrl || "",
    githubUrl: user?.githubProfile || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    applicationUpdates: true,
    feedbackReceived: true,
    marketingEmails: false,
  });

  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError("");
    setProfileMessage("");
    const missing = getMissingProfileFields({ ...user, ...profile });
    if (missing.length > 0) {
      setProfileError(`Complete all required fields to save your profile. Missing: ${missing.join(", ")}`);
      return;
    }
    setProfileLoading(true);
    try {
      const payload = {
        ...profile,
        skills: profile.skills.split(",").map((s) => s.trim()).filter(Boolean),
        portfolioLinks: profile.portfolioLinks.split(",").map((s) => s.trim()).filter(Boolean),
      };
      const res = await api.put("/auth/me", payload);
      setUser(res.data.user);
      localStorage.setItem("forge_user", JSON.stringify(res.data.user));
      setProfileMessage("Profile updated successfully.");
      refreshVerification();
    } catch (err) {
      setProfileError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordMessage("");
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    setPasswordLoading(true);
    try {
      await api.put("/auth/me", { password: passwordForm.newPassword });
      setPasswordMessage("Password changed successfully.");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") return;
    setDeleting(true);
    try {
      await api.delete("/auth/me");
      logout();
    } catch (err) {
      setProfileError(err.response?.data?.message || "Failed to delete account");
    } finally {
      setDeleting(false);
      setDeleteModal(false);
    }
  };

  const githubLinkUrl = `${import.meta.env.VITE_API_URL || "/api"}/auth/github/link`;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto">
      <PageHeader
        title="Candidate Settings"
        description="Manage your profile, preferences, and account security."
      />

      <div className="space-y-6">
        <Card padding={false} hover={false}>
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
              <BadgeCheck className="w-5 h-5 text-forge-primary" />
              <div>
                <h2 className="text-lg font-bold font-heading text-slate-900">Profile Verification</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  The MentriQ team reviews your profile. Only approved profiles are visible to companies.
                </p>
              </div>
              {verification && <StatusBadge status={verification.status} />}
            </div>

            {verification?.status === "approved" && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl p-4 flex items-start gap-3 mb-4">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Your profile is approved!</p>
                  <p className="text-emerald-600 mt-0.5">You are now visible to companies on MentriQ Forge.</p>
                </div>
              </div>
            )}

            {verification?.status === "pending" && (
              <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-xl p-4 flex items-start gap-3 mb-4">
                <Clock className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Profile under review</p>
                  <p className="text-amber-600 mt-0.5">
                    Your profile was submitted {verification.submittedAt ? new Date(verification.submittedAt).toLocaleDateString() : ""}. The MentriQ team will approve it shortly.
                  </p>
                </div>
              </div>
            )}

            {verification?.status === "rejected" && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4 flex items-start gap-3 mb-4">
                <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Your profile needs updates</p>
                  <p className="text-red-600 mt-0.5">{verification.reason}</p>
                  <p className="text-red-600 mt-0.5">Update your profile below and submit it again for review.</p>
                </div>
              </div>
            )}

            {missingFields.length > 0 && (
              <div className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl p-4 flex items-start gap-3 mb-4">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                <div>
                  <p className="font-semibold">Complete your profile to get verified</p>
                  <p className="text-slate-500 mt-0.5">Missing: {missingFields.join(", ")}</p>
                </div>
              </div>
            )}

            {verificationError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4 flex items-center gap-3 mb-4">
                <XCircle className="w-4 h-4 shrink-0" />
                {verificationError}
              </div>
            )}
            {verificationMessage && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl p-4 flex items-center gap-3 mb-4">
                <CheckCircle className="w-4 h-4 shrink-0" />
                {verificationMessage}
              </div>
            )}

            {(!verification || verification.status === "none" || verification.status === "rejected") && (
              <Button
                variant={verification?.status === "rejected" ? "secondary" : "primary"}
                icon={Send}
                loading={verificationLoading}
                disabled={missingFields.length > 0}
                onClick={handleSubmitVerification}
              >
                {verification?.status === "rejected" ? "Submit Again for Review" : "Submit Profile for Review"}
              </Button>
            )}
          </div>
        </Card>

        <Card padding={false} hover={false}>
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
              <User className="w-5 h-5 text-forge-primary" />
              <h2 className="text-lg font-bold font-heading text-slate-900">Profile Information</h2>
            </div>

            {profileMessage && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl p-4 flex items-center gap-3 mb-4">
                <CheckCircle className="w-4 h-4 shrink-0" />
                {profileMessage}
              </div>
            )}
            {profileError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4 flex items-center gap-3 mb-4">
                <XCircle className="w-4 h-4 shrink-0" />
                {profileError}
              </div>
            )}

            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
              <Avatar name={user?.name} size="xl" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Profile Photo</p>
                <p className="text-xs text-slate-400 mt-0.5">Upload a photo for your candidate profile.</p>
                <button className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-forge-primary hover:text-forge-primary-dark transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  Upload Photo
                </button>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Full Name" icon={User} required value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                <Input label="Phone" icon={Phone} required value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Bio</label>
                <textarea
                  rows={3}
                  required
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:border-forge-primary focus:ring-2 focus:ring-forge-primary/20"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Select
                  label="Experience Level"
                  options={[
                    { value: "student", label: "Student" },
                    { value: "fresher", label: "Fresher" },
                    { value: "professional", label: "Professional" },
                    { value: "career_switcher", label: "Career Switcher" },
                    { value: "freelancer", label: "Freelancer" },
                    { value: "internship_seeker", label: "Internship Seeker" },
                  ]}
                  placeholder="Select..."
                  required
                  value={profile.experienceLevel}
                  onChange={(e) => setProfile({ ...profile, experienceLevel: e.target.value })}
                />
                <Input label="Education" placeholder="e.g. B.Tech Computer Science, 2022" icon={Award} required value={profile.education} onChange={(e) => setProfile({ ...profile, education: e.target.value })} />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Resume Drive Link" icon={FileText} required value={profile.resumeUrl} onChange={(e) => setProfile({ ...profile, resumeUrl: e.target.value })} />
                <Input label="LinkedIn URL" placeholder="https://linkedin.com/in/..." required value={profile.linkedinUrl} onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })} />
              </div>

              <Input label="Skills (comma separated)" placeholder="React, Node.js, MongoDB" icon={Award} required value={profile.skills} onChange={(e) => setProfile({ ...profile, skills: e.target.value })} />

              <div className="border-t border-slate-100 pt-5">
                <h3 className="text-sm font-bold font-heading text-slate-900 mb-4 flex items-center gap-2">
                  <Link className="w-4 h-4" />
                  Social Links
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="GitHub URL" placeholder="https://github.com/..." value={profile.githubUrl} onChange={(e) => setProfile({ ...profile, githubUrl: e.target.value })} />
                  <Input label="Portfolio Links (comma separated)" placeholder="Personal website, blog, etc." icon={Globe} required value={profile.portfolioLinks} onChange={(e) => setProfile({ ...profile, portfolioLinks: e.target.value })} />
                </div>
              </div>

              <Button type="submit" loading={profileLoading} icon={Save} size="lg" fullWidth>
                Save Profile
              </Button>
            </form>
          </div>
        </Card>

        <Card padding={false} hover={false}>
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
              <Bell className="w-5 h-5 text-forge-primary" />
              <h2 className="text-lg font-bold font-heading text-slate-900">Notification Preferences</h2>
            </div>
            <div className="space-y-4">
              {[
                { key: "emailAlerts", label: "Email Alerts", desc: "Receive email notifications about platform updates" },
                { key: "applicationUpdates", label: "Application Updates", desc: "Get notified when your application status changes" },
                { key: "feedbackReceived", label: "Feedback Received", desc: "Get notified when you receive evaluation feedback" },
                { key: "marketingEmails", label: "Marketing Emails", desc: "Receive tips, best practices, and product updates" },
              ].map((item) => (
                <label key={item.key} className="flex items-center justify-between gap-3 py-3 border-b border-slate-100 last:border-b-0">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.label}</p>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications[item.key]}
                    onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-forge-primary focus:ring-forge-primary"
                  />
                </label>
              ))}
            </div>
          </div>
        </Card>

        <Card padding={false} hover={false}>
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
              <Shield className="w-5 h-5 text-forge-primary" />
              <h2 className="text-lg font-bold font-heading text-slate-900">Account & Security</h2>
            </div>

            {passwordMessage && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl p-4 flex items-center gap-3 mb-4">
                <CheckCircle className="w-4 h-4 shrink-0" />
                {passwordMessage}
              </div>
            )}
            {passwordError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4 flex items-center gap-3 mb-4">
                <XCircle className="w-4 h-4 shrink-0" />
                {passwordError}
              </div>
            )}

            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-5 h-5 text-slate-400" />
              <h3 className="text-base font-bold font-heading text-slate-900">Change Password</h3>
            </div>
            <form onSubmit={handlePasswordSubmit} className="space-y-4 mb-6 pb-6 border-b border-slate-100">
              <div className="relative">
                <Input
                  label="Current Password"
                  type={showCurrent ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  required
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3.5 top-[38px] text-slate-400 hover:text-slate-600">
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="relative">
                  <Input
                    label="New Password"
                    type={showNew ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    required
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3.5 top-[38px] text-slate-400 hover:text-slate-600">
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="relative">
                  <Input
                    label="Confirm New Password"
                    type={showConfirm ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    required
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-[38px] text-slate-400 hover:text-slate-600">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" loading={passwordLoading} icon={Lock} size="lg" fullWidth>
                Change Password
              </Button>
            </form>

            <div className="flex items-center gap-3 mb-4">
              <GitBranch className="w-5 h-5 text-slate-400" />
              <h3 className="text-base font-bold font-heading text-slate-900">GitHub Connection</h3>
              {!user?.githubUsername && <Badge color="red">Required</Badge>}
            </div>
            {user?.githubUsername ? (
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge color="green" dot>Connected</Badge>
                    <span className="text-sm font-medium text-slate-900">@{user.githubUsername}</span>
                  </div>
                </div>
              </div>
            ) : (
              <a href={githubLinkUrl}>
                <Button variant="outline" icon={GitBranch} size="md" className="mb-6">
                  Connect GitHub
                </Button>
              </a>
            )}

            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <Trash2 className="w-5 h-5 text-red-400" />
                <h3 className="text-base font-bold font-heading text-slate-900">Delete Account</h3>
              </div>
              <p className="text-sm text-slate-500 mb-4">Permanently delete your account and all associated data. This action cannot be undone.</p>
              <Button variant="danger" icon={Trash2} onClick={() => setDeleteModal(true)}>
                Delete Account
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Delete Account" size="sm">
        <div className="text-center">
          <div className="inline-flex p-3 rounded-xl bg-red-50 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-lg font-bold font-heading text-slate-900 mb-2">Are you sure?</h3>
          <p className="text-sm text-slate-500 mb-4">
            This will permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <div className="mb-4">
            <Input
              placeholder='Type "DELETE" to confirm'
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={() => setDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              fullWidth
              disabled={deleteConfirm !== "DELETE"}
              loading={deleting}
              onClick={handleDeleteAccount}
            >
              Delete Forever
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default CandidateSettings;
