import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api/axios";
import {
  Briefcase, FileText, CheckCircle, Clock, Award,
  ChevronDown, ChevronRight, RefreshCw, GitBranch, ExternalLink,
  BarChart3, Code2, Activity, MessageSquareQuote, BadgeCheck, XCircle,
} from "lucide-react";
import { PageHeader, StatCard, Card, Badge, StatusBadge, Button, EmptyState } from "../../components/ui";
import Avatar from "../../components/ui/Avatar";

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

const RepoAnalyticsCard = ({ submission }) => {
  const [analytics, setAnalytics] = useState(submission.repoAnalytics || null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.put(`/submissions/${submission._id}/github-stats`);
      setAnalytics(res.data.repoAnalytics);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const langTotal = analytics?.languages?.reduce((s, l) => s + l.bytes, 0) || 0;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <Card padding={false} hover={false}>
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-slate-100">
                <GitBranch className="w-4 h-4 text-slate-500" />
              </div>
              <p className="text-sm font-semibold text-slate-900">GitHub Analytics</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={RefreshCw}
              onClick={fetchStats}
              loading={loading}
            >
              {analytics ? "Refresh" : "Load Stats"}
            </Button>
          </div>

          {!analytics ? (
            <div className="bg-slate-50 rounded-xl p-6 text-center">
              <Code2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">Click "Load Stats" to fetch GitHub analytics</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Total Commits", value: analytics.totalCommits, icon: Activity },
                  { label: "Pull Requests", value: analytics.pullRequests, icon: GitBranch },
                  { label: "Branches", value: analytics.branches?.length, icon: GitBranch },
                  { label: "Last Commit", value: analytics.lastCommitDate ? new Date(analytics.lastCommitDate).toLocaleDateString() : "—", icon: Clock },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="bg-slate-50 rounded-xl p-3 text-center">
                      <Icon className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                      <p className="text-lg font-bold font-heading text-slate-900">{item.value ?? "—"}</p>
                      <p className="text-xs text-slate-400">{item.label}</p>
                    </div>
                  );
                })}
              </div>

              {analytics.languages?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Languages</p>
                  <div className="flex flex-wrap gap-1.5">
                    {analytics.languages.map((lang) => (
                      <span
                        key={lang.name}
                        className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium"
                      >
                        {lang.name}
                        {langTotal > 0 && (
                          <span className="text-slate-400 ml-1">({Math.round((lang.bytes / langTotal) * 100)}%)</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {analytics.commitTimeline?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Commit Activity (Weekly)</p>
                  <div className="flex items-end gap-1 h-16">
                    {analytics.commitTimeline.map((w, i) => {
                      const max = Math.max(...analytics.commitTimeline.map((c) => c.count), 1);
                      const height = Math.max((w.count / max) * 100, 4);
                      return (
                        <div
                          key={w.week}
                          className="flex-1 relative group"
                        >
                          <div
                            className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                          >
                            Week {i + 1}: {w.count} commit{w.count !== 1 ? "s" : ""}
                          </div>
                          <div
                            className="w-full rounded-t bg-gradient-to-t from-forge-primary to-forge-primary-light transition-all duration-200 hover:from-forge-primary-dark"
                            style={{ height: `${height}%`, minHeight: "4px" }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

const CandidateDashboard = () => {
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [verification, setVerification] = useState(null);

  useEffect(() => {
    api.get("/dashboard/candidate").then((res) => setStats(res.data.stats));
    api.get("/applications/my").then((res) => setApplications(res.data.applications));
    api.get("/submissions/my").then((res) => setSubmissions(res.data.submissions));
    api.get("/verification/me").then((res) => setVerification(res.data.verification)).catch(() => {});
  }, []);

  const getSubmissionForApp = (appId) =>
    submissions.find((s) => s.application === appId || s.application?._id === appId);

  const toggleExpand = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <PageHeader
        title="Candidate Dashboard"
        description="Track your applications and submissions."
        actions={
          <>
            <Link to="/candidate/feedback">
              <Button variant="outline" size="sm" icon={MessageSquareQuote}>
                View Feedback
              </Button>
            </Link>
            <Link to="/projects">
              <Button size="sm" icon={Briefcase}>
                Browse Hiring
              </Button>
            </Link>
          </>
        }
      />

      {verification?.status === "none" && (
        <motion.div variants={itemVariants} className="mb-8">
          <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-xl p-4 flex items-start gap-3">
            <BadgeCheck className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Get verified to be visible to companies</p>
              <p className="text-amber-600 mt-0.5">Complete your profile and submit it for review by the MentriQ team.</p>
            </div>
            <Link to="/candidate/settings">
              <Button size="sm" variant="outline">Complete Profile</Button>
            </Link>
          </div>
        </motion.div>
      )}

      {verification?.status === "rejected" && (
        <motion.div variants={itemVariants} className="mb-8">
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4 flex items-start gap-3">
            <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Your profile needs updates</p>
              <p className="text-red-600 mt-0.5">{verification.reason}</p>
            </div>
            <Link to="/candidate/settings">
              <Button size="sm" variant="outline">Update Profile</Button>
            </Link>
          </div>
        </motion.div>
      )}

      {verification?.status === "pending" && (
        <motion.div variants={itemVariants} className="mb-8">
          <div className="bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-xl p-4 flex items-center gap-3">
            <Clock className="w-5 h-5 shrink-0" />
            <p>Your profile is <span className="font-semibold">under review</span> by the MentriQ team. Once approved, you will be visible to companies.</p>
          </div>
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <StatCard label="Applications" value={stats?.totalApplications} icon={FileText} color="forge" />
        <StatCard label="In Progress" value={stats?.inProgress} icon={Clock} color="orange" />
        <StatCard label="Submitted" value={stats?.submitted} icon={CheckCircle} color="green" />
        <StatCard label="Shortlisted" value={stats?.shortlisted} icon={Award} color="purple" />
        <StatCard label="Hired" value={stats?.hired} icon={Briefcase} color="green" />
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold font-heading text-slate-900">Your Applications</h2>
          <span className="text-sm text-slate-400">{applications.length} application{applications.length !== 1 ? "s" : ""}</span>
        </div>

        <div className="space-y-3">
          {applications.length === 0 && (
            <EmptyState
              icon={Briefcase}
              title="No applications yet"
              description="Browse open jobs and project based opportunities and submit your first application to get started."
              actionLabel="Browse Hiring"
              onAction={() => window.location.href = "/projects"}
            />
          )}
          {applications.map((app, i) => {
            const sub = getSubmissionForApp(app._id);
            const hasLinkedRepo = sub?.linkedRepoId;
            const isExpanded = expanded[app._id];

            return (
              <motion.div
                key={app._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card
                  hover={true}
                  padding={false}
                  className={`${isExpanded ? "rounded-b-none border-b-0" : ""}`}
                >
                  <div
                    className="flex items-center justify-between p-5 cursor-pointer"
                    onClick={() => hasLinkedRepo && toggleExpand(app._id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-forge-primary/10 to-forge-primary/5 shrink-0">
                        <Briefcase className="w-5 h-5 text-forge-primary" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold font-heading text-slate-900">{app.project?.title}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-slate-400">{app.project?.domain}</span>
                          <span className="text-slate-300">·</span>
                          <span className="text-xs text-slate-400">{app.project?.company?.companyName || app.project?.company?.name}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <StatusBadge status={app.status} />
                      {["applied", "in_progress", "under_review", "rejected"].includes(app.status) && (
                        <Link
                          to={`/candidate/applications/${app._id}/submit`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button size="sm" icon={ExternalLink} iconPosition="right">
                            {["under_review", "rejected"].includes(app.status) ? "Resubmit" : "Submit"}
                          </Button>
                        </Link>
                      )}
                      {["under_review", "rejected", "shortlisted"].includes(app.status) && (
                        <Link to="/candidate/feedback" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" icon={MessageSquareQuote}>
                            Feedback
                          </Button>
                        </Link>
                      )}
                      {hasLinkedRepo && (
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleExpand(app._id); }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
                {hasLinkedRepo && isExpanded && sub && (
                  <RepoAnalyticsCard submission={sub} />
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CandidateDashboard;
