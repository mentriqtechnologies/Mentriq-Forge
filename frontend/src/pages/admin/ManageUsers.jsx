import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../api/axios";
import { Shield, UserPlus, Users, CheckCircle, XCircle, Mail, User, Trash2, Briefcase } from "lucide-react";
import { PageHeader, Card, Input, Select, Button, Badge, Avatar, DataTable } from "../../components/ui";

const roleColorMap = {
  candidate: "blue",
  company: "purple",
  evaluator: "orange",
  admin: "green",
};

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [roleFilter, setRoleFilter] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "evaluator" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    const params = roleFilter ? { role: roleFilter } : {};
    const res = await api.get("/admin/users", { params });
    setUsers(res.data.users);
    setTotalUsers(res.data.total);
  };

  const fetchProjects = async () => {
    const res = await api.get("/projects", { params: { status: "all", limit: 50 } });
    setProjects(res.data.projects || []);
  };

  useEffect(() => {
    fetchUsers();
    fetchProjects();
  }, [roleFilter]);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await api.post("/admin/users", form);
      setMessage(`${form.role} account created for ${form.email}`);
      setForm({ name: "", email: "", password: "", role: "evaluator" });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (user) => {
    await api.put(`/admin/users/${user._id}/status`, { isActive: !user.isActive });
    fetchUsers();
  };

  const deleteUser = async (user) => {
    if (!window.confirm(`Delete ${user.name}?`)) return;
    await api.delete(`/admin/users/${user._id}`);
    fetchUsers();
  };

  const columns = [
    {
      key: "name",
      label: "User",
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} size="sm" />
          <div>
            <p className="text-sm font-medium text-slate-900">{row.name}</p>
            <p className="text-xs text-slate-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (val) => <Badge color={roleColorMap[val] || "slate"} dot>{val}</Badge>,
    },
    {
      key: "companyName",
      label: "Company",
      render: (val) => val ? <span className="text-sm text-slate-600">{val}</span> : <span className="text-sm text-slate-300">—</span>,
    },
    {
      key: "isActive",
      label: "Status",
      render: (val) => (
        <Badge color={val ? "green" : "slate"} dot>
          {val ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "_id",
      label: "Actions",
      render: (val, row) => (
        <div className="flex items-center gap-2">
          <Button
            variant={row.isActive ? "danger" : "outline"}
            size="sm"
            onClick={() => toggleStatus(row)}
          >
            {row.isActive ? "Deactivate" : "Activate"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => deleteUser(row)} icon={Trash2}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        title="Manage Users"
        description="Add evaluators or admins and manage team access in one place."
      />

      <Card padding={false} hover={false} className="mb-8">
        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-2">
            <UserPlus className="w-5 h-5 text-forge-primary" />
            <h2 className="text-base font-bold font-heading text-slate-900">Add Team Member</h2>
          </div>
          <p className="text-sm text-slate-500 mb-6">Create temporary access for staff members and keep the team organized.</p>

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

          <form onSubmit={handleCreateStaff} className="grid sm:grid-cols-2 gap-4">
            <Input placeholder="Full name" icon={User} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="Email" type="email" icon={Mail} required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input placeholder="Temporary password" type="password" icon={Shield} required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <Select options={[
              { value: "evaluator", label: "Evaluator" },
              { value: "admin", label: "Admin" },
            ]} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Select role" />
            <div className="sm:col-span-2">
              <Button type="submit" fullWidth loading={loading} icon={UserPlus}>
                Create Account
              </Button>
            </div>
          </form>
        </div>
      </Card>

      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-slate-400" />
          <h2 className="text-lg font-bold font-heading text-slate-900">All Users</h2>
          <Badge color="slate">{totalUsers}</Badge>
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-forge-primary focus:ring-2 focus:ring-forge-primary/20"
        >
          <option value="">All Roles</option>
          <option value="candidate">Candidates</option>
          <option value="company">Companies</option>
          <option value="evaluator">Evaluators</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      <DataTable columns={columns} data={users} />

      <Card padding={false} hover={false} className="mt-8">
        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-5">
            <Briefcase className="w-5 h-5 text-forge-primary" />
            <h2 className="text-lg font-bold font-heading text-slate-900">Listings Posted by Companies</h2>
          </div>
          <div className="space-y-3">
            {projects.length === 0 ? (
              <p className="text-sm text-slate-500">No projects have been posted yet.</p>
            ) : (
              projects.map((project) => (
                <div key={project._id} className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{project.title}</p>
                    <p className="text-xs text-slate-500">{project.company?.companyName || project.company?.name || "Company"} • {project.type || "simulated"} • {project.domain}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge color={project.status === "open" ? "green" : "slate"}>{project.status === "open" ? "Open" : "Closed"}</Badge>
                    <Badge color="forge">{project.jobRole || "Role"}</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default ManageUsers;
