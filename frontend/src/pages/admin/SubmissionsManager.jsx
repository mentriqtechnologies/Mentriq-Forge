import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api/axios";
import { Search, X, FileText, Clock, CheckCircle, Filter, ExternalLink, Code2, Globe, FolderOpen, ChevronRight, Eye } from "lucide-react";
import { PageHeader, Card, Badge, StatusBadge, Button, StatCard, EmptyState, CardSkeleton } from "../../components/ui";

const experienceColors = {
  student: "blue",
  fresher: "green",
  professional: "purple",
  career_switcher: "orange",
  freelancer: "amber",
  internship_seeker: "cyan",
};

const SubmissionsManager = () => {
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/submissions/pending")
      .then((res) => {
        setSubmissions(res.data.submissions);
        setFilteredSubmissions(res.data.submissions);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    let results = submissions;

    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        (s) =>
          s.candidate?.name?.toLowerCase().includes(q) ||
          s.project?.title?.toLowerCase().includes(q) ||
          s.candidate?.email?.toLowerCase().includes(q)
      );
    }

    if (filter === "pending") {
      results = results.filter((s) => s.status === "pending_review");
    } else if (filter === "reviewed") {
      results = results.filter((s) => s.status === "reviewed");
    }

    setFilteredSubmissions(results);
  }, [search, filter, submissions]);

  const pendingCount = submissions.filter((s) => s.status === "pending_review").length;
  const reviewedCount = submissions.filter((s) => s.status === "reviewed").length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        title="Submissions Manager"
        description="Review and evaluate candidate project submissions."
      />

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Submissions" value={submissions.length} icon={FileText} color="forge" />
        <StatCard label="Pending Review" value={pendingCount} icon={Clock} color="orange" />
        <StatCard label="Reviewed" value={reviewedCount} icon={CheckCircle} color="green" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidate name, email, or project..."
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
        <div className="flex gap-2">
          {[
            { value: "all", label: "All" },
            { value: "pending", label: "Pending" },
            { value: "reviewed", label: "Reviewed" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                filter === opt.value
                  ? "bg-forge-primary text-white shadow-md shadow-forge-primary/20"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No submissions found"
          description={search || filter !== "all" ? "Try adjusting your search or filters." : "No submissions yet."}
          actionLabel={search || filter !== "all" ? "Clear Filters" : undefined}
          onAction={() => { setSearch(""); setFilter("all"); }}
        />
      ) : (
        <div className="space-y-3">
          {filteredSubmissions.map((s, i) => (
            <motion.div
              key={s._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Link to={`/admin/submissions/${s._id}/evaluate`} className="block group">
                <Card hover={true} padding={false}>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-bold font-heading text-slate-900 truncate group-hover:text-forge-primary transition-colors">
                              {s.project?.title}
                            </h3>
                            <p className="text-xs text-slate-400">{s.project?.domain}</p>
                          </div>
                          <StatusBadge status={s.status === "pending_review" ? "pending" : "reviewed"} />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                          <div>
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Candidate</p>
                            <p className="text-sm font-medium text-slate-900 truncate">{s.candidate?.name}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Email</p>
                            <p className="text-xs text-slate-600 truncate">{s.candidate?.email}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Level</p>
                            <Badge color={experienceColors[s.candidate?.experienceLevel] || "slate"} dot>
                              {s.candidate?.experienceLevel || "Not specified"}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Submitted</p>
                            <p className="text-xs text-slate-600">
                              {new Date(s.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {s.repoUrl && (
                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
                              <Code2 className="w-3 h-3" /> Repo
                            </span>
                          )}
                          {s.liveDemoUrl && (
                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
                              <Globe className="w-3 h-3" /> Demo
                            </span>
                          )}
                          {s.driveLink && (
                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-semibold">
                              <FolderOpen className="w-3 h-3" /> Drive
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <Button variant="ghost" size="sm" icon={Eye}>
                          Review
                        </Button>
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default SubmissionsManager;
