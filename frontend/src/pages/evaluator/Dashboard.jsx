import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api/axios";
import {
  FileText, CheckCircle, ClipboardCheck, TrendingUp, ThumbsUp, ThumbsDown,
  GraduationCap, CalendarClock, ArrowRight, Award, Building2,
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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <PageHeader
        title="Evaluation Dashboard"
        description="Manage your evaluation workload — review submissions, record recommendations, and track interviews."
      />

      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard label="Pending Submissions" value={loading ? "—" : stats.pendingSubmissions ?? 0} icon={FileText} color="forge" />
          <StatCard label="Reviewed" value={loading ? "—" : stats.reviewedSubmissions ?? 0} icon={CheckCircle} color="green" />
          <StatCard label="My Evaluations" value={loading ? "—" : stats.myEvaluations ?? 0} icon={ClipboardCheck} color="purple" />
          <StatCard label="Average Score" value={loading ? "—" : stats.avgScore ?? 0} icon={TrendingUp} color="orange" />
          <StatCard label="Hired from My Reviews" value={loading ? "—" : stats.hiredFromMyReviews ?? 0} icon={Award} color="purple" />
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
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
          </Card>

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
                {data.recentPending.map((s) => (
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
                      </p>
                    </div>
                    <Badge color="orange">Pending</Badge>
                    <ArrowRight className="w-4 h-4 text-slate-300" />
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
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
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold font-heading text-slate-900">Hired from Your Reviews</h3>
            <Link
              to="/evaluator/applications"
              className="inline-flex items-center gap-1 text-xs font-semibold text-forge-primary hover:underline"
            >
              Open Application Review <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : (data?.hiredFromMyReviews || []).length === 0 ? (
            <EmptyState
              icon={Award}
              title="No hires yet"
              description="Candidates you reviewed will appear here once a company officially hires them."
            />
          ) : (
            <div className="space-y-2">
              {data.hiredFromMyReviews.map((app) => (
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
      </motion.div>
    </motion.div>
  );
};

export default EvaluatorDashboard;