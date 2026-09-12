import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../api/axios";
import {
  UserPlus,
  Users,
  CheckCircle,
  XCircle,
  Star,
  Trash2,
  Pencil,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { PageHeader, Card, Input, Textarea, Button, Badge, Modal, EmptyState } from "../../components/ui";
import { resolveImageUrl } from "../../utils/imageUrl";

const emptyForm = {
  name: "",
  photo: "",
  evaluates: "",
  experience: "",
  rating: "4.8",
  reviews: "0",
  bio: "",
  tags: "",
  isActive: true,
  sortOrder: "0",
};

const Field = ({ label, children }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-slate-700">{label}</label>
    {children}
  </div>
);

const ManageEvaluators = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/evaluators");
      setMembers(res.data.members || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load evaluator team");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (member) => {
    setEditingId(member._id);
    setError("");
    setForm({
      name: member.name || "",
      photo: member.photo || "",
      evaluates: member.evaluates || "",
      experience: member.experience || "",
      rating: String(member.rating ?? ""),
      reviews: String(member.reviews ?? ""),
      bio: member.bio || "",
      tags: (member.tags || []).join(", "),
      isActive: member.isActive,
      sortOrder: String(member.sortOrder ?? "0"),
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const payload = {
        ...form,
        rating: form.rating === "" ? 4.8 : Number(form.rating),
        reviews: form.reviews === "" ? 0 : Number(form.reviews),
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        sortOrder: form.sortOrder === "" ? 0 : Number(form.sortOrder),
        isActive: Boolean(form.isActive),
      };
      if (editingId) {
        await api.put(`/admin/evaluators/${editingId}`, payload);
        setMessage("Evaluator updated");
      } else {
        await api.post("/admin/evaluators", payload);
        setMessage("Evaluator added");
      }
      setModalOpen(false);
      fetchMembers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save evaluator");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (member) => {
    try {
      await api.put(`/admin/evaluators/${member._id}`, { isActive: !member.isActive });
      setMembers((prev) =>
        prev.map((m) => (m._id === member._id ? { ...m, isActive: !m.isActive } : m))
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  const removeMember = async (member) => {
    if (!window.confirm(`Remove "${member.name}" from the evaluator team?`)) return;
    try {
      await api.delete(`/admin/evaluators/${member._id}`);
      setMembers((prev) => prev.filter((m) => m._id !== member._id));
      setMessage(`Removed ${member.name}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove evaluator");
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader
        title="Evaluators Team"
        description="Manage the evaluators shown to visitors on the Our Evaluators page."
        actions={
          <Button onClick={openAdd} icon={UserPlus}>
            Add Evaluator
          </Button>
        }
      />

      {message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-4 h-4 shrink-0" />
          {message}
          <button onClick={() => setMessage("")} className="ml-auto text-emerald-500 hover:text-emerald-700">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4 flex items-center gap-3">
          <XCircle className="w-4 h-4 shrink-0" />
          {error}
          <button onClick={() => setError("")} className="ml-auto text-red-500 hover:text-red-700">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      <Card padding={false} hover={false}>
        <div className="p-4 sm:p-6 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-slate-400" />
              <h2 className="text-lg font-bold font-heading text-slate-900">Team Members</h2>
              <Badge color="slate">{members.length}</Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={fetchMembers} icon={RefreshCw}>
              Refresh
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading evaluators...</div>
        ) : members.length === 0 ? (
          <div className="p-12">
            <EmptyState
              icon={Users}
              title="No evaluators yet"
              description="Add your first evaluator team member so visitors can see the team."
            />
          </div>
        ) : (
          <div className="grid gap-4 p-4 sm:p-6 sm:grid-cols-2 xl:grid-cols-3">
            {members.map((member) => (
              <div
                key={member._id}
                className="rounded-2xl border border-slate-200 bg-white p-4 hover:shadow-elevated transition-shadow"
              >
                <div className="flex items-start gap-3">
                  {member.photo ? (
                    <img
                      src={resolveImageUrl(member.photo)}
                      alt={member.name}
                      className="h-14 w-14 shrink-0 rounded-2xl object-cover object-center"
                    />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-forge-primary to-forge-secondary text-lg font-bold text-white">
                      {member.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-bold text-slate-900">{member.name}</h3>
                      {!member.isActive && (
                        <Badge color="slate">Hidden</Badge>
                      )}
                    </div>
                    <p className="truncate text-xs font-medium text-forge-primary">{member.evaluates}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span>{member.experience}</span>
                      <span className="inline-flex items-center gap-1 text-amber-600">
                        <Star className="h-3 w-3 fill-current" /> {member.rating}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(member.tags || []).slice(0, 3).map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                      {tag}
                    </span>
                  ))}
                  {(member.tags || []).length > 3 && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                      +{(member.tags || []).length - 3}
                    </span>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3">
                  <button
                    onClick={() => toggleActive(member)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      member.isActive
                        ? "bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200"
                        : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
                    }`}
                  >
                    {member.isActive ? (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        Hide
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        Show
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => openEdit(member)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-all"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => removeMember(member)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Evaluator" : "Add Evaluator"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name *">
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Aarav Sharma" />
            </Field>
            <Field label="Experience *">
              <Input required value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} placeholder="e.g. 9+ years" />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="What they evaluate *">
              <Input required value={form.evaluates} onChange={(e) => setForm({ ...form, evaluates: e.target.value })} placeholder="e.g. Frontend Engineering" />
            </Field>
            <Field label="Photo URL">
              <Input value={form.photo} onChange={(e) => setForm({ ...form, photo: e.target.value })} placeholder="https://.../photo.jpg" />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Rating">
              <Input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} />
            </Field>
            <Field label="Reviews">
              <Input type="number" min="0" value={form.reviews} onChange={(e) => setForm({ ...form, reviews: e.target.value })} />
            </Field>
            <Field label="Sort order">
              <Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
            </Field>
          </div>

          <Field label="Short bio">
            <Textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="One or two lines about the evaluator's background." />
          </Field>

          <Field label="Expertise tags (comma separated)">
            <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="React, Performance, Testing" />
          </Field>

          {form.photo && (
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <img src={resolveImageUrl(form.photo)} alt="Preview" className="h-12 w-12 rounded-xl object-cover object-center" />
              <p className="text-xs text-slate-500">Photo preview. Use a square image or a Google Drive link for best results.</p>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <input
              id="eval-active"
              type="checkbox"
              checked={Boolean(form.isActive)}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 text-forge-primary focus:ring-forge-primary"
            />
            <label htmlFor="eval-active" className="text-sm font-medium text-slate-700">
              Visible on public page
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving} icon={editingId ? Pencil : UserPlus}>
              {editingId ? "Save Changes" : "Add Evaluator"}
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default ManageEvaluators;