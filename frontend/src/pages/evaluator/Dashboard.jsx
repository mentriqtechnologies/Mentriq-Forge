import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api/axios";
import {
  FileText, CheckCircle, ClipboardCheck, TrendingUp, ThumbsUp, ThumbsDown,
  GraduationCap, CalendarClock, ArrowRight, Award, Building2, AlarmClock,
  Users, MessageSquare, BarChart3, AlertTriangle, ClipboardList,
} from "lucide-react";
import {
  PageHeader, Card, Badge, StatCard, EmptyState, Avatar,
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

const scoreKeys = [
  { key: "codeQuality", label: "Code Quality" },
  { key: "problemSolving", label: "Problem Solving" },
  { key: "standardsAdherence", label: "Standards" },
  { key: "completeness", label: "Completeness" },
  { key: "communication", label: "Communication" },
];

const PerformanceTile = ({ icon: Icon, label, value, iconClass = "" }) => (
  <div className="flex items-center gap-4 p-5">
    <div className={`p-3 rounded-xl shrink-0 ${iconClass}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div className="min-w-0">
      <p className="text-sm font-medium text-slate-500 truncate">{label}</p>
      <p className="text-2xl font-bold font-heading text-slate-900">{value ?? "—"}</p>
    </div>
  </div>
);

const daysSince = (date) => {
  if (!date) return null;
  const diff = (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.floor(diff));
};

const EvaluatorDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/dashboard/evaluator");
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = data?.stats || {};
  const scoreTrend = data?.scoreTrend || null;
  const slaDays = data?.slaDays || 7;

  const renderPendingSubmission = (s, withOverdue) => {
    const days = daysSince(s.submittedAt);
    const overdue = withOverdue && days !== null && days >= slaDays;
    return (
      <Link
        key={s._id}
        to={`/evaluator/submissions/${s._id}/evaluate`}
        className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-forge-primary/40 hover:bg-forge-primary/5 transition-all duration-200"
      >
        <Avatar name={s.candidate?.name || "Candidate"} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900 truncate">
            {s.candidate?.name || "Candidate"}
          </p>
          <p className="text-xs text-slate-400 truncate">
            {s.project?.title || "Project"} · {s.project?.domain || ""}
            {days !== null && <span className="ml-1">· {days}d old</span>}
          </p>
        </div>
        {overdue ? (
          <Badge color="red" dot>Overdue</Badge>
        ) : (
          <Badge color="orange">Pending</Badge>
        )}
        <ArrowRight className="w-4 h-4 text-slate-300" />
      </Link>
    );
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <PageHeader
        title="Evaluation Command Center"
        description="Your workload, review SLA, and every queue that needs a decision — submissions, candidate profiles, and interviews."
      />

      <motion.div variants={itemVariants} className="space-y-6">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Needs Your Action</h3>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard label="Pending Submissions" value={loading ? "—" : stats.pendingSubmissions ?? 0} icon={FileText} color="forge" />
            <StatCard label={`Overdue (${slaDays}d)`} value={loading ? "—" : stats.overdueCount ?? 0} icon={AlarmClock} color="red" />
            <StatCard label="Profile Reviews" value={loading ? "—" : stats.profileReviewsPending ?? 0} icon={Users} color="purple" />
            <StatCard label="Interviews to Record" value={loading ? "—" : stats.interviewOutcomesPending ?? 0} icon={MessageSquare} color="orange" />
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Performance</h3>
          <Card padding={false} hover={false}>
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
              <PerformanceTile
                icon={CheckCircle}
                label="Reviewed"
                value={loading ? "—" : stats.reviewedSubmissions ?? 0}
                iconClass="bg-emerald-100 text-emerald-600"
              />
              <PerformanceTile
                icon={ClipboardCheck}
                label="My Evaluations"
                value={loading ? "—" : stats.myEvaluations ?? 0}
                iconClass="bg-purple-100 text-purple-600"
              />
              <PerformanceTile
                icon={TrendingUp}
                label="Average Score"
                value={loading ? "—" : stats.avgScore ?? 0}
                iconClass="bg-orange-100 text-orange-600"
              />
            </div>
          </Card>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold font-heading text-slate-900">Pending Submissions</h3>
              <Link
                to="/evaluator/submissions"
                className="inline-flex items-center gap-1 text-xs font-semibold text-forge-primary hover:underline"
              >
                Open Queue <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : (data?.recentPending || []).length === 0 ? (
              <EmptyState
                icon={CheckCircle}
                title="Queue is clear"
                description="No submissions are waiting for evaluation."
              />
            ) : (
              <div className="space-y-3">
                {(data.recentPending || []).map((s) => renderPendingSubmission(s, false))}
              </div>
            )}
          </Card>

          <Card>
            <h3 className="text-sm font-bold font-heading text-slate-900 mb-4">Recommendation Breakdown</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50">
                <div className="flex items-center gap-2.5">
                  <ThumbsUp className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-800">Shortlisted</span>
                </div>
                <span className="text-lg font-bold text-emerald-700">{stats.shortlist ?? 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50">
                <div className="flex items-center gap-2.5">
                  <GraduationCap className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800">Needs Upskilling</span>
                </div>
                <span className="text-lg font-bold text-amber-700">{stats.needs_upskilling ?? 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50">
                <div className="flex items-center gap-2.5">
                  <ThumbsDown className="w-4 h-4 text-rose-600" />
                  <span className="text-sm font-medium text-rose-800">Rejected</span>
                </div>
                <span className="text-lg font-bold text-rose-700">{stats.reject ?? 0}</span>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Score by Criterion</h4>
                <span className="text-xs font-bold text-forge-primary">
                  {scoreTrend ? scoreTrend.overall : "—"} overall
                </span>
              </div>
              {!scoreTrend ? (
                <p className="text-xs text-slate-400">Evaluate submissions to build your score profile.</p>
              ) : (
                <div className="space-y-2.5">
                  {scoreKeys.map(({ key, label }) => {
                    const val = scoreTrend[key] ?? 0;
                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-slate-500">{label}</span>
                          <span className="text-xs font-bold text-slate-700">{val.toFixed(1)}</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${val >= 7 ? "bg-emerald-500" : val >= 5 ? "bg-amber-500" : "bg-red-500"}`}
                            style={{ width: `${val * 10}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <h3 className="text-sm font-bold font-heading text-slate-900">Overdue Submissions</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Queue items waiting more than {slaDays} days — prioritise these first.
            </p>
            {loading ? (
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : (data?.overduePending || []).length === 0 ? (
              <EmptyState
                icon={AlarmClock}
                title="Nothing overdue"
                description="Every pending submission is within your review SLA."
              />
            ) : (
              <div className="space-y-2">
                {(data.overduePending || []).map((s) => renderPendingSubmission(s, true))}
              </div>
            )}
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-4 h-4 text-forge-secondary" />
              <h3 className="text-sm font-bold font-heading text-slate-900">Interviews Awaiting Outcome</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Completed interviews still missing a recorded verdict and feedback.
            </p>
            {loading ? (
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : (data?.pendingInterviewOutcomes || []).length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="All outcomes recorded"
                description="No completed interviews are waiting for a verdict."
              />
            ) : (
              <div className="space-y-2">
                {(data.pendingInterviewOutcomes || []).map((iv) => (
                  <Link
                    key={iv._id}
                    to="/evaluator/interview/dashboard"
                    className="flex items-center gap-3 p-3 rounded-xl bg-orange-50 border border-orange-100 hover:border-orange-300 transition-all duration-200"
                  >
                    <div className="p-2 rounded-lg bg-white border border-orange-200 shrink-0">
                      <MessageSquare className="w-4 h-4 text-forge-secondary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {iv.application?.candidate?.name || iv.candidate?.name || "Candidate"}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {iv.interviewType || "Interview"}
                        {iv.date ? ` · ${new Date(iv.date).toLocaleDateString()}` : ""}
                      </p>
                    </div>
                    <Badge color="orange">Record outcome</Badge>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-forge-primary" />
              <h3 className="text-sm font-bold font-heading text-slate-900">Queue by Domain</h3>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-8 rounded-xl bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : (data?.workloadByDomain || []).length === 0 ? (
              <EmptyState
                icon={BarChart3}
                title="No workload"
                description="Pending submissions grouped by project domain will appear here."
              />
            ) : (
              <div className="space-y-3">
                {data.workloadByDomain.map((d) => {
                  const max = Math.max(...(data.workloadByDomain || []).map((x) => x.count), 1);
                  const pct = Math.round((d.count / max) * 100);
                  return (
                    <div key={d._id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-slate-600 capitalize">{d._id}</span>
                        <span className="text-xs font-bold text-slate-700">{d.count}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-forge-primary to-forge-secondary transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold font-heading text-slate-900">My Recent Evaluations</h3>
              <span className="text-xs text-slate-400">{stats.myEvaluations ?? 0} total</span>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : (data?.recentEvaluations || []).length === 0 ? (
              <EmptyState
                icon={ClipboardCheck}
                title="No evaluations yet"
                description="Your latest recommendations and scores will appear here."
              />
            ) : (
              <div className="space-y-2">
                {data.recentEvaluations.map((ev) => {
                  const rec = ev.recommendation;
                  const recColor = rec === "shortlist" ? "green" : rec === "reject" ? "red" : "orange";
                  const projectTitle = ev.application?.project?.title || ev.submission?.linkedRepoName || "Submission";
                  return (
                    <Link
                      key={ev._id}
                      to={`/evaluator/evaluations/${ev.application?._id || ""}`}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all duration-200"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{projectTitle}</p>
                        <p className="text-xs text-slate-400">
                          {ev.overallScore ?? "—"}/10 overall · {new Date(ev.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge color={recColor}>{rec?.replace(/_/g, " ")}</Badge>
                    </Link>
                  );
                })}
              </div>
            )}
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold font-heading text-slate-900">Upcoming Interviews</h3>
              <Link
                to="/evaluator/interview/dashboard"
                className="inline-flex items-center gap-1 text-xs font-semibold text-forge-primary hover:underline"
              >
                Manage Interviews <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : (data?.upcomingInterviews || []).length === 0 ? (
              <EmptyState
                icon={CalendarClock}
                title="No upcoming interviews"
                description="Scheduled evaluation interviews will appear here."
              />
            ) : (
              <div className="space-y-2">
                {data.upcomingInterviews.map((iv) => (
                  <div
                    key={iv._id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-50"
                  >
                    <div className="p-2 rounded-lg bg-white border border-slate-200">
                      <CalendarClock className="w-4 h-4 text-forge-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">{iv.interviewType || "Interview"}</p>
                      <p className="text-xs text-slate-400">
                        {iv.date ? new Date(iv.date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "—"}
                        {iv.startTime ? ` · ${iv.startTime}` : ""}
                      </p>
                    </div>
                    <Badge color={iv.mode === "online" ? "blue" : "green"}>{iv.mode || "—"}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold font-heading text-slate-900">Recently Hired</h3>
              <span className="text-xs text-slate-400">{stats.totalHires ?? 0} total hire{stats.totalHires !== 1 ? "s" : ""}</span>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : (data?.recentHires || []).length === 0 ? (
              <EmptyState
                icon={Award}
                title="No hires yet"
                description="Candidates officially hired by companies will appear here."
              />
            ) : (
              <div className="space-y-2">
                {data.recentHires.map((app) => (
                  <Link
                    key={app._id}
                    to={`/evaluator/application/${app._id}`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100 hover:border-emerald-300 transition-all duration-200"
                  >
                    <div className="p-2 rounded-lg bg-white border border-emerald-200">
                      <Award className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {app.candidate?.name || "Candidate"}
                      </p>
                      <p className="text-xs text-slate-400 truncate flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {app.project?.title} · {app.project?.company?.companyName || app.project?.company?.name}
                      </p>
                    </div>
                    <Badge color="green" dot>Hired</Badge>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EvaluatorDashboard;