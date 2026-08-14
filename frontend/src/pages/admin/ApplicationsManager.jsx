import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import api from "../../api/axios";
import {
  Search, X, FileText, Briefcase, Users, CheckCircle, XCircle,
  Building2, Send, Clock,
} from "lucide-react";
import {
  PageHeader, Card, Badge, StatusBadge, Button, StatCard, EmptyState, Avatar, Select, CardSkeleton,
} from "../../components/ui";

const typeTabs = [
  { value: "all", label: "All Applications", icon: Users },
  { value: "job", label: "Jobs", icon: Briefcase },
  { value: "project", label: "Project Based", icon: FileText },
];

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "applied", label: "Applied" },
  { value: "in_progress", label: "In Progress" },
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under Review" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "rejected", label: "Rejected" },
  { value: "interview_scheduled", label: "Interview Scheduled" },
  { value: "hired", label: "Hired" },
];

const actionStatusOptions = [
  { value: "shortlisted", label: "Shortlist & Forward to Company" },
  { value: "under_review", label: "Mark Under Review" },
  { value: "rejected", label: "Reject" },
  { value: "interview_scheduled", label: "Interview Scheduled" },
  { value: "hired", label: "Hired" },
];

const experienceColors = {
  student: "blue",
  fresher: "green",
  professional: "purple",
  career_switcher: "orange",
  freelancer: "amber",
  internship_seeker: "cyan",
};

const ApplicationsManager = () => {
  const [applications, setApplications] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [updating, setUpdating] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError("");
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
      setError(err.response?.data?.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter, statusFilter, debouncedSearch]);

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

  const updateStatus = async (app, status) => {
    setUpdating(app._id);
    setMessage("");
    setError("");
    try {
      await api.put(`/applications/${app._id}/status`, { status });
      setMessage(
        status === "shortlisted"
          ? `${app.candidate?.name || app.applicantName || "Candidate"} shortlisted and forwarded to the company.`
          : status === "rejected"
          ? `${app.candidate?.name || app.applicantName || "Candidate"} rejected.`
          : `Status updated to "${status.replace(/_/g, " ")}".`
      );
      fetchApplications();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  const shortlistedCount = applications.filter((a) => a.status === "shortlisted").length;
  const hiredCount = applications.filter((a) => a.status === "hired").length;
  const appliedCount = applications.filter((a) => ["applied", "in_progress", "submitted", "under_review"].includes(a.status)).length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        title="Applications Manager"
        description="Review candidate applications for jobs and project-based hiring. Shortlist profiles to forward them to the company."
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="In Review" value={appliedCount} icon={Clock} color="orange" />
        <StatCard label="Shortlisted" value={shortlistedCount} icon={CheckCircle} color="green" />
        <StatCard label="Hired" value={hiredCount} icon={Users} color="purple" />
        <StatCard label="Total (this page)" value={applications.length} icon={FileText} color="forge" />
      </div>

      {message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl p-4 flex items-center gap-3 mb-4">
          <CheckCircle className="w-4 h-4 shrink-0" />
          {message}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4 flex items-center gap-3 mb-4">
          <XCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidate, email, or opportunity..."
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
        <div className="w-full lg:w-56">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={statusOptions}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {typeTabs.map((tab) => {
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
          description={search || typeFilter !== "all" || statusFilter !== "all" ? "Try adjusting your search or filters." : "No candidate applications yet."}
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

                      {app.candidate?.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {app.candidate.skills.slice(0, 4).map((s) => (
                            <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}

                      {app.applicationType === "direct_hire" && (app.mobileNumber || app.qualification || app.resumeDriveLink) && (
                        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 space-y-1">
                          <p className="font-semibold text-slate-800">Direct application details</p>
                          {app.mobileNumber && <p><span className="text-slate-400">Mobile:</span> {app.mobileNumber}</p>}
                          {app.qualification && <p><span className="text-slate-400">Qualification:</span> {app.qualification}</p>}
                          {app.resumeDriveLink && (
                            <a href={app.resumeDriveLink} target="_blank" rel="noreferrer" className="inline-flex text-forge-primary hover:underline">
                              View resume link
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      <select
                        value={app.status}
                        disabled={updating === app._id}
                        onChange={(e) => updateStatus(app, e.target.value)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-forge-primary focus:ring-2 focus:ring-forge-primary/20 disabled:opacity-60"
                      >
                        {actionStatusOptions.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                      {app.status !== "shortlisted" && app.status !== "hired" && (
                        <Button
                          size="sm"
                          icon={Send}
                          loading={updating === app._id}
                          onClick={() => updateStatus(app, "shortlisted")}
                        >
                          Shortlist
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

      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-sm text-slate-500">
            Page {page} of {pages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default ApplicationsManager;
