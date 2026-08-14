import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";
import {
  Clock, CheckCircle, Users, Building2, FileText, Shield,
  ChevronDown, ChevronRight, ArrowRight, ExternalLink,
  GitBranch, Activity, Code2, RefreshCw, BarChart3,
  BookOpen, Target, Sparkles, Search, Briefcase, Trash2, ClipboardList,
  Archive,
} from "lucide-react";
import {
  PageHeader, StatCard, Card, Badge, StatusBadge, Button,
  EmptyState, PageSkeleton, Input,
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

const GithubAnalyticsRow = ({ submission }) => {
  const [analytics, setAnalytics] = useState(submission.repoAnalytics || null);
  const [loading, setLoading] = useState(false);
  const candidate = submission.candidate;
  const hasGithub = !!candidate?.githubUsername;

  const fetchStats = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put(`/submissions/${submission._id}/github-stats`);
      setAnalytics(res.data.repoAnalytics);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const barMax = analytics?.commitTimeline?.length
    ? Math.max(...analytics.commitTimeline.map((w) => w.count), 1)
    : 1;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="px-5 pb-5">
        <Card padding={false} hover={false}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-slate-400" />
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">GitHub Analytics</p>
              </div>
              {hasGithub && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={RefreshCw}
                  onClick={fetchStats}
                  loading={loading}
                >
                  {analytics ? "Refresh" : "Load Stats"}
                </Button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm mb-4">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${hasGithub ? "bg-emerald-400" : "bg-slate-200"}`} />
                <span className={`text-xs font-medium ${hasGithub ? "text-emerald-600" : "text-slate-400"}`}>
                  GitHub {hasGithub ? "Connected" : "Not Connected"}
                </span>
              </div>

              {hasGithub && (
                <>
                  <a
                    href={candidate.githubProfile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-forge-primary hover:underline flex items-center gap-1"
                  >
                    @{candidate.githubUsername}
                    <ExternalLink className="w-3 h-3" />
                  </a>

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
                </>
              )}
            </div>

            {analytics && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                {[
                  { label: "Total Commits", value: analytics.totalCommits, icon: Activity },
                  { label: "Last Commit", value: analytics.lastCommitDate ? new Date(analytics.lastCommitDate).toLocaleDateString() : "—", icon: Clock },
                  { label: "Pull Requests", value: analytics.pullRequests, icon: GitBranch },
                  { label: "Branches", value: analytics.branches?.length, icon: GitBranch },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="bg-slate-50 rounded-lg p-2.5 text-center border border-slate-100">
                      <Icon className="w-3.5 h-3.5 text-slate-400 mx-auto mb-0.5" />
                      <p className="text-sm font-bold font-heading text-slate-900">{item.value ?? "—"}</p>
                      <p className="text-[10px] text-slate-400">{item.label}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {analytics?.commitTimeline?.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Commit Timeline</p>
                <div className="flex items-end gap-0.5 h-10">
                  {analytics.commitTimeline.map((w, i) => (
                    <div key={w.week} className="flex-1 relative group">
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {w.count} commit{w.count !== 1 ? "s" : ""}
                      </div>
                      <div
                        className="w-full rounded-t bg-gradient-to-t from-forge-primary to-forge-primary-light"
                        style={{ height: `${Math.max((w.count / barMax) * 100, 3)}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

const quickActions = [
  {
    to: "/admin/submissions",
    title: "Submissions Manager",
    desc: "Browse all submissions with search & filters",
    count: null,
    countLabel: null,
    icon: FileText,
    gradient: "from-forge-primary/10 to-forge-primary/5",
    border: "border-forge-primary/20",
    hoverBorder: "hover:border-forge-primary/40",
    textColor: "text-forge-primary",
  },
  {
    to: "/admin/users",
    title: "Manage Users",
    desc: "Create evaluators, activate/deactivate accounts",
    icon: Shield,
    gradient: "from-purple-500/10 to-purple-500/5",
    border: "border-purple-500/20",
    hoverBorder: "hover:border-purple-500/40",
    textColor: "text-purple-600",
  },
  {
    to: "/admin/submissions",
    title: "View Scores",
    desc: "See all evaluation scores and rankings",
    icon: BarChart3,
    gradient: "from-emerald-500/10 to-emerald-500/5",
    border: "border-emerald-500/20",
    hoverBorder: "hover:border-emerald-500/40",
    textColor: "text-emerald-600",
  },
  {
    to: "/admin/deleted-reports",
    title: "Deleted Reports",
    desc: "View and restore deleted jobs & projects",
    icon: Archive,
    gradient: "from-red-500/10 to-red-500/5",
    border: "border-red-500/20",
    hoverBorder: "hover:border-red-500/40",
    textColor: "text-red-600",
  },
  {
    to: "/admin/manage-jobs",
    title: "Manage Jobs & Projects",
    desc: "View and delete all active job listings",
    icon: ClipboardList,
    gradient: "from-orange-500/10 to-orange-500/5",
    border: "border-orange-500/20",
    hoverBorder: "hover:border-orange-500/40",
    textColor: "text-orange-600",
  },
  {
    to: "/admin/applications",
    title: "Applications Manager",
    desc: "Review & shortlist job and project applicants",
    icon: Briefcase,
    gradient: "from-blue-500/10 to-blue-500/5",
    border: "border-blue-500/20",
    hoverBorder: "hover:border-blue-500/40",
    textColor: "text-blue-600",
  },
  {
    to: "/admin/hired-candidates",
    title: "Hired Candidates",
    desc: "See who was hired by which company",
    icon: CheckCircle,
    gradient: "from-green-500/10 to-green-500/5",
    border: "border-green-500/20",
    hoverBorder: "hover:border-green-500/40",
    textColor: "text-green-600",
  },
];

const workflowSteps = [
  { n: "1", title: "Find Submission", desc: "Browse pending submissions", color: "from-forge-primary to-blue-600" },
  { n: "2", title: "Review Code", desc: "Check GitHub & Drive link", color: "from-forge-secondary to-orange-600" },
  { n: "3", title: "Score", desc: "Rate on 5-part rubric", color: "from-emerald-500 to-emerald-600" },
  { n: "4", title: "Recommend", desc: "Shortlist or reject", color: "from-purple-500 to-purple-600" },
];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, submissionsRes] = await Promise.all([
          api.get("/dashboard/admin"),
          api.get("/submissions/pending"),
        ]);
        setStats(dashRes.data.stats);
        setPending(submissionsRes.data.submissions || []);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleExpand = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  const filteredCompanies = (stats?.companyPipeline || []).filter((company) =>
    company.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-xl bg-gradient-to-br from-forge-primary/10 to-forge-secondary/10">
            <Sparkles className="w-5 h-5 text-forge-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900">
            Evaluation Team
          </h1>
        </div>
        <p className="text-slate-500 mt-1">Expert review platform for candidate project submissions.</p>
        <div className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
          <Clock className="w-3.5 h-3.5" />
          {pending.length} submission{pending.length !== 1 ? "s" : ""} awaiting evaluation
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
        <StatCard label="Pending Reviews" value={stats?.pendingReviews} icon={Clock} color="orange" />
        <StatCard label="Total Hired" value={stats?.totalHires || 0} icon={CheckCircle} color="green" />
        <StatCard label="Candidates" value={stats?.totalCandidates} icon={Users} color="forge" />
        <StatCard label="Companies" value={stats?.totalCompanies} icon={Building2} color="purple" />
        <StatCard label="Active Projects" value={stats?.totalProjects} icon={FileText} color="slate" />
      </motion.div>

      <motion.div variants={itemVariants} className="mb-10">
        <Card padding={false} hover={false}>
          <div className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-5">
              <div>
                <h2 className="text-base font-bold font-heading text-slate-900">Company Pipeline Overview</h2>
                <p className="text-sm text-slate-500 mt-1">Track each company from applications to hires and spot any pending review work.</p>
              </div>
              <div className="w-full sm:w-72">
                <Input
                  placeholder="Search company"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {filteredCompanies.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                No company records match this search yet.
              </div>
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                {filteredCompanies.map((company) => (
                  <div key={company._id} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{company.companyName}</p>
                        <p className="text-xs text-slate-500">{company.industry || "Company"}</p>
                      </div>
                      <Badge color={company.hired > 0 ? "green" : company.shortlisted > 0 ? "orange" : "slate"}>
                        {company.currentStage}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                      <div className="rounded-xl bg-white p-2.5 border border-slate-100">
                        <p className="text-xs text-slate-400">Jobs Posted</p>
                        <p className="text-sm font-semibold text-slate-900">{company.totalProjects}</p>
                      </div>
                      <div className="rounded-xl bg-white p-2.5 border border-slate-100">
                        <p className="text-xs text-slate-400">Applications</p>
                        <p className="text-sm font-semibold text-slate-900">{company.totalApplications}</p>
                      </div>
                      <div className="rounded-xl bg-white p-2.5 border border-slate-100">
                        <p className="text-xs text-slate-400">Shortlisted</p>
                        <p className="text-sm font-semibold text-slate-900">{company.shortlisted}</p>
                      </div>
                      <div className="rounded-xl bg-white p-2.5 border border-slate-100">
                        <p className="text-xs text-slate-400">Users Hired</p>
                        <p className="text-sm font-semibold text-slate-900">{company.hired}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge color="blue">In Progress: {company.inProgress}</Badge>
                      <Badge color="orange">Submitted: {company.submitted}</Badge>
                      <Badge color="purple">Pending Review: {company.pendingCompanyReviews}</Badge>
                      <Badge color="slate">Interview: {company.interviewScheduled}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-4 mb-10">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.to} to={action.to}>
              <Card
                hover={true}
                className={`bg-gradient-to-br ${action.gradient} border ${action.border} ${action.hoverBorder}`}
              >
                <div className={`p-2.5 rounded-xl bg-white/80 w-fit mb-3 ${action.textColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold font-heading text-slate-900 mb-1">{action.title}</h3>
                <p className="text-xs text-slate-500">{action.desc}</p>
                {action.count !== null && (
                  <p className={`text-xs font-semibold mt-3 ${action.textColor}`}>
                    View {pending.length} pending →
                  </p>
                )}
              </Card>
            </Link>
          );
        })}
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Jobs Posted" value={stats?.totalJobsAll || 0} icon={Briefcase} color="forge" />
        <StatCard label="Total Project Based Jobs" value={stats?.totalProjectsAll || 0} icon={FileText} color="forge" />
        <StatCard label="Deleted Jobs" value={stats?.totalDeletedJobs || 0} icon={Trash2} color="red" />
        <StatCard label="Deleted Project Based Jobs" value={stats?.totalDeletedProjects || 0} icon={Archive} color="red" />
      </motion.div>

      <motion.div variants={itemVariants} className="mb-10">
        <Card padding={false} hover={false}>
          <div className="p-6">
            <h2 className="text-base font-bold font-heading text-slate-900 mb-6 flex items-center gap-2">
              <Target className="w-4 h-4 text-forge-primary" />
              Evaluation Workflow
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {workflowSteps.map((step, i) => (
                <div key={step.n} className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shrink-0`}>
                    <span className="text-white font-bold font-heading text-sm">{step.n}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{step.title}</p>
                    <p className="text-xs text-slate-400">{step.desc}</p>
                  </div>
                  {i < workflowSteps.length - 1 && (
                    <ChevronRight className="hidden lg:block w-4 h-4 text-slate-300 mt-2 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {pending.length > 0 ? (
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <h2 className="text-lg font-bold font-heading text-slate-900">
                Submissions Awaiting Review
              </h2>
              <Badge color="amber">{pending.length}</Badge>
            </div>
            <Link to="/admin/submissions">
              <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">
                View All
              </Button>
            </Link>
          </div>

          <div className="space-y-2">
            {pending.slice(0, 5).map((s, i) => (
              <motion.div
                key={s._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card padding={false} hover={false}>
                  <Link
                    to={`/admin/submissions/${s._id}/evaluate`}
                    className="flex items-center justify-between p-5 group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-slate-100 shrink-0">
                          <FileText className="w-4 h-4 text-slate-500" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold font-heading text-slate-900 group-hover:text-forge-primary transition">
                            {s.project?.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <span className="text-xs text-slate-500">
                              {s.candidate?.name}
                            </span>
                            {s.candidate?.experienceLevel && (
                              <Badge color="orange" dot>{s.candidate.experienceLevel}</Badge>
                            )}
                            <span className="text-xs text-slate-400">
                              {new Date(s.submittedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {s.repoUrl && (
                        <a href={s.repoUrl} target="_blank" rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-forge-primary hover:bg-slate-100 transition"
                          title="GitHub Repository"
                        >
                          <Code2 className="w-4 h-4" />
                        </a>
                      )}
                      {s.liveDemoUrl && (
                        <a href={s.liveDemoUrl} target="_blank" rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-forge-primary hover:bg-slate-100 transition"
                          title="Live Demo"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      {s.driveLink && (
                        <a href={s.driveLink} target="_blank" rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-forge-secondary hover:bg-slate-100 transition"
                          title="Google Drive / Code Folder"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                          </svg>
                        </a>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); toggleExpand(s._id); }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                      >
                        {expanded[s._id] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                      <ArrowRight className="w-4 h-4 text-forge-primary" />
                    </div>
                  </Link>
                  <AnimatePresence>
                    {expanded[s._id] && <GithubAnalyticsRow submission={s} />}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div variants={itemVariants}>
          <Card className="text-center py-12">
            <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 mb-4">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold font-heading text-slate-900 mb-1">All Caught Up!</h3>
            <p className="text-sm text-slate-500">No submissions waiting for review. Great job!</p>
          </Card>
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6 mt-8">
        <Card padding={false} hover={false}>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-forge-primary" />
              <h3 className="text-sm font-bold font-heading text-slate-900">Platform Statistics</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: "Total Users", value: stats?.totalUsers || 0 },
                { label: "Total Projects", value: stats?.totalProjects || 0 },
                { label: "Total Hires", value: stats?.totalHires || 0 },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                  <span className="text-sm text-slate-500">{item.label}</span>
                  <span className="text-sm font-bold font-heading text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card padding={false} hover={false}>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-4 h-4 text-forge-primary" />
              <h3 className="text-sm font-bold font-heading text-slate-900">Your Role</h3>
            </div>
            <div className="space-y-3">
              {[
                "Review candidate project submissions",
                "Score on MentriQ's 5-part rubric",
                "Recommend top performers to companies",
                "Shortlist qualified candidates",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm text-slate-600">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default AdminDashboard;
