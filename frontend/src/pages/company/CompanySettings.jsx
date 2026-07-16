import React, { useState } from "react";
import { motion } from "framer-motion";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import {
  Building2, Globe, Users, Phone, Mail, Bell,
  Shield, Lock, Save, CheckCircle, XCircle, Upload, Eye, EyeOff, Briefcase,
} from "lucide-react";
import { PageHeader, Card, Input, Button, Avatar } from "../../components/ui";

const CompanySettings = () => {
  const { user, setUser } = useAuth();

  const [profile, setProfile] = useState({
    companyName: user?.companyName || "",
    industry: user?.industry || "",
    companySize: user?.companySize || "",
    website: user?.website || "",
    bio: user?.bio || "",
    phone: user?.phone || "",
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
    newApplications: true,
    submissionUpdates: true,
    marketingEmails: false,
  });

  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError("");
    setProfileMessage("");
    setProfileLoading(true);
    try {
      const res = await api.put("/auth/me", profile);
      setUser(res.data.user);
      localStorage.setItem("forge_user", JSON.stringify(res.data.user));
      setProfileMessage("Company profile updated successfully.");
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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto">
      <PageHeader
        title="Company Settings"
        description="Manage your company profile, preferences, and security."
      />

      <div className="space-y-6">
        <Card padding={false} hover={false}>
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
              <Building2 className="w-5 h-5 text-forge-primary" />
              <h2 className="text-lg font-bold font-heading text-slate-900">Company Profile</h2>
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
                <p className="text-sm font-semibold text-slate-900">Company Logo</p>
                <p className="text-xs text-slate-400 mt-0.5">Upload a logo for your company profile.</p>
                <button className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-forge-primary hover:text-forge-primary-dark transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  Upload Logo
                </button>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Company Name" icon={Building2} value={profile.companyName} onChange={(e) => setProfile({ ...profile, companyName: e.target.value })} />
                <Input label="Industry" icon={Briefcase} value={profile.industry} onChange={(e) => setProfile({ ...profile, industry: e.target.value })} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Company Size" placeholder="e.g. 11-50" icon={Users} value={profile.companySize} onChange={(e) => setProfile({ ...profile, companySize: e.target.value })} />
                <Input label="Website" icon={Globe} value={profile.website} onChange={(e) => setProfile({ ...profile, website: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Company Bio</label>
                <textarea
                  rows={3}
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:border-forge-primary focus:ring-2 focus:ring-forge-primary/20"
                />
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
              <Phone className="w-5 h-5 text-forge-primary" />
              <h2 className="text-lg font-bold font-heading text-slate-900">Contact Information</h2>
            </div>
            <div className="space-y-4">
              <Input label="Email Address" icon={Mail} value={user?.email || ""} disabled />
              <Input label="Phone Number" icon={Phone} value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
              <Button onClick={handleProfileSubmit} loading={profileLoading} icon={Save} size="lg" fullWidth>
                Save Contact Info
              </Button>
            </div>
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
                { key: "newApplications", label: "New Applications", desc: "Get notified when a candidate applies to your project" },
                { key: "submissionUpdates", label: "Submission Updates", desc: "Get notified when a candidate submits work" },
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
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
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
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

export default CompanySettings;