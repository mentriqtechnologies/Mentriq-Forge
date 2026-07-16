import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../api/axios";
import {
  Trash2, RotateCcw, AlertTriangle, Search, X, FileText,
  Briefcase, Filter, Archive, Skull,
} from "lucide-react";
import { PageHeader, Card, Badge, Button, Modal, EmptyState } from "../../components/ui";

const DeletedReports = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [confirmModal, setConfirmModal] = useState(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = { page: 1, limit: 100 };
      if (typeFilter !== "all") params.type = typeFilter;
      if (search) params.search = search;
      const res = await api.get("/admin/deleted-items", { params });
      setItems(res.data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [typeFilter]);

  useEffect(() => {
    const timer = setTimeout(() => fetchItems(), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleRestore = async (id) => {
    try {
      await api.put(`/admin/deleted-items/${id}/restore`);
      setConfirmModal(null);
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePermanentDelete = async (id) => {
    try {
      await api.delete(`/admin/deleted-items/${id}/permanent`);
      setConfirmModal(null);
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = items.filter((item) => {
    if (search) {
      const q = search.toLowerCase();
      return (
        item.title?.toLowerCase().includes(q) ||
        item.companyName?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        title="Deleted Reports"
        description="View and manage all soft-deleted jobs and project based jobs. Restore or permanently remove."
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title or company name..."
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
          icon={Archive}
          title="No deleted items found"
          description={search || typeFilter !== "all" ? "Try adjusting your search or filters." : "No items have been deleted yet."}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((item, i) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card padding={false} hover={false}>
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-red-50 shrink-0">
                          {item.type === "Job" ? (
                            <Briefcase className="w-4 h-4 text-red-500" />
                          ) : (
                            <FileText className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold font-heading text-slate-900">{item.title}</h3>
                          <p className="text-xs text-slate-500">{item.companyName}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                        <div>
                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Type</p>
                          <Badge color={item.type === "Job" ? "blue" : "forge"}>{item.type}</Badge>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Posted</p>
                          <p className="text-xs text-slate-600">{new Date(item.postedDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Deleted</p>
                          <p className="text-xs text-slate-600">{new Date(item.deletedDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Deleted By</p>
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs text-slate-600">{item.deletedByName}</p>
                            <Badge color={item.deletedBy?.role === "admin" ? "green" : "purple"} dot>
                              {item.deletedBy?.role === "admin" ? "Admin" : "Company"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={RotateCcw}
                        onClick={() => setConfirmModal({ action: "restore", id: item._id, title: item.title })}
                      >
                        Restore
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={Skull}
                        onClick={() => setConfirmModal({ action: "permanent", id: item._id, title: item.title })}
                      >
                        Delete Forever
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        isOpen={!!confirmModal}
        onClose={() => setConfirmModal(null)}
        title={confirmModal?.action === "restore" ? "Restore Item" : "Permanently Delete"}
        size="sm"
      >
        <div className="text-center">
          <div className={`inline-flex p-3 rounded-xl mb-4 ${confirmModal?.action === "restore" ? "bg-emerald-50" : "bg-red-50"}`}>
            {confirmModal?.action === "restore" ? (
              <RotateCcw className="w-6 h-6 text-emerald-500" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-red-500" />
            )}
          </div>
          <h3 className="text-lg font-bold font-heading text-slate-900 mb-2">
            {confirmModal?.action === "restore" ? "Restore this item?" : "Delete permanently?"}
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            {confirmModal?.action === "restore"
              ? `"${confirmModal?.title}" will be restored and re-opened for applications.`
              : `"${confirmModal?.title}" will be permanently removed. This action cannot be undone.`}
          </p>
          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={() => setConfirmModal(null)}>
              Cancel
            </Button>
            <Button
              variant={confirmModal?.action === "restore" ? "primary" : "danger"}
              fullWidth
              onClick={() =>
                confirmModal?.action === "restore"
                  ? handleRestore(confirmModal.id)
                  : handlePermanentDelete(confirmModal.id)
              }
            >
              {confirmModal?.action === "restore" ? "Restore" : "Delete Forever"}
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default DeletedReports;
