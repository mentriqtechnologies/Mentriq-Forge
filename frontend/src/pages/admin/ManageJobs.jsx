import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../api/axios";
import {
  Briefcase, FileText, Search, X, Trash2, AlertTriangle, Archive,
  MapPin, IndianRupee, Calendar, Building2,
} from "lucide-react";
import { PageHeader, Card, Badge, StatusBadge, Button, Modal, EmptyState } from "../../components/ui";

const ManageJobs = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.get("/projects", { params: { status: "all", limit: 100 } });
      const active = (res.data.projects || []).filter((p) => p.status !== "archived");
      setItems(active);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/projects/${deleteTarget._id}`);
      setDeleteTarget(null);
      fetchItems();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const filtered = items.filter((item) => {
    const isJob = item.applicationMode === "direct_hire";
    if (typeFilter !== "all" && ((typeFilter === "job") !== isJob)) return false;
    if (search) {
      const q = search.toLowerCase();
      const company = item.company?.name || item.company?.companyName || "—";
      return (
        item.title?.toLowerCase().includes(q) ||
        item.jobRole?.toLowerCase().includes(q) ||
        company.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const stats = {
    total: items.length,
    jobs: items.filter((i) => i.applicationMode === "direct_hire").length,
    projects: items.filter((i) => i.applicationMode !== "direct_hire").length,
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        title="Manage Jobs & Projects"
        description="View all active jobs and project based jobs from every company. Delete any listing — it goes to Deleted Reports where it can be restored."
      />

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total Listings", value: stats.total, icon: Archive, color: "text-forge-primary bg-forge-primary/10" },
          { label: "Jobs", value: stats.jobs, icon: Briefcase, color: "text-blue-600 bg-blue-50" },
          { label: "Project Based Jobs", value: stats.projects, icon: FileText, color: "text-orange-600 bg-orange-50" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-extrabold font-heading text-slate-900">{s.value}</p>
                <p className="text-[10px] sm:text-xs text-slate-500 truncate">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, role or company..."
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
            { value: "project", label: "Project Based Jobs" },
            { value: "job", label: "Jobs" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTypeFilter(opt.value)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                typeFilter === opt.value
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
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/3 mb-3" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No listings found"
          description={search || typeFilter !== "all" ? "Try adjusting your search or filters." : "No jobs or project based jobs have been created yet."}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((item, i) => {
            const isJob = item.applicationMode === "direct_hire";
            const company = item.company?.name || item.company?.companyName || "—";
            return (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card padding={false} hover={false}>
                  <div className="p-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-lg shrink-0 ${isJob ? "bg-blue-50" : "bg-orange-50"}`}>
                            {isJob ? (
                              <Briefcase className="w-4 h-4 text-blue-600" />
                            ) : (
                              <FileText className="w-4 h-4 text-orange-600" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold font-heading text-slate-900 truncate">{item.title || item.jobRole}</h3>
                            <p className="text-xs text-slate-500 flex items-center gap-1.5 truncate">
                              <Building2 className="w-3 h-3 shrink-0" />
                              {company}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          <Badge color={isJob ? "blue" : "orange"}>
                            {isJob ? "Direct Job" : "Project Based Job"}
                          </Badge>
                          <StatusBadge status={item.status} />
                          {item.salary && (
                            <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                              <IndianRupee className="w-3 h-3" /> {item.salary}
                            </span>
                          )}
                          {item.workLocation && (
                            <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                              <MapPin className="w-3 h-3" /> {item.workLocation}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                            <Calendar className="w-3 h-3" /> {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="danger"
                          size="sm"
                          icon={Trash2}
                          onClick={() => setDeleteTarget(item)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Listing"
        size="sm"
      >
        <div className="text-center">
          <div className="inline-flex p-3 rounded-xl bg-red-50 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-lg font-bold font-heading text-slate-900 mb-2">Delete this listing?</h3>
          <p className="text-sm text-slate-500 mb-6">
            "{deleteTarget?.title || deleteTarget?.jobRole}" from{" "}
            {deleteTarget?.company?.name || deleteTarget?.company?.companyName || "this company"} will be
            soft-deleted. It will disappear from active listings and appear in Deleted Reports,
            where you can restore or permanently remove it.
          </p>
          {deleteTarget && (
            <div className="flex justify-center gap-2 mb-6">
              <Badge color={deleteTarget.applicationMode === "direct_hire" ? "blue" : "orange"}>
                {deleteTarget.applicationMode === "direct_hire" ? "Direct Job" : "Project Based Job"}
              </Badge>
              <StatusBadge status={deleteTarget.status} />
            </div>
          )}
          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" fullWidth onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default ManageJobs;