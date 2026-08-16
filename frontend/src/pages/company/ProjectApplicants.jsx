import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api/axios";
import { Users, ArrowLeft, ChevronDown, Mail, Briefcase, Award, CheckCircle, Eye, Phone, GraduationCap, ExternalLink, AtSign, GitBranch } from "lucide-react";
import { PageHeader, Card, Badge, StatusBadge, Button, EmptyState, Avatar, Select, Modal } from "../../components/ui";

const experienceLabels = {
  student: "Student",
  fresher: "Fresher",
  professional: "Professional",
  career_switcher: "Career Switcher",
  freelancer: "Freelancer",
  internship_seeker: "Internship Seeker",
};

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
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState(location.state?.success || "");
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

  const [viewingApp, setViewingApp] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState("");

  const viewProfile = async (app) => {
    setViewLoading(true);
    setViewError("");
    setViewingApp(null);
    try {
      const res = await api.get(`/applications/${app._id}`);
      setViewingApp(res.data.application);
    } catch (err) {
      setViewError(err.response?.data?.message || "Could not load this profile");
    } finally {
      setViewLoading(false);
    }
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

      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 flex items-start gap-3 mb-6">
          <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">{successMessage}</div>
          <button
            onClick={() => setSuccessMessage("")}
            className="text-emerald-500 hover:text-emerald-700 text-xs font-medium shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

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
                  <div className="flex flex-col sm:items-end gap-2 shrink-0">
                    <div className="flex items-center gap-3">
                      <Button variant="outline" size="sm" onClick={() => viewProfile(app)}>
                        <Eye className="w-3.5 h-3.5" /> View Profile
                      </Button>
                      <StatusBadge status={app.status} />
                    </div>
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

      <Modal
        isOpen={!!viewingApp || !!viewError}
        onClose={() => { setViewingApp(null); setViewError(""); }}
        title={viewingApp ? "Candidate Profile" : "Profile"}
        size="lg"
      >
        {viewLoading && (
          <div className="flex justify-center py-10">
            <svg className="animate-spin h-8 w-8 text-forge-primary" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}
        {!viewLoading && viewError && (
          <div className="text-center py-8">
            <p className="text-sm text-amber-600 font-medium mb-4">{viewError}</p>
            <Button variant="primary" onClick={() => setViewError("")}>Close</Button>
          </div>
        )}
        {!viewLoading && viewingApp && (
          (() => {
            const c = viewingApp.candidate;
            const expLabel = experienceLabels[c?.experienceLevel] || c?.experienceLevel || "—";
            return (
              <div>
                <div className="flex items-start gap-4">
                  <Avatar src={c?.avatarUrl} name={c?.name} size="lg" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold font-heading text-slate-900">{c?.name}</h3>
                      <StatusBadge status={viewingApp.status} />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-slate-500">
                      {c?.email && (
                        <span className="inline-flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5" /> {c.email}
                        </span>
                      )}
                      {c?.phone && (
                        <span className="inline-flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5" /> {c.phone}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge color="indigo">{expLabel}</Badge>
                      {c?.education && <Badge color="purple"><GraduationCap className="w-3 h-3" /> {c.education}</Badge>}
                      {viewingApp.project?.applicationMode === "direct_hire" && <Badge color="amber">Direct Hire</Badge>}
                    </div>
                  </div>
                </div>

                {c?.bio && (
                  <div className="mt-5">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">About</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{c.bio}</p>
                  </div>
                )}

                {c?.skills?.length > 0 && (
                  <div className="mt-5">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {c.skills.map((s) => (
                        <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {viewingApp.applicationType === "direct_hire" && (
                  <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 space-y-1.5">
                    <p className="font-semibold text-slate-800 text-xs uppercase tracking-wide">Direct application details</p>
                    <p><span className="text-slate-400">Name:</span> {viewingApp.applicantName || c?.name}</p>
                    <p><span className="text-slate-400">Mobile:</span> {viewingApp.mobileNumber || "—"}</p>
                    <p><span className="text-slate-400">Qualification:</span> {viewingApp.qualification || "—"}</p>
                  </div>
                )}

                <div className="mt-5 flex flex-wrap gap-2">
                  {c?.resumeUrl && (
                    <a href={c.resumeUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-forge-primary hover:underline">
                      <ExternalLink className="w-3.5 h-3.5" /> View Resume
                    </a>
                  )}
                  {viewingApp.resumeDriveLink && (
                    <a href={viewingApp.resumeDriveLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-forge-primary hover:underline">
                      <ExternalLink className="w-3.5 h-3.5" /> Resume Drive Link
                    </a>
                  )}
                  {c?.linkedinUrl && (
                    <a href={c.linkedinUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:underline">
                      <AtSign className="w-3.5 h-3.5" /> LinkedIn
                    </a>
                  )}
                  {c?.githubUsername && (
                    <a href={`https://github.com/${c.githubUsername}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:underline">
                      <GitBranch className="w-3.5 h-3.5" /> GitHub
                    </a>
                  )}
                  {c?.portfolioLinks?.map((p, i) => (
                    <a key={i} href={p} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:underline">
                      <ExternalLink className="w-3.5 h-3.5" /> Portfolio {c.portfolioLinks.length > 1 ? `#${i + 1}` : ""}
                    </a>
                  ))}
                </div>
              </div>
            );
          })()
        )}
      </Modal>
    </motion.div>
  );
};

export default ProjectApplicants;
