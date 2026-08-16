import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../api/axios";
import {
  Search, X, Award, Building2, Briefcase, Mail, CheckCircle, Calendar, ChevronDown, ChevronUp,
} from "lucide-react";
import {
  PageHeader, Card, Badge, StatCard, EmptyState, Avatar, StatusBadge,
} from "../../components/ui";
import JourneyTimeline from "../../components/JourneyTimeline";

const HiredCandidates = () => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const fetchHired = async () => {
      setLoading(true);
      setError("");
      try {
        const params = { page: 1, limit: 100 };
        if (debouncedSearch) params.search = debouncedSearch;
        const res = await api.get("/admin/hired-candidates", { params });
        setItems(res.data.items || []);
        setTotal(res.data.total || 0);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load hired candidates");
      } finally {
        setLoading(false);
      }
    };
    fetchHired();
  }, [debouncedSearch]);

  const toggleDetail = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      setDetail(null);
      return;
    }
    setExpandedId(id);
    setDetail(null);
    setDetailLoading(true);
    try {
      const res = await api.get(`/admin/hired-candidates/${id}`);
      setDetail(res.data);
    } catch (err) {
      setDetail({ error: err.response?.data?.message || "Failed to load hiring record" });
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        title="Hired Candidates"
        description="Complete hiring records — which candidate was hired, by which company, for which role, and their full recruitment journey."
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Hired" value={total} icon={Award} color="green" />
        <StatCard label="Companies" value={new Set(items.map((i) => i.companyName)).size} icon={Building2} color="purple" />
        <StatCard label="Jobs / Projects Filled" value={items.filter((i) => i.projectTitle).length} icon={Briefcase} color="forge" />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4 flex items-center gap-3 mb-4">
          <X className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by candidate name..."
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

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/3 mb-3" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No candidates hired yet"
          description={search ? "Try a different search." : "Hired candidates will appear here once companies complete the hiring process."}
        />
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card padding={false} hover={false}>
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar name={item.candidateName} size="md" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold font-heading text-slate-900">
                            {item.candidateName || "Candidate"}
                          </h3>
                          <Badge color="green" dot>
                            <CheckCircle className="w-3 h-3" /> Hired
                          </Badge>
                        </div>
                        {item.candidateEmail && (
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" /> {item.candidateEmail}
                          </p>
                        )}
                        {item.jobRole && (
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Briefcase className="w-3 h-3" /> {item.jobRole}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      <div className="flex items-center gap-1.5 text-sm text-slate-700 font-medium rounded-xl bg-purple-50 border border-purple-200 px-3 py-1.5">
                        <Building2 className="w-4 h-4 text-purple-600" />
                        {item.companyName || "Company"}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 rounded-xl bg-slate-50 border border-slate-200 px-3 py-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(item.hiredAt).toLocaleDateString()}
                      </div>
                      <button
                        onClick={() => toggleDetail(item._id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-forge-primary hover:underline"
                      >
                        {expandedId === item._id ? "Hide Journey" : "View Journey"}
                        {expandedId === item._id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {item.evaluations?.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Evaluation History:</span>
                      {item.evaluations.map((ev) => (
                        <Badge key={ev._id} color={ev.recommendation === "shortlist" ? "green" : ev.recommendation === "reject" ? "red" : "orange"}>
                          {ev.recommendation} · {ev.evaluatorName || "Evaluator"}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {expandedId === item._id && (
                  <div className="p-5 pt-0 border-t border-slate-100">
                    {detailLoading ? (
                      <div className="space-y-2 py-4">
                        <div className="h-4 bg-slate-100 rounded w-1/2 animate-pulse" />
                        <div className="h-4 bg-slate-100 rounded w-2/3 animate-pulse" />
                      </div>
                    ) : detail?.error ? (
                      <p className="text-sm text-red-600 py-3">{detail.error}</p>
                    ) : detail ? (
                      <div className="grid lg:grid-cols-2 gap-6 pt-4">
                        <div>
                          <h4 className="text-sm font-bold font-heading text-slate-900 mb-3">Recruitment Journey</h4>
                          <JourneyTimeline history={detail.application?.statusHistory || []} highlight="hired" />

                          {detail.evaluations?.length > 0 && (
                            <div className="mt-6">
                              <h4 className="text-sm font-bold font-heading text-slate-900 mb-3">Evaluations</h4>
                              <div className="space-y-2">
                                {detail.evaluations.map((ev) => (
                                  <div key={ev._id} className="rounded-xl bg-slate-50 p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                      <StatusBadge status={ev.recommendation} />
                                      <span className="text-xs text-slate-400">
                                        {ev.evaluator?.name || "Evaluator"} · {new Date(ev.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-600">{ev.feedback || "No feedback"}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-bold font-heading text-slate-900 mb-2">Hiring Details</h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div className="rounded-xl bg-slate-50 p-3">
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Candidate</p>
                                <p className="font-medium text-slate-900 truncate">{detail.application?.candidate?.name || item.candidateName}</p>
                                <p className="text-xs text-slate-400 truncate">{detail.application?.candidate?.email}</p>
                              </div>
                              <div className="rounded-xl bg-slate-50 p-3">
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Company</p>
                                <p className="font-medium text-slate-900 truncate">
                                  {detail.application?.project?.company?.companyName || detail.application?.project?.company?.name}
                                </p>
                              </div>
                              <div className="rounded-xl bg-slate-50 p-3">
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Post</p>
                                <p className="font-medium text-slate-900 truncate">{detail.application?.project?.title}</p>
                                <p className="text-xs text-slate-400 truncate">{detail.application?.project?.jobRole || "—"}</p>
                              </div>
                              <div className="rounded-xl bg-slate-50 p-3">
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Hired On</p>
                                <p className="font-medium text-slate-900">
                                  {new Date(detail.hiredAt).toLocaleDateString()}
                                </p>
                                <p className="text-xs text-slate-400">Final status: Hired</p>
                              </div>
                            </div>
                          </div>

                          {detail.submission && (
                            <div>
                              <h4 className="text-sm font-bold font-heading text-slate-900 mb-2">Work Submission</h4>
                              <div className="flex flex-wrap gap-2">
                                {detail.submission.repoUrl && (
                                  <a href={detail.submission.repoUrl} target="_blank" rel="noreferrer" className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition font-medium">GitHub Repo</a>
                                )}
                                {detail.submission.liveDemoUrl && (
                                  <a href={detail.submission.liveDemoUrl} target="_blank" rel="noreferrer" className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition font-medium">Live Demo</a>
                                )}
                                {detail.submission.driveLink && (
                                  <a href={detail.submission.driveLink} target="_blank" rel="noreferrer" className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 hover:bg-amber-100 transition font-semibold">Code Folder</a>
                                )}
                              </div>
                            </div>
                          )}

                          {detail.interviews?.length > 0 && (
                            <div>
                              <h4 className="text-sm font-bold font-heading text-slate-900 mb-2">Interviews ({detail.interviews.length})</h4>
                              <div className="space-y-2">
                                {detail.interviews.map((iv) => (
                                  <div key={iv._id} className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                                    <span className="font-semibold text-slate-800">{iv.interviewType || "Interview"}</span>
                                    {" · "}{iv.mode}
                                    {" · "}{iv.date ? new Date(iv.date).toLocaleDateString() : "—"}
                                    {" · "}{iv.status}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default HiredCandidates;