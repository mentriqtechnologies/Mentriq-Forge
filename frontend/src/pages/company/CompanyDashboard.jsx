import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";
import {
  Briefcase, FolderKanban, Users, Award, TrendingUp,
  ChevronDown, ChevronRight, ExternalLink, Plus, GitBranch,
  Activity, Clock, Code2, Eye, ToggleLeft, ToggleRight,
  Trash2, Edit, AlertTriangle,
} from "lucide-react";
import {
  PageHeader, StatCard, Card, Badge, StatusBadge, Button, EmptyState, Modal,
} from "../../components/ui";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const GithubCandidateRow = ({ submission }) => {
  const c = submission.candidate;
  const a = submission.repoAnalytics;
  const hasGithub = !!c?.githubUsername;
  const langTotal = a?.languages?.reduce((s, l) => s + l.bytes, 0) || 0;

  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-4">
        <div className="flex items-center gap-3">
          {c?.githubAvatar ? (
            <img src={c.githubAvatar} alt="" className="w-9 h-9 rounded-full ring-2 ring-white" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 ring-2 ring-white" />
          )}
          <div>
            <p className="text-sm font-semibold text-slate-900">{c?.name}</p>
            {hasGithub ? (
              <a
                href={c.githubProfile}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-forge-primary hover:underline flex items-center gap-1"
              >
                @{c.githubUsername}
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <p className="text-xs text-slate-400">GitHub not connected</p>
            )}
          </div>
        </div>

        <StatusBadge status={submission.applicationStatus || "applied"} />

        {submission.linkedRepoName && (
          <a
            href={submission.linkedRepoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-600 hover:text-forge-primary transition flex items-center gap-1"
          >
            <GitBranch className="w-3 h-3" />
            {submission.linkedRepoName}
          </a>
        )}
      </div>

      {a && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: "Total Commits", value: a.totalCommits, icon: Activity },
              { label: "Last Commit", value: a.lastCommitDate ? new Date(a.lastCommitDate).toLocaleDateString() : "—", icon: Clock },
              { label: "PRs", value: a.pullRequests, icon: GitBranch },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="bg-white rounded-lg p-2.5 text-center border border-slate-100">
                  <Icon className="w-3.5 h-3.5 text-slate-400 mx-auto mb-0.5" />
                  <p className="text-sm font-bold font-heading text-slate-900">{item.value ?? "—"}</p>
                  <p className="text-[10px] text-slate-400">{item.label}</p>
                </div>
              );
            })}
            <div className="bg-white rounded-lg p-2.5 border border-slate-100">
              <Code2 className="w-3.5 h-3.5 text-slate-400 mx-auto mb-0.5" />
              <div className="flex flex-wrap gap-0.5 justify-center">
                {a.languages?.length > 0
                  ? a.languages.slice(0, 3).map((l) => (
                      <span key={l.name} className="text-[10px] px-1 py-0.5 bg-slate-100 rounded text-slate-500">
                        {l.name}{langTotal > 0 ? ` ${Math.round((l.bytes / langTotal) * 100)}%` : ""}
                      </span>
                    ))
                  : <span className="text-[10px] text-slate-400">—</span>}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Languages</p>
            </div>
          </div>

          {a?.commitTimeline?.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">GitHub Activity</p>
              <div className="flex items-end gap-0.5 h-10">
                {a.commitTimeline.map((w, i) => (
                  <div
                    key={w.week}
                    className="flex-1 relative group"
                  >
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {w.count} commit{w.count !== 1 ? "s" : ""}
                    </div>
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-forge-primary to-forge-primary-light"
                      style={{ height: `${Math.max((w.count / Math.max(...a.commitTimeline.map((c) => c.count), 1)) * 100, 3)}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CompanyDashboard = () => {
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [submissionsOpen, setSubmissionsOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);

  useEffect(() => {
    api.get("/dashboard/company").then((res) => setStats(res.data.stats));
    api.get("/projects/my/company").then((res) => setProjects(res.data.projects));
    api.get("/dashboard/company/submissions").then((res) => setSubmissions(res.data.submissions || []));
  }, []);

  const hasSubmissions = submissions.length > 0;

  const handleToggleApplications = async (project) => {
    const nextStatus = project.status === "open" ? "closed" : "open";
    try {
      await api.put(`/projects/${project._id}`, { status: nextStatus });
      setProjects((prev) => prev.map((item) => item._id === project._id ? { ...item, status: nextStatus } : item));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/projects/${id}`);
      setProjects((prev) => prev.filter((p) => p._id !== id));
      setDeleteModal(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <PageHeader
        title="Company Dashboard"
        description="Manage your projects and hiring pipeline."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/company/projects/new?mode=direct">
              <Button variant="outline" icon={Plus} size="sm">
                Post a Job
              </Button>
            </Link>
            <Link to="/company/projects/new">
              <Button icon={Plus} size="sm">
                Post a Project Based Job
              </Button>
            </Link>
          </div>
        }
      />

      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <StatCard label="Total Projects" value={stats?.totalProjects} icon={FolderKanban} color="forge" />
        <StatCard label="Open Projects" value={stats?.openProjects} icon={Briefcase} color="green" />
        <StatCard label="Applications" value={stats?.totalApplications} icon={Users} color="orange" />
        <StatCard label="Shortlisted" value={stats?.shortlisted} icon={Award} color="purple" />
        <StatCard label="Hired" value={stats?.hired} icon={TrendingUp} color="forge" />
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold font-heading text-slate-900">Your Projects</h2>
          <span className="text-sm text-slate-400">{projects.length} project{projects.length !== 1 ? "s" : ""}</span>
        </div>

        <div className="space-y-3 mb-10">
          {projects.length === 0 && (
            <EmptyState
              icon={FolderKanban}
              title="No projects yet"
              description="Post your first project to start receiving applications from candidates."
              actionLabel="Create Project Based Job"
              onAction={() => window.location.href = "/company/projects/new"}
            />
          )}
          {projects.map((p, i) => (
            <motion.div
              key={p._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card hover={true} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Link to={`/company/projects/${p._id}/applicants`} className="flex items-start gap-4 flex-1">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-forge-primary/10 to-forge-primary/5 shrink-0">
                    <Briefcase className="w-5 h-5 text-forge-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-heading text-slate-900">{p.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs text-slate-400">{p.jobRole || p.title}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs text-slate-400">{p.domain}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs text-slate-400">{p.applicantCount ?? 0} applicant{(p.applicantCount ?? 0) !== 1 ? "s" : ""}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Salary: {p.salary || "Negotiable"}</p>
                  </div>
                </Link>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={(e) => { e.preventDefault(); handleToggleApplications(p); }}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-forge-primary hover:text-forge-primary"
                  >
                    {p.status === "open" ? <ToggleRight className="w-4 h-4 text-emerald-500" /> : <ToggleLeft className="w-4 h-4 text-slate-400" />}
                    {p.status === "open" ? "Applications Open" : "Applications Closed"}
                  </button>
                  <Link
                    to={`/company/projects/${p._id}/edit`}
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-lg text-slate-400 hover:text-forge-primary hover:bg-slate-100 transition"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteModal(p); }}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <StatusBadge status={p.status} />
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {hasSubmissions && (
        <motion.div variants={itemVariants}>
          <button
            onClick={() => setSubmissionsOpen(!submissionsOpen)}
            className="flex items-center gap-2 text-slate-900 hover:text-forge-primary transition mb-4 group"
          >
            <h2 className="text-lg font-bold font-heading">Candidate GitHub Activity</h2>
            <span className="text-sm text-slate-400">({submissions.length})</span>
            <div className={`p-1 rounded-lg text-slate-400 group-hover:text-forge-primary transition-colors ${submissionsOpen ? "rotate-180" : ""}`}>
              <ChevronDown className="w-4 h-4" />
            </div>
          </button>

          <AnimatePresence>
            {submissionsOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 mb-10 overflow-hidden"
              >
                {submissions.map((s, i) => (
                  <motion.div
                    key={s._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card padding={false} hover={false}>
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4 text-slate-400" />
                            <p className="text-sm font-semibold text-slate-900">{s.projectTitle}</p>
                          </div>
                          <span className="text-xs text-slate-400">
                            Submitted {new Date(s.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <GithubCandidateRow submission={s} />
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete Project / Job"
        size="sm"
      >
        <div className="text-center">
          <div className="inline-flex p-3 rounded-xl bg-red-50 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-lg font-bold font-heading text-slate-900 mb-2">Delete this item?</h3>
          <p className="text-sm text-slate-500 mb-6">
            "{deleteModal?.title}" will be soft-deleted. It will disappear from your active list
            and appear in the Admin's Deleted Reports. You can ask an admin to restore it later.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={() => setDeleteModal(null)}>
              Cancel
            </Button>
            <Button variant="danger" fullWidth onClick={() => handleDelete(deleteModal?._id)}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default CompanyDashboard;
