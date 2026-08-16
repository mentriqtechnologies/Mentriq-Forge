import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { User, Phone, FileText, Link, Building2, Globe, Users, Award, CheckCircle, XCircle, ExternalLink, Save, Briefcase, AlertTriangle, GraduationCap } from "lucide-react";
import { PageHeader, Card, Input, Select, Button, Badge, Avatar } from "../components/ui";
import { getMissingProfileFields } from "../utils/profileCompleteness";

const experienceLevels = [
  { value: "student", label: "Student" },
  { value: "fresher", label: "Fresher" },
  { value: "professional", label: "Professional" },
  { value: "career_switcher", label: "Career Switcher" },
  { value: "freelancer", label: "Freelancer" },
  { value: "internship_seeker", label: "Internship Seeker" },
];

const Profile = () => {
  const { user, setUser } = useAuth();
  const isCompany = user?.role === "company";
  const isAdminOrEvaluator = user?.role === "admin" || user?.role === "evaluator";

  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
    skills: (user?.skills || []).join(", "),
    experienceLevel: user?.experienceLevel || "",
    education: user?.education || "",
    resumeUrl: user?.resumeUrl || "",
    portfolioLinks: (user?.portfolioLinks || []).join(", "),
    linkedinUrl: user?.linkedinUrl || "",
    githubProfile: user?.githubProfile || "",
    companyName: user?.companyName || "",
    industry: user?.industry || "",
    companySize: user?.companySize || "",
    website: user?.website || "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [unlinking, setUnlinking] = useState(false);

  const isGithubConnected = !!user?.githubUsername;
  const missingProfileFields = user?.role === "candidate" ? getMissingProfileFields(user) : [];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("github") === "connected") {
      setMessage("GitHub account connected successfully.");
      window.history.replaceState({}, document.title, window.location.pathname);
      api.get("/auth/me").then((res) => {
        setUser(res.data.user);
        localStorage.setItem("forge_user", JSON.stringify(res.data.user));
      });
    }
    if (params.get("github_error")) {
      setError(decodeURIComponent(params.get("github_error")));
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleUnlink = async () => {
    if (!window.confirm("Disconnect your GitHub account?")) return;
    setUnlinking(true);
    try {
      const res = await api.delete("/auth/github/link");
      setUser(res.data.user);
      localStorage.setItem("forge_user", JSON.stringify(res.data.user));
      setMessage("GitHub account disconnected.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to disconnect GitHub");
    } finally {
      setUnlinking(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (user?.role === "candidate") {
      const missing = getMissingProfileFields({ ...user, ...form });
      if (missing.length > 0) {
        setError(`Complete all required fields to save your profile. Missing: ${missing.join(", ")}`);
        return;
      }
    }
    setLoading(true);
    try {
      const payload = { ...form };
      if (!isCompany) {
        payload.skills = form.skills.split(",").map((s) => s.trim()).filter(Boolean);
        payload.portfolioLinks = form.portfolioLinks.split(",").map((s) => s.trim()).filter(Boolean);
      }
      const res = await api.put("/auth/me", payload);
      setUser(res.data.user);
      localStorage.setItem("forge_user", JSON.stringify(res.data.user));
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto">
      <PageHeader
        title="Your Profile"
        description={
          isCompany
            ? "Keep your company details up to date for candidates."
            : isAdminOrEvaluator
              ? "Manage your basic profile details."
              : "A strong profile helps evaluators and companies see your skills."
        }
      />

      <div className="mb-8">
        <Card padding={false} hover={false}>
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
              <Avatar name={user?.name} size="xl" />
              <div>
                <h2 className="text-xl font-bold font-heading text-slate-900">{user?.name}</h2>
                <p className="text-sm text-slate-400">{user?.email} · <Badge color="forge">{user?.role}</Badge></p>
              </div>
            </div>

            {message && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl p-4 flex items-center gap-3 mb-4">
                <CheckCircle className="w-4 h-4 shrink-0" />
                {message}
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4 flex items-center gap-3 mb-4">
                <XCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {missingProfileFields.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                  <p className="text-sm font-semibold text-amber-800">Complete your profile to apply</p>
                </div>
                <p className="text-xs text-amber-700 mb-3">
                  The Apply button stays locked until every item below is filled. Connect your GitHub account using the card at the bottom of this page.
                </p>
                <div className="flex flex-wrap gap-2">
                  {missingProfileFields.map((f) => (
                    <span key={f} className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-white border border-amber-300 text-amber-800">
                      <XCircle className="w-3 h-3 text-amber-500" />
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Full Name" icon={User} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <Input label="Phone" icon={Phone} required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Bio</label>
                <textarea
                  rows={3}
                  required
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:border-forge-primary focus:ring-2 focus:ring-forge-primary/20"
                />
              </div>

              {isCompany ? (
                <>
                  <Input label="Company Name" icon={Building2} value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input label="Industry" icon={Briefcase} value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
                    <Input label="Company Size" placeholder="e.g. 11-50" icon={Users} value={form.companySize} onChange={(e) => setForm({ ...form, companySize: e.target.value })} />
                  </div>
                  <Input label="Website" icon={Globe} value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
                </>
              ) : (
                <>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Select label="Experience Level" options={experienceLevels} placeholder="Select..." required value={form.experienceLevel} onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })} />
                    <Input label="Education" placeholder="e.g. B.Tech Computer Science, 2022" icon={GraduationCap} required value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input label="Resume URL" placeholder="Link to your resume" icon={FileText} required value={form.resumeUrl} onChange={(e) => setForm({ ...form, resumeUrl: e.target.value })} />
                    <Input label="LinkedIn URL" placeholder="https://linkedin.com/in/..." icon={Link} required value={form.linkedinUrl} onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })} />
                  </div>
                  <Input label="Skills (comma separated)" placeholder="React, Node.js, MongoDB" icon={Award} required value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
                  <Input label="Portfolio Links (comma separated)" placeholder="GitHub, personal site, blog" icon={Link} required value={form.portfolioLinks} onChange={(e) => setForm({ ...form, portfolioLinks: e.target.value })} />
                  <Input label="GitHub URL" placeholder="https://github.com/..." icon={Globe} value={form.githubProfile} onChange={(e) => setForm({ ...form, githubProfile: e.target.value })} />
                </>
              )}

              <Button type="submit" loading={loading} icon={Save} size="lg" fullWidth>
                Save Profile
              </Button>
            </form>
          </div>
        </Card>
      </div>

      {user?.role === "candidate" && (
      <Card padding={false} hover={false}>
        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-6">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            <h2 className="text-lg font-bold font-heading text-slate-900">GitHub Integration</h2>
            {!isGithubConnected && <Badge color="red">Required</Badge>}
          </div>

          {isGithubConnected ? (
            <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5">
                <div className="flex items-center gap-4">
                  {user.githubAvatar ? (
                    <img src={user.githubAvatar} alt="" className="w-14 h-14 rounded-full ring-2 ring-white" />
              ) : isAdminOrEvaluator ? (
                <p className="text-sm text-slate-400">
                  The basic details above are all that's needed for your role.
                </p>
              ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-900">{user.githubUsername}</p>
                      <Badge color="green" dot>Connected</Badge>
                    </div>
                    {user.githubBio && <p className="text-sm text-slate-500 mt-0.5">{user.githubBio}</p>}
                    <p className="text-xs text-slate-400 mt-1">
                      Connected {user.githubConnectedAt ? new Date(user.githubConnectedAt).toLocaleDateString() : ""}
                    </p>
                  </div>
                </div>
                <Button variant="danger" size="sm" onClick={handleUnlink} loading={unlinking}>
                  {unlinking ? "Disconnecting..." : "Disconnect"}
                </Button>
              </div>

              {(user.githubCompany || user.githubLocation) && (
                <div className="flex gap-6 px-5 pb-4 text-sm text-slate-500">
                  {user.githubCompany && <span>🏢 {user.githubCompany}</span>}
                  {user.githubLocation && <span>📍 {user.githubLocation}</span>}
                </div>
              )}

              <div className="grid grid-cols-3 border-t border-slate-200">
                {[
                  { label: "Public Repos", value: user.githubPublicRepos },
                  { label: "Followers", value: user.githubFollowers },
                  { label: "Following", value: user.githubFollowing },
                ].map((stat) => (
                  <div key={stat.label} className="text-center py-4 border-r border-slate-200 last:border-r-0">
                    <p className="text-xl font-bold font-heading text-slate-900">{stat.value ?? "—"}</p>
                    <p className="text-xs text-slate-400">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="px-5 py-3 bg-white border-t border-slate-200">
                <a href={user.githubProfile} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-forge-primary hover:text-forge-primary-dark font-medium">
                  View GitHub Profile <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50 rounded-xl border border-slate-200 p-5">
              <div>
                <p className="text-sm font-semibold text-slate-900">Connect your GitHub account</p>
                <p className="text-sm text-slate-400 mt-0.5">Link your GitHub to auto-populate profile and submit work seamlessly.</p>
              </div>
              <button onClick={() => { window.location.href = githubLinkUrl; }} className="inline-flex">
                <Button icon={() => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>} size="md">
                  Connect GitHub
                </Button>
              </button>
            </div>
          )}
        </div>
      </Card>
      )}
    </motion.div>
  );
};

export default Profile;
