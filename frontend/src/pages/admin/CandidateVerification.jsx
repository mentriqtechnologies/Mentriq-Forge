import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../api/axios";
import {
  BadgeCheck, Users, CheckCircle, XCircle, Mail, Search,
  User, Clock, AlertTriangle,
} from "lucide-react";
import { PageHeader, Card, Button, Badge, Avatar, Modal, EmptyState } from "../../components/ui";

const experienceColorMap = {
  student: "slate",
  fresher: "blue",
  professional: "green",
  career_switcher: "purple",
  freelancer: "orange",
  internship_seeker: "cyan",
};

const verificationColorMap = {
  pending: "amber",
  approved: "green",
  rejected: "red",
  none: "slate",
};

const CandidateVerification = () => {
  const [candidates, setCandidates] = useState([]);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [rejectModal, setRejectModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCandidates = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/verification/candidates", {
        params: { status: statusFilter, search: debouncedSearch || undefined, limit: 50 },
      });
      setCandidates(res.data.candidates || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load candidates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchCandidates();
  }, [statusFilter, debouncedSearch]);

  const handleApprove = async (candidate) => {
    setActionLoading(true);
    setError("");
    setMessage("");
    try {
      await api.put(`/verification/candidates/${candidate._id}`, { status: "approved" });
      setMessage(`${candidate.name} has been approved and is now visible to companies.`);
      fetchCandidates();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve candidate");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setError("Please provide a reason for rejecting this candidate");
      return;
    }
    setActionLoading(true);
    setError("");
    setMessage("");
    try {
      await api.put(`/verification/candidates/${selected._id}`, {
        status: "rejected",
        reason: rejectReason.trim(),
      });
      setMessage(`${selected.name} has been rejected. The candidate will be notified with the reason.`);
      setRejectModal(false);
      setSelected(null);
      setRejectReason("");
      fetchCandidates();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject candidate");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        title="Candidate Verification"
        description="Review candidate profiles and approve or reject them. Only approved candidates are visible to companies."
      />

      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-forge-primary focus:ring-2 focus:ring-forge-primary/20"
          />
        </div>
        <div className="flex items-center gap-2">
          {[
            { value: "pending", label: "Pending" },
            { value: "approved", label: "Approved" },
            { value: "rejected", label: "Rejected" },
            { value: "all", label: "All" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                statusFilter === tab.value
                  ? "bg-forge-primary text-white shadow-md shadow-forge-primary/20"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
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

      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-slate-400" />
        <h2 className="text-lg font-bold font-heading text-slate-900">Candidates</h2>
        <Badge color="slate">{candidates.length}</Badge>
      </div>

      {candidates.length === 0 && !loading ? (
        <EmptyState
          icon={BadgeCheck}
          title="No candidates to review"
          description="Candidates appear here after they complete their profile and submit it for review."
        />
      ) : (
        <div className="space-y-3">
          {candidates.map((candidate) => (
            <Card key={candidate._id} padding={false} hover={false}>
              <div className="p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-4">
                    <Avatar name={candidate.name} src={candidate.avatarUrl} size="md" />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold font-heading text-slate-900">{candidate.name}</p>
                        <Badge color={verificationColorMap[candidate.verificationStatus] || "slate"} dot>
                          {candidate.verificationStatus === "none" ? "Not submitted" : candidate.verificationStatus}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {candidate.email}
                        </span>
                        {candidate.phone && (
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <User className="w-3 h-3" /> {candidate.phone}
                          </span>
                        )}
                        {candidate.verificationSubmittedAt && (
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Submitted {new Date(candidate.verificationSubmittedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {candidate.bio && (
                        <p className="text-sm text-slate-500 mt-2 line-clamp-2">{candidate.bio}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {candidate.experienceLevel && (
                          <Badge color={experienceColorMap[candidate.experienceLevel] || "slate"}>
                            {candidate.experienceLevel.replace(/_/g, " ")}
                          </Badge>
                        )}
                        {(candidate.skills || []).slice(0, 5).map((skill) => (
                          <span
                            key={skill}
                            className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                      {candidate.verificationStatus === "rejected" && candidate.verificationReason && (
                        <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl p-2.5 mt-2 flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          {candidate.verificationReason}
                        </p>
                      )}
                    </div>
                  </div>

                  {candidate.verificationStatus !== "approved" && (
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={XCircle}
                        loading={actionLoading}
                        onClick={() => { setSelected(candidate); setRejectReason(""); setError(""); setRejectModal(true); }}
                      >
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        icon={CheckCircle}
                        loading={actionLoading}
                        onClick={() => handleApprove(candidate)}
                      >
                        Approve
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={rejectModal} onClose={() => setRejectModal(false)} title="Reject Candidate" size="sm">
        <div className="text-center">
          <div className="inline-flex p-3 rounded-xl bg-red-50 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-lg font-bold font-heading text-slate-900 mb-2">
            Reject {selected?.name}?
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            The candidate will receive this reason and can update their profile to submit again.
          </p>
          <div className="mb-4 text-left">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Reason for rejection</label>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., Please add more detail to your bio and list your skills"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-forge-primary focus:ring-2 focus:ring-forge-primary/20"
            />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={() => setRejectModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              fullWidth
              icon={XCircle}
              loading={actionLoading}
              onClick={handleReject}
            >
              Reject Candidate
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default CandidateVerification;
