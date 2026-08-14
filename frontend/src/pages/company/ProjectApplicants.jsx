import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api/axios";
import { Users, ArrowLeft, ChevronDown, Mail, Briefcase, Award } from "lucide-react";
import { PageHeader, Card, Badge, StatusBadge, Button, EmptyState, Avatar, Select } from "../../components/ui";

const statusOptions = [
  { value: "applied", label: "Applied" },
  { value: "in_progress", label: "In Progress" },
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under Review" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "rejected", label: "Rejected" },
  { value: "interview_scheduled", label: "Interview Scheduled" },
  { value: "hired", label: "Hired" },
];

// For project-based hiring the MentriQ team forwards profiles to the company at
// the shortlist stage. Companies only manage the forward-stage pipeline there;
// on direct jobs they manage the entire pipeline from application onwards.
const companyStageOptions = [
  { value: "shortlisted", label: "Shortlisted" },
  { value: "rejected", label: "Rejected" },
  { value: "interview_scheduled", label: "Interview Scheduled" },
  { value: "hired", label: "Hired" },
];

const ProjectApplicants = () => {
  const { projectId } = useParams();
  const [applications, setApplications] = useState([]);

  const fetchApplications = async () => {
    const res = await api.get(`/applications/project/${projectId}`);
    setApplications(res.data.applications);
  };

  useEffect(() => {
    fetchApplications();
  }, [projectId]);

  const updateStatus = async (id, status) => {
    await api.put(`/applications/${id}/status`, { status });
    fetchApplications();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center gap-4 mb-2">
        <Link to="/company/dashboard" className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <PageHeader
          title="Candidate Pipeline"
          description="Review applicants and move them through the hiring flow."
        />
      </div>

      <div className="space-y-3">
        {applications.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No applicants yet"
            description="No applicants yet for this project. Share the project link with potential candidates."
          />
        ) : (
          applications.map((app, i) => (
            <motion.div
              key={app._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card padding={false} hover={false}>
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <Avatar name={app.candidate?.name} size="md" />
                    <div>
                      <h3 className="text-sm font-bold font-heading text-slate-900">{app.candidate?.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs text-slate-400">{app.candidate?.email}</span>
                      </div>
                      {app.candidate?.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {app.candidate.skills.slice(0, 5).map((s) => (
                            <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                      {app.applicationType === "direct_hire" && (
                        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 space-y-1">
                          <p className="font-semibold text-slate-800">Direct application details</p>
                          <p><span className="text-slate-400">Name:</span> {app.applicantName || app.candidate?.name}</p>
                          <p><span className="text-slate-400">Mobile:</span> {app.mobileNumber || "—"}</p>
                          <p><span className="text-slate-400">Qualification:</span> {app.qualification || "—"}</p>
                          {app.resumeDriveLink && (
                            <a href={app.resumeDriveLink} target="_blank" rel="noreferrer" className="inline-flex text-forge-primary hover:underline">
                              View resume link
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge status={app.status} />
                    <select
                      value={app.status}
                      onChange={(e) => updateStatus(app._id, e.target.value)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-forge-primary focus:ring-2 focus:ring-forge-primary/20"
                    >
                      {(app.applicationType === "direct_hire" ? statusOptions : companyStageOptions).map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default ProjectApplicants;
