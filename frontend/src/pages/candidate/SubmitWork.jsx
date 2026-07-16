import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api/axios";
import { Globe, FolderOpen, FileText, Send, ArrowLeft, CheckCircle, ChevronRight } from "lucide-react";
import { PageHeader, Card, Input, Button, Badge } from "../../components/ui";

const SubmitWork = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ repoUrl: "", liveDemoUrl: "", driveLink: "", notes: "" });
  const [linkedRepo, setLinkedRepo] = useState(null);
  const [repos, setRepos] = useState([]);
  const [reposLoading, setReposLoading] = useState(false);
  const [githubConnected, setGithubConnected] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("forge_token");
    if (!token) return;
    api.get("/auth/me").then((res) => {
      const u = res.data.user;
      if (u.githubUsername) {
        setGithubConnected(true);
        fetchRepos();
      }
    }).catch(() => {});
  }, []);

  const fetchRepos = async () => {
    setReposLoading(true);
    try {
      const res = await api.get("/github/repos");
      setRepos(res.data.repos);
    } catch {
      setRepos([]);
    } finally {
      setReposLoading(false);
    }
  };

  const handleRepoSelect = (e) => {
    const repo = repos.find((r) => r.id === Number(e.target.value));
    if (repo) {
      setLinkedRepo(repo);
      setForm((prev) => ({ ...prev, repoUrl: repo.url }));
    } else {
      setLinkedRepo(null);
      setForm((prev) => ({ ...prev, repoUrl: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        applicationId,
        ...form,
        linkedRepoId: linkedRepo?.id,
        linkedRepoName: linkedRepo?.name,
        linkedRepoUrl: linkedRepo?.url,
        linkedRepoDefaultBranch: linkedRepo?.defaultBranch,
        linkedRepoVisibility: linkedRepo?.visibility,
      };
      await api.post("/submissions", payload);
      navigate("/candidate/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit work");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
      <PageHeader
        title="Submit Your Work"
        description="Share your repo and demo link so MentriQ's experts can review your submission."
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4 flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-red-600" />
          </div>
          {error}
        </div>
      )}

      <Card padding={false} hover={false}>
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold font-heading text-slate-900 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              Repository
            </h3>

            {githubConnected ? (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Linked GitHub Repository</label>
                <select
                  value={linkedRepo?.id || ""}
                  onChange={handleRepoSelect}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 appearance-none transition-all duration-200 focus:outline-none focus:border-forge-primary focus:ring-2 focus:ring-forge-primary/20"
                >
                  <option value="">-- Select a repository --</option>
                  {repos.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.fullName} ({r.visibility})
                    </option>
                  ))}
                </select>
                {reposLoading && <p className="text-xs text-slate-400 mt-1">Loading repos...</p>}
                {linkedRepo && (
                  <div className="flex flex-wrap gap-3 mt-2">
                    <Badge color="slate">Branch: {linkedRepo.defaultBranch}</Badge>
                    <Badge color="slate">{linkedRepo.visibility}</Badge>
                    {linkedRepo.language && <Badge color="forge">{linkedRepo.language}</Badge>}
                  </div>
                )}
              </div>
            ) : (
              <Input
                label="GitHub Repo URL"
                placeholder="https://github.com/username/project"
                icon={() => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>}
                value={form.repoUrl}
                onChange={(e) => setForm({ ...form, repoUrl: e.target.value })}
              />
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold font-heading text-slate-900 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Demo & Resources
            </h3>
            <Input
              label="Live Demo URL"
              placeholder="https://your-demo.vercel.app"
              icon={Globe}
              value={form.liveDemoUrl}
              onChange={(e) => setForm({ ...form, liveDemoUrl: e.target.value })}
            />
            <Input
              label="Google Drive Link / Code Folder"
              placeholder="https://drive.google.com/drive/folders/..."
              icon={FolderOpen}
              value={form.driveLink}
              onChange={(e) => setForm({ ...form, driveLink: e.target.value })}
            />
            <p className="text-xs text-slate-400 -mt-2">Share a link to access your complete code structure and project files</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold font-heading text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Notes
            </h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes for the Evaluator</label>
              <textarea
                rows={4}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Anything you'd like reviewers to know about your approach or trade-offs..."
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:border-forge-primary focus:ring-2 focus:ring-forge-primary/20"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
            <Button type="submit" loading={loading} icon={Send} size="lg" fullWidth>
              Submit for Review
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
};

export default SubmitWork;
