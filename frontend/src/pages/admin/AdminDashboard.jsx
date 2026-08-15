import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";
import {
  PageHeader, StatCard, Card, Badge, Button,
  EmptyState, Input,
} from "../../components/ui";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashRes = await api.get("/dashboard/admin");
        setStats(dashRes.data.stats);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <></>;
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
    >
      <PageHeader
        title="Admin Dashboard"
        description="Platform-wide management and monitoring."
      />

      <motion.div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Users" value={stats?.totalUsers || 0} icon="users" color="forge" />
          <StatCard label="Total Candidates" value={stats?.totalCandidates || 0} icon="users" color="blue" />
          <StatCard label="Total Companies" value={stats?.totalCompanies || 0} icon="building" color="purple" />
          <StatCard label="Total Hires" value={stats?.totalHires || 0} icon="check-circle" color="green" />
        </div>
      </motion.div>

      <motion.div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard label="Pending Reviews" value={stats?.pendingReviews || 0} icon="clock" color="orange" />
          <StatCard label="Total Applications" value={stats?.totalApplications || 0} icon="file-text" color="forge" />
          <StatCard label="Total Projects/Jobs" value={stats?.totalProjects || 0} icon="briefcase" color="forge" />
          <StatCard label="Active Projects" value={stats?.totalActiveProjects || 0} icon="file-text" color="slate" />
        </div>
      </motion.div>

      <motion.div>
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 mb-8">
          <StatCard label="Deleted Jobs" value={stats?.totalDeletedJobs || 0} icon="trash" color="red" />
          <StatCard label="Deleted Projects" value={stats?.totalDeletedProjects || 0} icon="archive" color="red" />
          <StatCard label="Active Jobs" value={stats?.totalActiveJobs || 0} icon="briefcase" color="green" />
          <StatCard label="Active Projects" value={stats?.totalActiveProjects || 0} icon="file-text" color="slate" />
        </div>
      </motion.div>

      <motion.div>
        <div className="mt-8">
          <p className="text-sm text-slate-500">
            Hiring pipeline monitoring and platform management.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdminDashboard;