import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../api/axios";
import ProjectCard from "../components/ProjectCard";
import { Search, SlidersHorizontal, X, Briefcase, FolderKanban } from "lucide-react";
import { PageHeader, Select, Button, CardSkeleton, Badge } from "../components/ui";
import EmptyState from "../components/ui/EmptyState";

const domains = [
  "Full Stack",
  "Frontend",
  "Backend",
  "UI/UX",
  "Data Science",
  "DevOps",
  "Blockchain/Web3",
  "Game Development",
  "Networking",
  "Business Analytics",
  "Cybersecurity",
  "AI/ML",
];

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (domain) params.domain = domain;
      const res = await api.get("/projects", { params });
      setProjects(res.data.projects);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchProjects, 300);
    return () => clearTimeout(t);
  }, [search, domain]);

  const filtered = projects.filter((p) => {
    if (typeFilter === "job") return p.applicationMode === "direct_hire";
    if (typeFilter === "project") return p.applicationMode !== "direct_hire";
    return true;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="app-container py-12"
    >
      <PageHeader
        title="Browse Hiring"
        description="Find jobs and project-based opportunities from real companies."
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            placeholder="Search by title or skill..."
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
        <div className="relative min-w-[180px]">
          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 appearance-none transition-all duration-200 focus:outline-none focus:border-forge-primary focus:ring-2 focus:ring-forge-primary/20"
          >
            <option value="">All Domains</option>
            {domains.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <SlidersHorizontal className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { value: "all", label: "All", icon: null },
          { value: "job", label: "Jobs", icon: Briefcase },
          { value: "project", label: "Project Based Jobs", icon: FolderKanban },
        ].map((opt) => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.value}
              onClick={() => setTypeFilter(opt.value)}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                typeFilter === opt.value
                  ? "bg-forge-primary text-white shadow-md shadow-forge-primary/20"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {Icon && <Icon className="w-4 h-4" />}
              {opt.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No opportunities found"
          description="No open positions match your filters right now. Try adjusting your search."
          actionLabel="Clear Filters"
          onAction={() => { setSearch(""); setDomain(""); setTypeFilter("all"); }}
        />
      ) : (
        <>
          <p className="text-sm text-slate-400 mb-4">
            Showing {filtered.length} open {typeFilter === "job" ? "job" : typeFilter === "project" ? "project based job" : "opportunity"}{filtered.length !== 1 ? "ies" : ""}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((p, i) => (
              <ProjectCard key={p._id} project={p} index={i} />
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
};

export default Projects;
