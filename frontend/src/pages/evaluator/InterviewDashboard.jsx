import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../api/axios";
import {
  Search, X, Calendar, ExternalLink, MapPin, CalendarDays,
} from "lucide-react";
import {
  PageHeader, Card, Badge, StatCard, EmptyState, Select, Input,
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

const EvaluatorInterviewDashboard = () => {
  const [interviews, setInterviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const params = { page: 1, limit: 20 };
      if (statusFilter !== "all") params.status = statusFilter;
      if (modeFilter !== "all") params.mode = modeFilter;
      if (debouncedSearch) params.search = debouncedSearch;
      const res = await api.get("/interviews", { params });
      setInterviews(res.data.interviews || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, [statusFilter, modeFilter, debouncedSearch]);

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
        title="Evaluator Interview Dashboard"
        description="Manage and track interviews for candidate evaluations."
      />

      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <StatCard label="Total Interviews" value={total} icon={Calendar} color="forge" />
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

        <p className="text-sm text-slate-400 mb-4">{total} interview{total !== 1 ? "s" : ""} found</p>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : interviews.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No interviews found"
            description="No interviews match your current filters. Try adjusting the status or mode filters."
            actionLabel={search || statusFilter !== "all" || modeFilter !== "all" ? "Clear Filters" : undefined}
            onAction={() => { setSearch(""); setStatusFilter("all"); setModeFilter("all"); }}
          />
        ) : (
          <div className="space-y-3">
            {interviews.map((interview, i) => {
              const modeBadge = interview.mode === "online" ? (
                <Badge color="blue" size="sm" className="me-1">
                  <ExternalLink className="w-2.5 h-2.5 me-1" /> Online
                </Badge>
              ) : (
                <Badge color="purple" size="sm" className="me-1">
                  <MapPin className="w-2.5 h-2.5 me-1" /> Offline
                </Badge>
              );

              const statusBadge = interview.status === "completed" ? (
                <Badge color="green" className="me-1">Completed</Badge>
              ) : (
                <Badge color="purple" className="me-1">{interview.status || "Scheduled"}</Badge>
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
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-slate-900">
                              {interview.interviewType || "Interview"}
                            </span>
                            {interview.mode && modeBadge}
                            {statusBadge}
                          </div>
                          <p className="text-sm font-medium text-slate-700">{interviewDate}</p>
                          <p className="text-xs text-slate-400">
                            {interview.startTime || "—"} – {interview.endTime || "—"}
                          </p>
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
    </motion.div>
  );
};

export default EvaluatorInterviewDashboard;