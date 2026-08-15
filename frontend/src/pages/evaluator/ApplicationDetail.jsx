import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api/axios";
import {
  PageHeader, Card, Badge, StatusBadge, Button, Avatar,
} from "../../components/ui";

const ApplicationDetail = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!applicationId) return;
    api.get(`/api/applications/${applicationId}`).then((res) => {
      setApplication(res.data.application);
    }).catch((err) => {
      setError(err.response?.data?.message || "Failed to load application");
      setLoading(false);
    });
  }, [applicationId]);

  useEffect(() => {
    if (!application) return;
    api.get(`/api/interviews/application/${applicationId}`).then(() => {}).catch(() => {});
    api.get(`/api/submissions/my`).then(() => {}).catch(() => {});
  }, [application]);

  if (loading && !application) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-3xl mx-auto px-4 py-12"
      >
        <div className="space-y-4">
          <div className="h-8 w-64 shimmer rounded-lg" />
          <div className="h-4 w-96 shimmer rounded-lg" />
          <div className="h-32 w-full shimmer rounded-xl" />
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-3xl mx-auto px-4 py-12"
      >
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-6">
          <ExternalLink className="w-4 h-4 me-2" />
          {error}
        </div>
      </motion.div>
    );
  }

  if (!application) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-3xl mx-auto px-4 py-12"
      >
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-600">Application Not Found</h2>
          <p className="text-slate-500">The application you requested could not be found.</p>
          <Button to="/evaluator/dashboard" size="sm">
            Back to Dashboard
          </Button>
        </div>
      </motion.div>
    );
  }

  const app = application;
  const applicationTypeBadge = app.applicationMode === "direct_hire" ? (
    <Badge color="blue" dot>Normal Job</Badge>
  ) : (
    <Badge color="purple" dot>Project Based Job</Badge>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      <Link
        to="/evaluator/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Badge color="forge" dot>{app.project?.domain}</Badge>
        {app.applicationMode === "direct_hire" && <Badge color="blue" dot>Normal Job</Badge>}
        {app.applicationMode !== "direct_hire" && <Badge color="purple" dot>Project Based Job</Badge>}
        <StatusBadge status={app.status} />
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 mb-4">
        {app.project?.title}
      </h1>

      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mb-8">
        <div className="flex items-center gap-1.5">
          <Building2 className="w-4 h-4" />
          {app.project?.company?.companyName || app.project?.company?.name || "Company"}
        </div>
        <div className="flex items-center gap-1.5">
          <Briefcase className="w-4 h-4" />
          {app.candidate?.name || "Candidate"}
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : "—"}
        </div>
      </div>

      <Card padding={false} hover={false}>
        <div className="p-6">
          <h2 className="text-base font-bold font-heading text-slate-900 mb-4">Candidate Profile</h2>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="lg:col-span-2">
              <Avatar name={app.candidate?.name} size="lg" className="mb-4" />
              <p className="text-sm text-slate-500">{app.candidate?.bio || "No bio provided"}</p>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {app.candidate?.skills?.map((s) => (
                      <span
                        key={s}
                        className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Experience Level</p>
                  {
                    app.candidate?.experienceLevel && (
                      <Badge
                        color="professional"
                        dot
                      >
                        {app.candidate.experienceLevel.replace(/_/g, " ")}
                      </Badge>
                    )
                  }
                </div>
              </div>

              {app.candidate?.resumeUrl && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Resume/CV</p>
                  <a
                    href={app.candidate.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex text-forge-primary hover:underline text-sm"
                  >
                    View Resume Link
                  </a>
                </div>
              )}

              {app.candidate?.portfolioLinks?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Portfolio Links</p>
                  <div className="flex flex-wrap gap-1">
                    {app.candidate.portfolioLinks.map((link, i) => (
                      <a
                        key={i}
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-forge-primary hover:underline"
                      >
                        {link}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {app.candidate?.githubUsername && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">GitHub</p>
                  <a
                    href={`https://github.com/${app.candidate.githubUsername}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex text-forge-primary hover:underline text-sm"
                  >
                    {app.candidate.githubUsername}
                  </a>
                </div>
              )}

              {app.candidate?.linkedinUrl && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">LinkedIn</p>
                  <a
                    href={app.candidate.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex text-forge-primary hover:underline text-sm"
                  >
                    View LinkedIn Profile
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card padding={false} hover={false}>
        <div className="p-6">
          <h2 className="text-base font-bold font-heading text-slate-900 mb-4">Application Details</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Application Type</p>
              <span className="text-sm font-medium">
                {app.applicationMode === "direct_hire" ? "Normal Job (Direct Hire)" : "Project Based Job"}
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Applied Date</p>
              <p className="text-sm font-medium">{app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : "—"}</p>
            </div>
          </div>

          {app.status && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Current Status</p>
              <StatusBadge status={app.status} />
            </div>
          )}

          {app.submittedAt && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Submission Date</p>
              <p className="text-sm font-medium">{new Date(app.submittedAt).toLocaleDateString()}</p>
            </div>
          )}

          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Recommendation</p>
          {app.evaluation ? (
            <>
              <Badge color="green" className="me-2">
                {app.evaluation.recommendation}
              </Badge>
              <p className="text-xs text-slate-500">{app.evaluation.feedback || "No feedback"}</p>
              <p className="text-xs text-slate-400">Score: {app.evaluation.overallScore !== undefined ? app.evaluation.overallScore : "—"} / 10</p>
            </>
          ) : (
            <p className="text-xs text-slate-500">No evaluation yet</p>
          )}
        </div>
      </Card>

      <Card padding={false} hover={false}>
        <div className="p-6">
          <h2 className="text-base font-bold font-heading text-slate-900 mb-4">Interviews</h2>

          {app.interviews && app.interviews.length > 0 ? (
            <div>
              {app.interviews.map((interview, i) => {
                const modeBadge = interview.mode === "online" ? (
                  <Badge color="blue" className="me-1">
                    Online
                  </Badge>
                ) : (
                  <Badge color="purple" className="me-1">
                    Offline
                  </Badge>
                );
                const statusBadge = interview.status === "completed" ? (
                  <Badge color="green" className="me-1">Completed</Badge>
                ) : (
                  <Badge color="purple" className="me-1">{interview.status}</Badge>
                );
                return (
                  <div key={interview._id} className="p-3 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                      <span>{interview.interviewType || "Interview"}</span>
                      {interview.mode && modeBadge}
                      {statusBadge}
                      <span className="ml-auto">
                        {interview.date ? new Date(interview.date).toLocaleDateString() : "—"}
                      </span>
                      <span>{interview.startTime} – {interview.endTime}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p>No interviews scheduled for this application.</p>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default ApplicationDetail;