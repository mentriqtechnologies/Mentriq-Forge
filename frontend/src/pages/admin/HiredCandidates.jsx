import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../api/axios";
import {
  Search, X, Award, Building2, Briefcase, Mail, CheckCircle, Calendar,
} from "lucide-react";
import { PageHeader, Card, Badge, StatCard, EmptyState, Avatar } from "../../components/ui";

const HiredCandidates = () => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [error, setError] = useState("");

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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        title="Hired Candidates"
        description="See which candidate was hired by which company, for which role, and when."
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Hired" value={total} icon={Award} color="green" />
        <StatCard label="Companies" value={new Set(items.map((i) => i.companyName)).size} icon={Building2} color="purple" />
        <StatCard label="Jobs / Projects Filled" value={items.filter((i) => i.jobRole).length} icon={Briefcase} color="forge" />
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

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1.5 text-sm text-slate-700 font-medium rounded-xl bg-purple-50 border border-purple-200 px-3 py-1.5">
                        <Building2 className="w-4 h-4 text-purple-600" />
                        {item.companyName || "Company"}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 rounded-xl bg-slate-50 border border-slate-200 px-3 py-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(item.hiredAt).toLocaleDateString()}
                      </div>
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

export default HiredCandidates;
