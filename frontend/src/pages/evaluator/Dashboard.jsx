import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api/axios";
import {
  Search, X, FileText, Briefcase, Users, CheckCircle, XCircle,
  Building2, Clock, Filter, ExternalLink, Code2, Globe, FolderOpen,
} from "lucide-react";
import {
  PageHeader, Card, Badge, StatusBadge, Button, StatCard, EmptyState, Select, Input,
  Avatar,
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

const experienceColors = {
  student: "blue",
  fresher: "green",
  professional: "purple",
  career_switcher: "orange",
  freelancer: "amber",
  internship_seeker: "cyan",
};

const EvaluatorDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [typeFilter, statusFilter, debouncedSearch]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (typeFilter !== "all") params.type = typeFilter;
      if (statusFilter !== "all") params.status = statusFilter;
      if (debouncedSearch) params.search = debouncedSearch;
      const res = await api.get("/applications/all", { params });
      setApplications(res.data.applications || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [typeFilter, statusFilter, debouncedSearch]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <PageHeader
        title="Evaluator Dashboard"
        description="Review candidate applications for hiring."
      />

      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Applications" value={total} icon={FileText} color="forge" />
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="space-y-3 mb-6">
          <div className="flex flex-col lg:flex-row gap-3 mb-3">
            <Select
              label="Type"
              options={[
                { value: "all", label: "All" },
                { value: "job", label: "Jobs" },
                { value: "project", label: "Project Based" },
              ]}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            />
            <Select
              label="Status"
              options={[
                { value: "all", label: "All Statuses" },
                { value: "applied", label: "Applied" },
                { value: "in_progress", label: "In Progress" },
                { value: "submitted", label: "Submitted" },
                { value: "under_review", label: "Under Review" },
                { value: "shortlisted", label: "Shortlisted" },
                { value: "rejected", label: "Rejected" },
                { value: "interview_scheduled", label: "Interview Scheduled" },
                { value: "hired", label: "Hired" },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
          </div>

          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search candidate, email, or opportunity..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:border-forge-primary focus:ring-2 focus:ring-forge-primary/20"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { value: "all", label: "All Applications", icon: Users },
            { value: "job", label: "Jobs", icon: Briefcase },
            { value: "project", label: "Project Based", icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.value}
                onClick={() => setTypeFilter(tab.value)}
                className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                  typeFilter === tab.value
                    ? "bg-forge-primary text-white shadow-md shadow-forge-primary/20"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <p className="text-sm text-slate-400 mb-4">{total} application{total !== 1 ? "s" : ""} found</p>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : applications.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No applications found"
            description="No candidate applications are currently available for review."
            actionLabel={search || typeFilter !== "all" || statusFilter !== "all" ? "Clear Filters" : undefined}
            onAction={() => { setSearch(""); setTypeFilter("all"); setStatusFilter("all"); }}
          />
        ) : (
          <div className="space-y-3">
            {applications.map((app, i) => (
              <motion.div
                key={app._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card padding={false} hover={false}>
                  <div className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-lg bg-slate-100 shrink-0">
                            {app.applicationType === "direct_hire" ? (
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
                            <Badge color={app.applicationType === "direct_hire" ? "blue" : "forge"}>
                              {app.applicationType === "direct_hire" ? "Job" : "Project Based"}
                            </Badge>
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
                        <select
                          value={app.status}
                          disabled={false}
                          onChange={(e) => {
                            // Evaluator can update status
                            api.put(`/applications/${app._id}/status`, { status: e.target.value })
                              .then(() => fetchApplications())
                              .catch(() => alert("Failed to update status"));
                          }}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-forge-primary focus:ring-2 focus:ring-forge-primary/20"
                        >
                          {[
                            { value: "shortlisted", label: "Shortlist & Forward to Company" },
                            { value: "under_review", label: "Mark Under Review" },
                            { value: "rejected", label: "Reject" },
                            { value: "interview_scheduled", label: "Interview Scheduled" },
                            { value: "hired", label: "Hired" },
                          ].map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                        {app.status !== "shortlisted" && app.status !== "hired" && (
                          <Button
                            size="sm"
                            icon={ExternalLink}
                            onClick={() => window.location.href = `/admin/applications/${app._id}`}
                            title="View full application"
                          >
                            Review
                          </Button>
                        )}

                        {app.evaluation && app.evaluation.recommendation === "shortlist" && (
                          <Button
                            size="sm"
                            color="forge"
                            onClick={() => {
                              if (window.confirm("Are you sure you want to shortlist this candidate? The candidate will become visible to the Company for further review.")) {
                                api.post(`/applications/${app._id}/shortlist`).then(() => {
                                  fetchApplications();
                                  alert("Candidate shortlisted successfully. The candidate is now visible to the Company.");
                                }).catch(() => alert("Failed to shortlist candidate"));
                              }
                            }}
                            title="Shortlist Candidate"
                          >
                            Shortlist Candidate
                          </Button>
                        ) || (
                          <Button
                            size="sm"
                            color="green"
                            onClick={() => window.location.href = `/admin/applications/${app._id}`}
                            title="View shortlisted application"
                          >
                            <CheckCircle className="w-4 h-4 me-1" /> View Shortlisted
                          </Button>
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
    </motion.div>
  );
};

export default EvaluatorDashboard;