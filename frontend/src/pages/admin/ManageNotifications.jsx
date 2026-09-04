import React, { useEffect, useState } from "react";
import { useNotifications } from "../../context/NotificationContext";
import { PageHeader, Card, Input, Textarea, Button, Badge, EmptyState, Modal } from "../../components/ui";
import { Send, Trash2, Megaphone, Users } from "lucide-react";
import api from "../../api/axios";

const TYPE_OPTIONS = [
  { value: "announcement", label: "Announcement" },
  { value: "info", label: "Info" },
  { value: "reminder", label: "Reminder" },
];

const ROLE_OPTIONS = [
  { value: "candidate", label: "Candidates" },
  { value: "company", label: "Companies" },
  { value: "evaluator", label: "Evaluators" },
  { value: "admin", label: "Admins" },
];

const AUDIENCE_OPTIONS = [
  { value: "all", label: "Everyone (all roles)" },
  { value: "roles", label: "Specific roles" },
];

const formatDate = (d) =>
  new Date(d).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const ManageNotifications = () => {
  const { createNotification } = useNotifications();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("announcement");
  const [audience, setAudience] = useState("all");
  const [roles, setRoles] = useState([]);

  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchSent = async () => {
    const res = await api.get("/notifications");
    setSent(res.data.notifications || []);
  };

  useEffect(() => {
    fetchSent().finally(() => setLoading(false));
  }, []);

  const toggleRole = (role) =>
    setRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]));

  const resetForm = () => {
    setTitle("");
    setMessage("");
    setType("announcement");
    setAudience("all");
    setRoles([]);
  };

  const handleSend = async () => {
    setError("");
    setSuccess("");
    if (!title.trim() || !message.trim()) {
      setError("Title and message are required");
      return;
    }
    setSending(true);
    try {
      const res = await createNotification({
        title,
        message,
        type,
        targetAudience: audience,
        targetRoles: audience === "roles" ? roles : undefined,
      });
      setSuccess(
        `Notification sent to ${res.data.recipientsCount || 0} user${res.data.recipientsCount === 1 ? "" : "s"}.`
      );
      resetForm();
      fetchSent();
    } catch (err) {
      setError(err.response?.data?.message || "Could not send notification");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setSent((prev) => prev.filter((n) => n._id !== id));
      setConfirmDelete(null);
    } catch {
      setConfirmDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        subtitle="Send announcements to users. Each notification appears as a popup and in their inbox."
      />

      <Card>
        <h3 className="text-base font-bold font-heading text-slate-900 mb-4 flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-forge-primary" /> Compose Notification
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Title"
            placeholder="e.g. New platform update"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <div>
            <span className="block text-sm font-medium text-slate-700 mb-1.5">Type</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-forge-primary focus:ring-2 focus:ring-forge-primary/20"
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <Textarea
            label="Message"
            placeholder="Write your announcement message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            required
          />
        </div>

        <div className="mt-4">
          <span className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" /> Send to
          </span>
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            className="w-full md:w-96 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-forge-primary focus:ring-2 focus:ring-forge-primary/20"
          >
            {AUDIENCE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {audience === "roles" && (
          <div className="mt-3 flex flex-wrap gap-2">
            {ROLE_OPTIONS.map((r) => {
              const active = roles.includes(r.value);
              return (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => toggleRole(r.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    active
                      ? "bg-forge-primary text-white border-forge-primary"
                      : "bg-white text-slate-600 border-slate-200 hover:border-forge-primary"
                  }`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        )}

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        {success && <p className="mt-3 text-sm text-green-600">{success}</p>}

        <div className="mt-5">
          <Button
            icon={Send}
            loading={sending}
            disabled={!title.trim() || !message.trim()}
            onClick={handleSend}
          >
            Send Notification
          </Button>
        </div>
      </Card>

      <Card>
        <h3 className="text-base font-bold font-heading text-slate-900 mb-4">
          Sent Notifications ({sent.length})
        </h3>
        {sent.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="Nothing sent yet"
            description="Notifications you send will be listed here."
          />
        ) : (
          <div className="space-y-3">
            {sent.map((n) => (
              <div
                key={n._id}
                className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 p-4"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-slate-900">{n.title}</p>
                    <Badge color={n.type === "announcement" ? "purple" : n.type === "reminder" ? "amber" : "blue"}>
                      {n.type}
                    </Badge>
                    <Badge>
                      {n.targetAudience === "all"
                        ? "Everyone"
                        : n.targetAudience === "roles"
                        ? `Roles: ${(n.targetRoles || []).join(", ")}`
                        : `${n.recipientsCount} users`}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mt-1 whitespace-pre-line">{n.message}</p>
                  <p className="text-xs text-slate-400 mt-2">
                    {n.createdByName} · {formatDate(n.createdAt)}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Delivered: {n.recipientsCount} · Read: {n.readCount}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(n)}
                  className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                  aria-label="Delete notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete notification?"
      >
        <p className="text-sm text-slate-600">
          This will remove the notification for everyone. This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button variant="danger" icon={Trash2} onClick={() => handleDelete(confirmDelete._id)}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ManageNotifications;