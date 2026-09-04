import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../api/axios";
import {
  Search, X, Calendar, ExternalLink, MapPin, CalendarDays, CheckCircle2,
  MessageSquare, Building2, Ban, Clock,
} from "lucide-react";
import {
  PageHeader, Card, Badge, StatCard, EmptyState, Select, Input, Button, Modal, Textarea, Avatar,
} from "../../components/ui";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const CardSkeleton = () => (
  <div className="animate-pulse rounded-2xl border border-slate-200 bg-slate-100 p-4">
    <div className="h-4 w-28 rounded bg-slate-200 mb-3" />
    <div className="h-4 w-full rounded bg-slate-200 mb-2" />
    <div className="h-4 w-2/3 rounded bg-slate-200" />
  </div>
);

const outcomeOptions = [
  { value: "recommended", label: "Recommended", color: "green", activeBg: "bg-emerald-500 text-white border-transparent", bg: "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100" },
  { value: "needs_further_review", label: "More Review", color: "amber", activeBg: "bg-amber-500 text-white border-transparent", bg: "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100" },
  { value: "not_recommended", label: "Not Recommended", color: "red", activeBg: "bg-red-500 text-white border-transparent", bg: "bg-red-50 border-red-200 text-red-700 hover:bg-red-100" },
];

const EvaluatorInterviewDashboard = () => {
  const [interviews, setInterviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all");
  const [needsOutcomeOnly, setNeedsOutcomeOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [outcomeInterview, setOutcomeInterview] = useState(null);
  const [outcomeFeedback, setOutcomeFeedback] = useState("");
  const [outcomeRec, setOutcomeRec] = useState("recommended");
  const [outcomeError, setOutcomeError] = useState("");
  const [outcomeBusy, setOutcomeBusy] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const params = { page: 1, limit: 100 };
      if (statusFilter !== "all") params.status = statusFilter;
      if (modeFilter !== "all") params.mode = modeFilter;
      if (debouncedSearch) params.search = debouncedSearch;
      const res = await api.get("/interviews", { params });
      setInterviews(res.data.interviews || []);
      setTotal(res.data.interviews?.length || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, [statusFilter, modeFilter, debouncedSearch]);

  const needsOutcome = (iv) => iv.status === "completed" && !iv.evaluated;

  const filtered = needsOutcomeOnly ? interviews.filter((iv) => needsOutcome(iv)) : interviews;
  const scheduledCount = interviews.filter((iv) => ["scheduled", "confirmed"].includes(iv.status)).length;
  const completedCount = interviews.filter((iv) => iv.status === "completed").length;
  const outcomePendingCount = interviews.filter((iv) => needsOutcome(iv)).length;

  const openOutcomeModal = (iv) => {
    setOutcomeInterview(iv);
    setOutcomeFeedback(iv.feedback || "");
    setOutcomeRec(iv.recommendation && iv.recommendation !== "needs_further_review" ? iv.recommendation : "recommended");
    setOutcomeError("");
  };

  const submitOutcome = async () => {
    if (!outcomeFeedback.trim()) {
      setOutcomeError("Detailed feedback is required before recording the outcome.");
      return;
    }
    setOutcomeBusy(true);
    setOutcomeError("");
    try {
      await api.post(`/interviews/${outcomeInterview._id}/complete`, {
        feedback: outcomeFeedback,
        recommendation: outcomeRec,
      });
      setOutcomeInterview(null);
      setOutcomeBusy(false);
      fetchInterviews();
    } catch (err) {
      setOutcomeError(err.response?.data?.message || "Failed to record outcome");
      setOutcomeBusy(false);
    }
  };

  const completeWithoutOutcome = async (iv) => {
    if (!window.confirm("Mark this interview as completed without recording an outcome? You can record the outcome later.")) return;
    try {
      await api.post(`/interviews/${iv._id}/complete`, {});
      fetchInterviews();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to complete interview");
    }
  };

  const modeOptions = [
    { value: "all", label: "All Modes" },
    { value: "online", label: "Online" },
    { value: "offline", label: "Offline / In-Person" },
  ];

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "scheduled", label: "Scheduled" },
    { value: "confirmed", label: "Confirmed" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <PageHeader
        title="Evaluator Interview Command Center"
        description="Schedule, track, and record verdicts for evaluation interviews."
      />

      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Interviews" value={loading ? "—" : total} icon={Calendar} color="forge" />
          <StatCard label="Upcoming" value={loading ? "—" : scheduledCount} icon={CalendarDays} color="purple" />
          <StatCard label="Completed" value={loading ? "—" : completedCount} icon={CheckCircle2} color="green" />
          <StatCard label="Needs Outcome" value={loading ? "—" : outcomePendingCount} icon={MessageSquare} color="orange" />
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="space-y-3 mb-6">
          <div className="flex flex-col lg:flex-row gap-3 mb-3">
            <Select
              label="Status"
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
            <Select
              label="Mode"
              options={modeOptions}
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setNeedsOutcomeOnly((v) => !v)}
              className={`inline-flex items-center gap-1.5 self-end px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                needsOutcomeOnly
                  ? "bg-forge-secondary text-white shadow-md shadow-forge-secondary/20"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <MessageSquare className="w-4 h-4" /> Needs Outcome
            </button>
          </div>

          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search interview or candidate..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:border-forge-primary focus:ring-2 focus:ring-forge-primary/20"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <p className="text-sm text-slate-400 mb-4">{filtered.length} interview{filtered.length !== 1 ? "s" : ""} found</p>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No interviews found"
            description="No interviews match your current filters. Try adjusting the status or mode filters."
            actionLabel={search || statusFilter !== "all" || modeFilter !== "all" || needsOutcomeOnly ? "Clear Filters" : undefined}
            onAction={() => { setSearch(""); setStatusFilter("all"); setModeFilter("all"); setNeedsOutcomeOnly(false); }}
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((interview, i) => {
              const project = interview.application?.project;
              const company = project?.company;
              const candidate = interview.application?.candidate || interview.candidate;
              const isCompleted = interview.status === "completed";
              const unevaluated = needsOutcome(interview);
              const isCancelled = interview.status === "cancelled";

              const statusBadge = isCancelled ? (
                <Badge color="red">Cancelled</Badge>
              ) : isCompleted ? (
                interview.evaluated ? (
                  <Badge color="green" dot>Completed · Outcome recorded</Badge>
                ) : (
                  <Badge color="orange" dot>Completed · Awaiting outcome</Badge>
                )
              ) : (
                <Badge color="purple" dot>{interview.status || "Scheduled"}</Badge>
              );

              const interviewDate = interview.date ? new Date(interview.date).toLocaleDateString() : "—";

              return (
                <motion.div
                  key={interview._id || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card padding={false} hover={false}>
                    <div className="p-4">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <Avatar name={candidate?.name || "Candidate"} size="sm" />
                            <span className="text-sm font-bold text-slate-900">
                              {candidate?.name || "Candidate"}
                            </span>
                            {interview.interviewType && (
                              <span className="text-xs text-slate-400">{interview.interviewType}</span>
                            )}
                            {interview.mode === "online" ? (
                              <Badge color="blue" size="sm" className="me-0"><ExternalLink className="w-2.5 h-2.5 me-1" /> Online</Badge>
                            ) : (
                              <Badge color="purple" size="sm" className="me-0"><MapPin className="w-2.5 h-2.5 me-1" /> Offline</Badge>
                            )}
                            {statusBadge}
                          </div>

                          {project && (
                            <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {project.title} · {company?.companyName || company?.name || "Company"}
                            </p>
                          )}

                          <p className="text-xs text-slate-400 mt-1">{interviewDate}</p>

                          {isCompleted && interview.feedback && (
                            <p className="text-xs text-slate-500 mt-2 bg-slate-50 rounded-lg p-2 line-clamp-2">
                              <span className="font-semibold">Outcome:</span> {interview.feedback}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0 flex-wrap">
                          {isCompleted && !interview.evaluated && (
                            <Button size="sm" icon={MessageSquare} onClick={() => openOutcomeModal(interview)}>
                              Record Outcome
                            </Button>
                          )}
                          {isCompleted && (
                            <Button size="sm" variant="ghost" icon={CheckCircle2} onClick={() => openOutcomeModal(interview)}>
                              Edit Outcome
                            </Button>
                          )}
                          {!isCompleted && !isCancelled && (
                            <>
                              <Button size="sm" icon={MessageSquare} onClick={() => openOutcomeModal(interview)}>
                                Complete & Record
                              </Button>
                              <Button size="sm" variant="ghost" icon={Clock} onClick={() => completeWithoutOutcome(interview)}>
                                Mark Completed
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      <Modal
        isOpen={Boolean(outcomeInterview)}
        onClose={() => setOutcomeInterview(null)}
        title="Record Interview Outcome"
        size="md"
      >
        {outcomeInterview && (
          <div className="space-y-5">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-sm font-bold text-slate-900">{outcomeInterview.application?.candidate?.name || outcomeInterview.candidate?.name || "Candidate"}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {outcomeInterview.interviewType || "Interview"}
                {outcomeInterview.date ? ` · ${new Date(outcomeInterview.date).toLocaleDateString()}` : ""}
                {outcomeInterview.mode === "online" ? " · Online" : " · Offline"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Recommendation</label>
              <div className="flex gap-2">
                {outcomeOptions.map((opt) => (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => setOutcomeRec(opt.value)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border-2 ${
                      outcomeRec === opt.value ? opt.activeBg : opt.bg
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Feedback</label>
              <Textarea
                rows={4}
                required
                value={outcomeFeedback}
                onChange={(e) => setOutcomeFeedback(e.target.value)}
                placeholder="Summarise the candidate's interview performance and why you reached this verdict..."
              />
            </div>

            {outcomeError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4">{outcomeError}</div>
            )}

            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setOutcomeInterview(null)}>Cancel</Button>
              <Button icon={CheckCircle2} loading={outcomeBusy} onClick={submitOutcome}>
                Save Outcome
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export default EvaluatorInterviewDashboard;