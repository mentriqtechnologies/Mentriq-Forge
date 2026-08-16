import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../../api/axios";
import {
  PageHeader, Card, Badge, StatusBadge, Button, Select, Input, EmptyState,
} from "../../components/ui";
import { FileText, Users, Search, CheckCircle, Clock, ExternalLink, CalendarDays, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import JourneyTimeline from "../../components/JourneyTimeline";

const experienceColors = {
  student: "blue",
  fresher: "green",
  professional: "purple",
  career_switcher: "orange",
  freelancer: "amber",
  internship_seeker: "cyan",
};

const CompanyCandidateReview = () => {
  const { applicationId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewStatus, setReviewStatus] = useState("");
  const [showInterviewForm, setShowInterviewForm] = useState(false);
  const [interviewMode, setInterviewMode] = useState("online");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [interviewFormValues, setInterviewFormValues] = useState({
    mode: "online",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    meetingUrl: "",
    interviewType: "",
    instructions: "",
  });

  useEffect(() => {
    fetchApplication();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchApplication = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/applications/company/${applicationId}`);
      setApplication(res.data.application);
      setReviewStatus(res.data.application?.status || "");
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const today = new Date().toLocaleDateString();

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto px-4 py-12"
      >
        <div className="space-y-4">
          <div className="h-8 w-64 shimmer rounded-lg" />
          <div className="h-4 w-96 shimmer rounded-lg" />
          <div className="h-32 w-full shimmer rounded-xl" />
        </div>
      </motion.div>
    );
  }

  if (!application) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto px-4 py-12"
      >
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-600">Application Not Found</h2>
          <p className="text-slate-500">The application you requested could not be found.</p>
          <Button to="/company/dashboard" size="sm">
            Back to Dashboard
          </Button>
        </div>
      </motion.div>
    );
  }

  const app = application.application;
  const ev = application.evaluation;
  const evaluation = ev;

  const applicationTypeBadge = app.project?.applicationMode === "direct_hire" ? (
    <Badge color="blue" dot>Normal Job</Badge>
  ) : (
    <Badge color="purple" dot>Project Based Job</Badge>
  );

  const statusBadge = app.status ? (
    <StatusBadge status={app.status} />
  ) : (
    <span className="text-slate-400">—</span>
  );

  const evaluationBadge = ev && ev.recommendation ? (
    <Badge color="green" size="sm" className="me-1">
      {ev.recommendation === "shortlist" ? "Shortlisted" : ev.recommendation}
    </Badge>
  ) : (
    <span className="text-slate-400">—</span>
  );

  const avgScore =
    ev && ev.overallScore !== undefined
      ? (ev.overallScore * 10).toFixed(1)
      : "—";

  const candidateName = app.candidate?.name || "Candidate";
  const candidateEmail = app.candidate?.email || "—";
  const githubUsername = app.candidate?.githubUsername || "—";
  const linkedinUsername = app.candidate?.linkedinUsername || "—";
  const experienceLevel = app.candidate?.experienceLevel || "—";
  const skills = app.candidate?.skills || [];
  const resumeUrl = app.candidate?.resumeUrl || null;
  const portfolioLinks = app.candidate?.portfolioLinks || [];

  const projectTitle = app.project?.title || "—";
  const projectDomain = app.project?.domain || "—";
  const projectType = app.project?.applicationMode === "direct_hire" ? "Normal Job" : "Project Based Job";
  const projectDeadline = app.project?.deadline ? new Date(app.project.deadline).toLocaleDateString() : "—";
  const maxCandidates = app.project?.maxCandidates || "—";

  const appliedDate = app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "—";

  const searchResults = skills?.some((s) =>
    s.toLowerCase().includes(debouncedSearch.toLowerCase())
  ) || candidateName.toLowerCase().includes(debouncedSearch.toLowerCase())
    || candidateEmail.toLowerCase().includes(debouncedSearch.toLowerCase());

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setReviewStatus(newStatus);
    try {
      await api.put(`/applications/company/${applicationId}/review`, {
        reviewStatus: newStatus,
      });
    } catch (err) {
      console.error(err);
      alert("Failed to update review status");
    }
  };

  const handleInterviewSubmit = async (e) => {
    e.preventDefault();
    const { mode, date, startTime, endTime, location, meetingUrl, interviewType, instructions } = interviewFormValues;
    try {
      await api.post(`/applications/company/${applicationId}/interview`, {
        mode,
        date,
        startTime,
        endTime,
        location,
        meetingUrl,
        interviewType,
        instructions,
      });
      setShowInterviewForm(false);
      fetchApplication();
    } catch (err) {
      console.error(err);
      alert("Failed to schedule interview");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto px-4 py-12"
    >
      <PageHeader
        title="Candidate Review"
        description={`Reviewing candidate for ${app.project?.title}`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        <Card padding={false} hover={false}>
          <div className="p-6">
            <h2 className="text-base font-bold font-heading text-slate-900 mb-4">Candidate Profile</h2>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div>
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Name</h3>
                <p className="text-xl font-bold text-slate-900">{candidateName}</p>
                <p className="text-sm text-slate-400">{candidateEmail}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">GitHub</h3>
                <a
                  href={`https://github.com/${githubUsername}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex text-forge-primary hover:underline text-sm">
                  {githubUsername}
                </a>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">LinkedIn</h3>
                <a
                  href={linkedinUsername ? `https://linkedin.com/in/${linkedinUsername}` : "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex text-forge-primary hover:underline text-sm">
                  {linkedinUsername || "Not provided"}
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Experience Level</p>
                <Badge color={experienceColors[experienceLevel] || "slate"} dot>
                  {experienceLevel.replace(/_/g, " ")}
                </Badge>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Application Type</p>
                {applicationTypeBadge}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Applied Date</p>
                <p className="text-sm font-medium">{appliedDate}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Project Deadline</p>
                <p className="text-sm font-medium">{projectDeadline}</p>
              </div>
            </div>

            {skills.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((s, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {portfolioLinks.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Portfolio Links</p>
                <div className="flex flex-wrap gap-1">
                  {portfolioLinks.map((link, i) => (
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

            {resumeUrl && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Resume/CV</p>
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex text-forge-primary hover:underline text-sm">
                  View Resume Link
                </a>
              </div>
            )}
          </div>
        </Card>

        <Card padding={false} hover={false}>
          <div className="p-6">
            <h2 className="text-base font-bold font-heading text-slate-900 mb-4">Application Details</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Application Type</p>
                <span className="text-sm font-medium">
                  {app.project?.applicationMode === "direct_hire" ? "Normal Job (Direct Hire)" : "Project Based Job"}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Applied Date</p>
                <p className="text-sm font-medium">{appliedDate}</p>
              </div>
            </div>

            {app.status && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Current Status</p>
                <StatusBadge status={app.status} />
              </div>
            )}

            {evaluation && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Evaluator Recommendation</p>
                {evaluationBadge}
                <p className="text-xs text-slate-500 mt-1">Score: {avgScore !== "—" ? `${avgScore} / 10` : "—"}</p>
                {evaluation.feedback && (
                  <p className="text-xs text-slate-400 mt-1">Feedback: {evaluation.feedback.substring(0, 150)}{evaluation.feedback.length > 150 ? "..." : ""}</p>
                )}
              </div>
            ) || (
              <p className="text-xs text-slate-500">No evaluation yet</p>
            )}

            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Project Information</p>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div>
                <p className="text-xs text-slate-400">Job Role</p>
                <p className="text-sm font-medium">{projectTitle}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Domain</p>
                <p className="text-sm font-medium">{projectDomain}</p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-xs text-slate-400">Max Candidates</p>
              <p className="text-sm font-medium">{maxCandidates}</p>
            </div>
          </div>
        </Card>

      </div>

      <Card padding={false} hover={false}>
        <div className="p-6">
          <h2 className="text-base font-bold font-heading text-slate-900 mb-4">Company Review Pipeline</h2>

          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Company Review Status</p>
              <select
                value={reviewStatus || "company_reviewing"}
                onChange={handleStatusChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-forge-primary focus:ring-2 focus:ring-forge-primary/20"
              >
                <option value="">-- Select Status --</option>
                <option value="company_reviewing">Company Reviewing</option>
                <option value="company_interview">Company Interview</option>
                <option value="decision_pending">Decision Pending</option>
              </select>
            </div>

            {["shortlisted", "company_reviewing", "company_interview", "decision_pending", "interview_scheduled"].includes(app.status) && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Final Decision</p>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to hire this candidate? This will mark the application as Hired.")) {
                        api.put(`/applications/company/${applicationId}/final-decision`, { decision: "hired" })
                          .then(() => {
                            fetchApplication();
                            alert("Candidate marked as Hired.");
                          })
                          .catch(() => alert("Failed to mark as Hired"));
                      }
                    }}
                    className="col-span-2 rounded-xl bg-green-100 px-4 py-2.5 text-sm font-bold text-green-800 hover:bg-green-200 transition-colors"
                  >
                    Hire Candidate
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to mark this candidate as Not Hired?")) {
                        api.put(`/applications/company/${applicationId}/final-decision`, { decision: "rejected" })
                          .then(() => {
                            fetchApplication();
                            alert("Candidate marked as Not Hired.");
                          })
                          .catch(() => alert("Failed to mark as Not Hired"));
                      }
                    }}
                    className="col-span-2 rounded-xl bg-red-100 px-4 py-2.5 text-sm font-bold text-red-800 hover:bg-red-200 transition-colors"
                  >
                    Not Hire
                  </button>
                </div>
              </div>
            )}

            {showInterviewForm ? (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-slate-500 mb-3">Schedule Company Interview</h3>
                <form onSubmit={handleInterviewSubmit} className="space-y-3">
                  <div>
                    <label className="text-sm text-slate-500">Mode</label>
                    <select
                      value={interviewMode}
                      onChange={(e) => setInterviewMode(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-forge-primary focus:ring-2 focus:ring-forge-primary/20"
                    >
                      <option value="online">Online (Meeting URL required)</option>
                      <option value="offline">Offline (Location required)</option>
                    </select>
                  </div>

                  {interviewMode === "online" && (
                    <div>
                      <label className="text-sm text-slate-500">Meeting URL</label>
                      <input
                        type="text"
                        placeholder="https://..."
                        value={interviewFormValues.meetingUrl || ""}
                        onChange={(e) => setInterviewFormValues({ ...interviewFormValues, meetingUrl: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-forge-primary focus:ring-2 focus:ring-forge-primary/20 mt-1"
                      />
                    </div>
                  )}

                  {interviewMode === "offline" && (
                    <div>
                      <label className="text-sm text-slate-500">Location</label>
                      <input
                        type="text"
                        placeholder="Conference room, office, etc."
                        value={interviewFormValues.location || ""}
                        onChange={(e) => setInterviewFormValues({ ...interviewFormValues, location: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-forge-primary focus:ring-2 focus:ring-forge-primary/20 mt-1"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-sm text-slate-500">Interview Type</label>
                    <input
                      type="text"
                      placeholder="e.g., Culture Fit, Technical Round, HR"
                      value={interviewFormValues.interviewType || ""}
                      onChange={(e) => setInterviewFormValues({ ...interviewFormValues, interviewType: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-forge-primary focus:ring-2 focus:ring-forge-primary/20 mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-slate-500">Date</label>
                    <input
                      type="date"
                      value={interviewFormValues.date || ""}
                      onChange={(e) => setInterviewFormValues({ ...interviewFormValues, date: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-forge-primary focus:ring-2 focus:ring-forge-primary/20 mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-slate-500">Start Time</label>
                    <input
                      type="time"
                      value={interviewFormValues.startTime || ""}
                      onChange={(e) => setInterviewFormValues({ ...interviewFormValues, startTime: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-forge-primary focus:ring-2 focus:ring-forge-primary/20 mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-slate-500">End Time</label>
                    <input
                      type="time"
                      value={interviewFormValues.endTime || ""}
                      onChange={(e) => setInterviewFormValues({ ...interviewFormValues, endTime: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-forge-primary focus:ring-2 focus:ring-forge-primary/20 mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-slate-500">Instructions</label>
                    <textarea
                      value={interviewFormValues.instructions || ""}
                      onChange={(e) => setInterviewFormValues({ ...interviewFormValues, instructions: e.target.value })}
                      rows={3}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-forge-primary focus:ring-2 focus:ring-forge-primary/20 mt-1"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-forge-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-forge-primary/90 transition-colors"
                  >
                    Schedule Interview
                  </button>
                </form>
              </div>
            ) : (
              <Button
                size="sm"
                icon={ExternalLink}
                onClick={() => setShowInterviewForm(true)}
                className="w-full rounded-xl bg-forge-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-forge-primary/90 transition-colors"
              >
                Schedule Company Interview
              </Button>
            )}
          </div>
        </div>
      </Card>

      <div className="mt-8">
        <Card padding={false} hover={false}>
          <div className="p-6">
            <h2 className="text-base font-bold font-heading text-slate-900 mb-4">Candidate Journey</h2>
            <JourneyTimeline history={app.statusHistory || []} highlight={app.status} />
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

export default CompanyCandidateReview;