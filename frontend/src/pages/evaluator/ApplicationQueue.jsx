import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api/axios";
import {
  Search, X, Send, ThumbsDown, ExternalLink, Building2, FileText, Briefcase,
} from "lucide-react";
import {
  PageHeader, Card, Badge, StatusBadge, Button, StatCard, EmptyState, Avatar, CardSkeleton,
} from "../../components/ui";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const stages = [
  { value: "to_review", label: "To Review" },
  { value: "forwarded", label: "Forwarded to Company" },
  { value: "decided", label: "Decided" },
];

const experienceColors = {
  student: "blue",
  fresher: "green",
  professional: "purple",
  career_switcher: "orange",
  freelancer: "amber",
  internship_seeker: "cyan",
};

const ApplicationQueue = () => {
  const [applications, setApplications] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState("to_review");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = { page: 1, limit: 50, stage };
      if (statusFilter !== "all") params.status = statusFilter;
      if (debouncedSearch) params.search = debouncedSearch;
      const res = await api.get("/applications/queue", { params });
      setApplications(res.data.applications || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [stage, statusFilter, debouncedSearch]);

  const forwardToCompany = async (app) => {
    if (!window.confirm("Forward this candidate's profile to the company? The company will immediately gain access to this candidate for review.")) return;
    setBusyId(app._id);
    try {
      await api.post(`/applications/${app._id}/shortlist`);
      fetchApplications();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to forward candidate");
    } finally {
      setBusyId("");
    }
  };

  const rejectApplication = async (app) => {
    if (!window.confirm("Reject this application? The candidate will be marked as rejected and will not be forwarded to the company.")) return;
    setBusyId(app._id);
    try {
      await api.post(`/applications/${app._id}/reject`);
      fetchApplications();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject application");
    } finally {
      setBusyId("");
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <PageHeader
        title="Application Review Queue"
        description="Review project-based candidate profiles. Suitable candidates are forwarded to the company for the next stage."
      />

      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatCard label="Applications" value={total} icon={FileText} color="forge" />
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="flex flex-wrap gap-2 mb-5">
          {stages.map((s) => (
            <button
              key={s.value}
              onClick={() => { setStage(s.value); setStatusFilter("all"); }}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                stage === s.value
                  ? "bg-forge-primary text-white shadow-md shadow-forge-primary/20"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidate name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:border-forge-primary focus:ring-2 focus:ring-forge-primary/20"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-forge-primary focus:ring-2 focus:ring-forge-primary/20"
          >
            <option value="all">All Statuses</option>
            {[
              { value: "applied", label: "Applied" },
              { value: "in_progress", label: "Work In Progress" },
              { value: "submitted", label: "Work Submitted" },
              { value: "under_review", label: "Under Review" },
              { value: "shortlisted", label: "Forwarded" },
              { value: "company_reviewing", label: "Company Reviewing" },
              { value: "company_interview", label: "Company Interview" },
              { value: "decision_pending", label: "Decision Pending" },
              { value: "interview_scheduled", label: "Interview Scheduled" },
              { value: "hired", label: "Hired" },
              { value: "rejected", label: "Rejected" },
            ].map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : applications.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No applications found"
          description={stage === "to_review" ? "No project-based applications are waiting for review." : "No applications in this stage."}
        />
      ) : (
        <div className="space-y-3">
          {applications.map((app, i) => (
            <motion.div key={app._id} variants={itemVariants}>
              <Card padding={false} hover={false}>
                <div className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-slate-100 shrink-0">
                          {app.project?.applicationMode === "direct_hire" ? (
                            <Briefcase className="w-4 h-4 text-forge-primary" />
                          ) : (
                            <FileText className="w-4 h-4 text-forge-secondary" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold font-heading text-slate-900 truncate">
                            {app.project?.title}
                          </h3>
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {app.project?.company?.companyName || app.project?.company?.name || "Company"}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={app.candidate?.name || app.applicantName} size="sm" />
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {app.candidate?.name || app.applicantName || "Candidate"}
                            </p>
                            <p className="text-xs text-slate-400">{app.candidate?.email || "—"}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge color="forge">Project Based</Badge>
                          {app.candidate?.experienceLevel && (
                            <Badge color={experienceColors[app.candidate.experienceLevel] || "slate"} dot>
                              {app.candidate.experienceLevel.replace(/_/g, " ")}
                            </Badge>
                          )}
                          <StatusBadge status={app.status} />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      <Link
                        to={`/evaluator/application/${app._id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200"
                      >
                        <ExternalLink className="w-4 h-4" /> Review
                      </Link>
                      {["applied", "in_progress", "submitted", "under_review"].includes(app.status) && (
                        <>
                          <Button
                            size="sm"
                            icon={Send}
                            loading={busyId === app._id}
                            onClick={() => forwardToCompany(app)}
                          >
                            Forward to Company
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            icon={ThumbsDown}
                            disabled={busyId === app._id}
                            onClick={() => rejectApplication(app)}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default ApplicationQueue;