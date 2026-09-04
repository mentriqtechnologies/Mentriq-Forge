import React, { useEffect, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import api from "../../api/axios";
import {
  Shield,
  UserPlus,
  Users,
  CheckCircle,
  XCircle,
  Mail,
  User,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { PageHeader, Card, Input, Select, Button, Badge, Avatar, EmptyState } from "../../components/ui";

const ROWS_PER_PAGE = 15;

const roleColorMap = {
  candidate: "blue",
  company: "purple",
  evaluator: "orange",
  admin: "green",
};

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "evaluator" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");

  const fetchUsers = useCallback(async () => {
    setFetchLoading(true);
    try {
      const params = { limit: 500 };
      if (roleFilter) params.role = roleFilter;
      if (searchQuery) params.search = searchQuery;
      const res = await api.get("/admin/users", { params });
      setUsers(res.data.users || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setFetchLoading(false);
    }
  }, [roleFilter, searchQuery]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, roleFilter]);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await api.post("/admin/users", form);
      setMessage(`${form.role.charAt(0).toUpperCase() + form.role.slice(1)} account created for ${form.email}`);
      setForm({ name: "", email: "", password: "", role: "evaluator" });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (user) => {
    try {
      await api.put(`/admin/users/${user._id}/status`, { isActive: !user.isActive });
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, isActive: !u.isActive } : u))
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  const deleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${user.name}" (${user.email})? This action cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${user._id}`);
      setUsers((prev) => prev.filter((u) => u._id !== user._id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user");
    }
  };

  const sortedUsers = useMemo(() => {
    const sorted = [...users];
    sorted.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (sortField === "name" || sortField === "email" || sortField === "companyName") {
        aVal = (aVal || "").toString().toLowerCase();
        bVal = (bVal || "").toString().toLowerCase();
      }
      if (sortField === "isActive") {
        aVal = aVal ? 1 : 0;
        bVal = bVal ? 1 : 0;
      }
      if (sortField === "createdAt") {
        aVal = new Date(aVal || 0).getTime();
        bVal = new Date(bVal || 0).getTime();
      }
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [users, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / ROWS_PER_PAGE));
  const paginatedUsers = sortedUsers.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  const handleSort = (key) => {
    if (sortField === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(key);
      setSortDirection("asc");
    }
    setPage(1);
  };

  const SortHeader = ({ label, field, className = "" }) => {
    const isActive = sortField === field;
    return (
      <th
        className={`px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider select-none cursor-pointer hover:text-slate-700 transition-colors ${className}`}
        onClick={() => handleSort(field)}
      >
        <span className="inline-flex items-center gap-1">
          {label}
          {isActive && (
            <span className="text-forge-primary">
              {sortDirection === "asc" ? "\u2191" : "\u2193"}
            </span>
          )}
        </span>
      </th>
    );
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader
        title="Manage Users"
        description="View, search, and manage all platform users in one place."
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
        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-2">
            <UserPlus className="w-5 h-5 text-forge-primary" />
            <h2 className="text-base font-bold font-heading text-slate-900">Add Team Member</h2>
          </div>
          <p className="text-sm text-slate-500 mb-6">Create evaluator or admin accounts for your team.</p>

          <form onSubmit={handleCreateStaff} className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <Input
              placeholder="Full name"
              icon={User}
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              placeholder="Email"
              type="email"
              icon={Mail}
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              placeholder="Password"
              type="password"
              icon={Shield}
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <Select
              options={[
                { value: "evaluator", label: "Evaluator" },
                { value: "admin", label: "Admin" },
              ]}
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              placeholder="Select role"
            />
            <Button type="submit" fullWidth loading={loading} icon={UserPlus}>
              Create
            </Button>
          </form>
        </div>
      </Card>

      <Card padding={false} hover={false}>
        <div className="p-4 sm:p-6 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-slate-400" />
              <h2 className="text-lg font-bold font-heading text-slate-900">
                {roleFilter
                  ? `${roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1)}s`
                  : "All Users"}
              </h2>
              <Badge color="slate">{sortedUsers.length}</Badge>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 w-full sm:w-64 focus:outline-none focus:border-forge-primary focus:ring-2 focus:ring-forge-primary/20 transition-all"
                />
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
              <Button variant="ghost" size="sm" onClick={fetchUsers} icon={RefreshCw}>
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {fetchLoading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading users...</div>
        ) : paginatedUsers.length === 0 ? (
          <div className="p-12">
            <EmptyState
              icon={Users}
              title="No users found"
              description={searchQuery || roleFilter ? "Try adjusting your search or filter." : "No users have been registered yet."}
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ minWidth: "1100px" }}>
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <SortHeader label="#" field="createdAt" className="w-16" />
                    <SortHeader label="Name" field="name" />
                    <SortHeader label="Email" field="email" />
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Phone</th>
                    <SortHeader label="Role" field="role" />
                    <SortHeader label="Company" field="companyName" />
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Industry</th>
                    <SortHeader label="Status" field="isActive" />
                    <SortHeader label="Verified" field="isVerified" />
                    <SortHeader label="Joined" field="createdAt" />
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedUsers.map((user, idx) => (
                    <tr
                      key={user._id}
                      className="bg-white hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-xs text-slate-400 font-mono">
                        {(page - 1) * ROWS_PER_PAGE + idx + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={user.name} size="sm" />
                          <span className="font-medium text-slate-900 text-sm">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{user.email}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">{user.phone || "\u2014"}</td>
                      <td className="px-4 py-3">
                        <Badge color={roleColorMap[user.role] || "slate"} dot>{user.role}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 max-w-[180px] truncate">
                        {user.companyName || "\u2014"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500 max-w-[140px] truncate">
                        {user.industry || "\u2014"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge color={user.isActive ? "green" : "slate"} dot>
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge color={user.isVerified ? "green" : "amber"}>
                          {user.isVerified ? "Yes" : "No"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "\u2014"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => toggleStatus(user)}
                            title={user.isActive ? "Deactivate" : "Activate"}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              user.isActive
                                ? "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                            }`}
                          >
                            {user.isActive ? (
                              <>
                                <ToggleRight className="w-3.5 h-3.5" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <ToggleLeft className="w-3.5 h-3.5" />
                                Activate
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => deleteUser(user)}
                            title="Delete user"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50/50">
              <p className="text-sm text-slate-500">
                Showing <span className="font-medium text-slate-700">{(page - 1) * ROWS_PER_PAGE + 1}</span>
                {" "}-{" "}
                <span className="font-medium text-slate-700">{Math.min(page * ROWS_PER_PAGE, sortedUsers.length)}</span>
                {" "}of{" "}
                <span className="font-medium text-slate-700">{sortedUsers.length}</span> users
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce((acc, p, i, arr) => {
                    if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "..." ? (
                      <span key={`ellipsis-${i}`} className="px-2 text-slate-400 text-sm">
                        ...
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition-all ${
                          page === p
                            ? "bg-forge-primary text-white shadow-sm"
                            : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </Card>
    </motion.div>
  );
};

export default ManageUsers;
