import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api/axios";
import {
  PageHeader, Card, Badge, StatusBadge, Button, Avatar,
} from "../../components/ui";
import {
  ArrowLeft, Building2, Briefcase, Clock, ExternalLink, Send, ThumbsDown,
} from "lucide-react";
import JourneyTimeline from "../../components/JourneyTimeline";

const REVIEW_STAGES = ["applied", "in_progress", "submitted", "under_review"];

const experienceColors = {
  student: "blue",
  fresher: "green",
  professional: "purple",
  career_switcher: "orange",
  freelancer: "amber",
  internship_seeker: "cyan",
};

const ApplicationDetail = () => {
  const { applicationId } = useParams();
  const [application, setApplication] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const loadApplication = () => {
    if (!applicationId) return;
    api.get(`/applications/${applicationId}`).then((res) => {
      setApplication(res.data.application);
      setEvaluation(res.data.evaluation || null);
      setInterviews(res.data.interviews || []);
      setSubmissions(res.data.submissions || []);
      setLoading(false);
    }).catch((err) => {
      setError(err.response?.data?.message || "Failed to load application");
      setLoading(false);
    });
  };

  useEffect(() => {
    loadApplication();
  }, [applicationId]);

  const forwardToCompany = async () => {
    if (!window.confirm("Forward this candidate's profile to the company? The company will immediately gain access to this candidate for review.")) return;
    setBusy(true);
    try {
      await api.post(`/applications/${applicationId}/shortlist`);
      loadApplication();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to forward candidate");
    } finally {
      setBusy(false);
    }
  };

  const rejectApplication = async () => {
    if (!window.confirm("Reject this application? The candidate will be marked as rejected and will not be forwarded to the company.")) return;
    setBusy(true);
    try {
      await api.post(`/applications/${applicationId}/reject`);
      loadApplication();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject application");
    } finally {
      setBusy(false);
    }
  };

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
  const isDirectHire = app.project?.applicationMode === "direct_hire";

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
        <Badge color="forge" dot>{app.project?.domain || "Project"}</Badge>
        {isDirectHire ? (
          <Badge color="blue" dot>Direct Job</Badge>
        ) : (
          <Badge color="purple" dot>Project Based Job</Badge>
        )}
        <StatusBadge status={app.status} />
      </div>

      {!isDirectHire && REVIEW_STAGES.includes(app.status) && (
        <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 mb-8">
          <p className="text-sm text-amber-800 flex-1 min-w-[200px]">
            This profile is in the evaluation queue. Forward it to the company when the candidate is suitable.
          </p>
          <Button size="sm" icon={Send} loading={busy} onClick={forwardToCompany}>
            Forward to Company
          </Button>
          <Button size="sm" variant="ghost" icon={ThumbsDown} disabled={busy} onClick={rejectApplication}>
            Reject
          </Button>
        </div>
      )}

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
          {app.candidate?.name || app.applicantName || "Candidate"}
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "—"}
        </div>
      </div>

      <Card padding={false} hover={false}>
        <div className="p-6">
          <h2 className="text-base font-bold font-heading text-slate-900 mb-4">Candidate Profile</h2>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="lg:col-span-2">
              <Avatar name={app.candidate?.name || app.applicantName} size="lg" className="mb-4" />
              <p className="text-sm text-slate-500">{app.candidate?.bio || "No bio provided"}</p>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {(app.candidate?.skills || []).map((s) => (
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
                  {app.candidate?.experienceLevel && (
                    <Badge color={experienceColors[app.candidate.experienceLevel] || "slate"} dot>
                      {app.candidate.experienceLevel.replace(/_/g, " ")}
                    </Badge>
                  )}
                </div>
              </div>

              {isDirectHire && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Mobile</p>
                    <p className="text-sm text-slate-700">{app.mobileNumber || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Qualification</p>
                    <p className="text-sm text-slate-700">{app.qualification || "—"}</p>
                  </div>
                </div>
              )}

              {app.resumeDriveLink && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Resume</p>
                  <a
                    href={app.resumeDriveLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex text-forge-primary hover:underline text-sm"
                  >
                    View Resume Link
                  </a>
                </div>
              )}

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
                {isDirectHire ? "Direct Job" : "Project Based Job"}
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Applied Date</p>
              <p className="text-sm font-medium">{app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "—"}</p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Current Status</p>
            <StatusBadge status={app.status} />
          </div>

          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Recommendation</p>
            {evaluation ? (
              <>
                <Badge color={evaluation.recommendation === "shortlist" ? "green" : evaluation.recommendation === "reject" ? "red" : "orange"} className="me-2">
                  {evaluation.recommendation}
                </Badge>
                <p className="text-xs text-slate-500 mt-1">{evaluation.feedback || "No feedback"}</p>
                <p className="text-xs text-slate-400 mt-1">
                  Score: {evaluation.overallScore !== undefined && evaluation.overallScore !== null ? evaluation.overallScore : "—"} / 10
                </p>
              </>
            ) : (
              <p className="text-xs text-slate-500">No evaluation yet</p>
            )}
          </div>
        </div>
      </Card>

      <Card padding={false} hover={false}>
        <div className="p-6">
          <h2 className="text-base font-bold font-heading text-slate-900 mb-4">Submitted Work</h2>
          {submissions.length > 0 ? (
            <div className="space-y-3">
              {submissions.map((sub) => (
                <div key={sub._id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {sub.linkedRepoName || (sub.repoUrl ? sub.repoUrl.split("/").pop() : "Submission")}
                    </p>
                    <p className="text-xs text-slate-400">
                      Submitted {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : "—"}
                      {" · "}
                      {sub.status === "reviewed" ? "Reviewed" : "Pending review"}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    to={`/evaluator/submissions/${sub._id}/evaluate`}
                    icon={ExternalLink}
                  >
                    {sub.status === "reviewed" ? "View Evaluation" : "Evaluate Work"}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">The candidate has not submitted work for this application yet.</p>
          )}
        </div>
      </Card>

      <Card padding={false} hover={false}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold font-heading text-slate-900">Interviews</h2>
            <Link
              to={`/evaluator/interview/form/${applicationId}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-forge-primary hover:underline"
            >
              Schedule Interview <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {interviews.length > 0 ? (
            <div>
              {interviews.map((interview) => (
                <div key={interview._id} className="p-3 border-b border-slate-200 last:border-b-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm font-medium text-slate-900">{interview.interviewType || "Interview"}</span>
                    <Badge color={interview.mode === "online" ? "blue" : "purple"}>{interview.mode || "—"}</Badge>
                    {interview.status === "completed" ? (
                      <Badge color="green">Completed</Badge>
                    ) : (
                      <Badge color="amber">{interview.status || "scheduled"}</Badge>
                    )}
                    <span className="ml-auto text-xs text-slate-500">
                      {interview.date ? new Date(interview.date).toLocaleDateString() : "—"}
                      {interview.startTime ? ` · ${interview.startTime}` : ""}
                      {interview.endTime ? ` – ${interview.endTime}` : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No interviews scheduled for this application.</p>
          )}
        </div>
      </Card>

      <Card padding={false} hover={false}>
        <div className="p-6">
          <h2 className="text-base font-bold font-heading text-slate-900 mb-4">Candidate Journey</h2>
          <JourneyTimeline history={app.statusHistory || []} highlight={app.status} />
        </div>
      </Card>
    </motion.div>
  );
};

export default ApplicationDetail;