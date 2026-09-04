import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api/axios";
import {
  ArrowLeft, FileText, Star, Send, Mail, Code2, Globe, FolderOpen,
  MessageSquare, CheckCircle, ArrowRight, GitCommitHorizontal, GitPullRequest,
  GitBranch, Link, GraduationCap, ListChecks, CalendarClock,
} from "lucide-react";
import { Card, Button, Badge, StatusBadge, Avatar, PageSkeleton } from "../../components/ui";

const rubric = [
  { key: "codeQuality", label: "Code Quality", desc: "Clean, readable, maintainable code", icon: Code2 },
  { key: "problemSolving", label: "Problem Solving", desc: "Logical approach, edge cases handled", icon: Star },
  { key: "standardsAdherence", label: "Standards Adherence", desc: "Industry standards & best practices", icon: ListChecks },
  { key: "completeness", label: "Completeness", desc: "All features implemented, polished", icon: FileText },
  { key: "communication", label: "Communication", desc: "Code comments, documentation, README", icon: MessageSquare },
];

const recOptions = [
  { value: "shortlist", label: "Shortlist", color: "bg-emerald-500", bgColor: "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100",
    activeBg: "bg-emerald-500 text-white" },
  { value: "needs_upskilling", label: "Needs Upskilling", color: "bg-amber-500", bgColor: "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100",
    activeBg: "bg-amber-500 text-white" },
  { value: "reject", label: "Reject", color: "bg-red-500", bgColor: "bg-red-50 border-red-200 text-red-700 hover:bg-red-100",
    activeBg: "bg-red-500 text-white" },
];

const suggestRecommendation = (avg) => (avg >= 7 ? "shortlist" : avg >= 5 ? "needs_upskilling" : "reject");

const experienceColors = {
  student: "blue",
  fresher: "green",
  professional: "purple",
  career_switcher: "orange",
  freelancer: "amber",
  internship_seeker: "cyan",
};

const EvaluateSubmission = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [scores, setScores] = useState({
    codeQuality: 5,
    problemSolving: 5,
    standardsAdherence: 5,
    completeness: 5,
    communication: 5,
  });
  const [feedback, setFeedback] = useState("");
  const [recommendation, setRecommendation] = useState("shortlist");
  const [recTouched, setRecTouched] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [nextSubmission, setNextSubmission] = useState(null);
  const [nextLoading, setNextLoading] = useState(false);

  useEffect(() => {
    api.get(`/submissions/${submissionId}`).then((res) => setSubmission(res.data.submission));
  }, [submissionId]);

  // Auto-suggest a recommendation from the current score while the evaluator
  // has not explicitly chosen one. They stay free to override it.
  const overallAvg = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;
  const suggested = suggestRecommendation(overallAvg);

  const handleScoreChange = (key, val) => {
    setScores((prev) => ({ ...prev, [key]: val }));
    if (!recTouched) setRecommendation(suggestRecommendation(Object.values({ ...scores, [key]: val }).reduce((a, b) => a + b, 0) / Object.keys(scores).length));
  };

  const findNextSubmission = async () => {
    try {
      const res = await api.get("/submissions/pending", { params: { status: "pending_review", limit: 5 } });
      const next = (res.data.submissions || []).find((s) => s._id !== submissionId);
      setNextSubmission(next || null);
    } catch {
      setNextSubmission(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/evaluations", { submissionId, scores, feedback, recommendation });
      setSubmitted(true);
      setLoading(false);
      findNextSubmission();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save evaluation");
      setLoading(false);
    }
  };

  if (!submission) return <PageSkeleton />;

  const analytics = submission.repoAnalytics || {};
  const topLanguages = (analytics.languages || []).slice(0, 3);
  const can = submission.candidate || {};

  // Success screen — show the recorded verdict and let the evaluator stay in flow.
  if (submitted) {
    const recColor = recommendation === "shortlist" ? "green" : recommendation === "reject" ? "red" : "orange";
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto px-4 py-16">
        <Card padding={false} hover={false}>
          <div className="p-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold font-heading text-slate-900 mb-2">Evaluation submitted</h1>
            <p className="text-sm text-slate-500 mb-6">
              {submission.candidate?.name || "Candidate"} · {submission.project?.title}
            </p>

            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="p-4 rounded-xl bg-slate-50 min-w-[120px]">
                <p className="text-2xl font-bold font-heading text-forge-primary">{overallAvg.toFixed(1)}</p>
                <p className="text-xs text-slate-400">overall / 10</p>
              </div>
              <Badge color={recColor} className="px-3 py-1.5 text-sm">
                {recommendation.replace(/_/g, " ")}
              </Badge>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button to="/evaluator/submissions" variant="ghost" icon={ArrowLeft}>Back to Queue</Button>
              {nextLoading ? (
                <Button disabled loading>Finding next…</Button>
              ) : nextSubmission ? (
                <Button
                  icon={ArrowRight}
                  onClick={() => navigate(`/evaluator/submissions/${nextSubmission._id}/evaluate`)}
                >
                  Next: {nextSubmission.candidate?.name || "Next submission"}
                </Button>
              ) : (
                <Button to="/evaluator/dashboard" icon={CheckCircle}>Queue is clear</Button>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card padding={false} hover={false}>
            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 mb-1">
                    {submission.project?.title}
                  </h1>
                  <p className="text-sm text-slate-400">{submission.project?.domain}</p>
                </div>
                <StatusBadge status={submission.status} />
              </div>

              <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                <Avatar name={can.name} size="lg" />
                <div>
                  <h3 className="text-base font-bold font-heading text-slate-900">{can.name}</h3>
                  <div className="flex items-center gap-3 text-sm text-slate-400 mt-1 flex-wrap">
                    <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {can.email}</span>
                    {can.experienceLevel && (
                      <Badge color={experienceColors[can.experienceLevel] || "orange"} dot>
                        {can.experienceLevel.replace(/_/g, " ")}
                      </Badge>
                    )}
                    {can.verificationStatus === "approved" && (
                      <Badge color="green" dot>Verified</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {submission.repoUrl && (
                  <a href={submission.repoUrl} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition font-medium">
                    <Code2 className="w-3.5 h-3.5" /> GitHub Repo
                  </a>
                )}
                {submission.liveDemoUrl && (
                  <a href={submission.liveDemoUrl} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition font-medium">
                    <Globe className="w-3.5 h-3.5" /> Live Demo
                  </a>
                )}
                {submission.driveLink && (
                  <a href={submission.driveLink} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 hover:bg-amber-100 transition font-semibold">
                    <FolderOpen className="w-3.5 h-3.5" /> Code Folder
                  </a>
                )}
              </div>

              {submission.notes && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Candidate Notes</p>
                  <p className="text-sm text-slate-600 italic">"{submission.notes}"</p>
                </div>
              )}
            </div>
          </Card>

          {/* Candidate intel — surface the full profile so the evaluator never leaves the workspace */}
          <Card padding={false} hover={false}>
            <div className="p-6">
              <h2 className="text-base font-bold font-heading text-slate-900 mb-4 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-forge-primary" /> Candidate Intel
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(can.skills || []).length > 0 ? (can.skills || []).map((s, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">{s}</span>
                    )) : <span className="text-xs text-slate-400">Not provided</span>}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Education</p>
                  <p className="text-sm text-slate-700">{can.education || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Profile</p>
                  <div className="flex flex-wrap gap-2">
                    {can.githubUsername && (
                      <a href={`https://github.com/${can.githubUsername}`} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 font-medium">
                        <GitBranch className="w-3 h-3" /> GitHub
                      </a>
                    )}
                    {can.linkedinUrl && (
                      <a href={can.linkedinUrl} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 font-medium">
                        <Link className="w-3 h-3" /> LinkedIn
                      </a>
                    )}
                    {can.resumeUrl && (
                      <a href={can.resumeUrl} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 font-medium">
                        <FileText className="w-3 h-3" /> Resume
                      </a>
                    )}
                    {!can.githubUsername && !can.linkedinUrl && !can.resumeUrl && (
                      <span className="text-xs text-slate-400">No links provided</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Bio</p>
                  <p className="text-sm text-slate-600 line-clamp-3">{can.bio || "Not provided"}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Repository analytics */}
          {(analytics.totalCommits || analytics.pullRequests || topLanguages.length > 0 || analytics.branches?.length > 0) && (
            <Card padding={false} hover={false}>
              <div className="p-6">
                <h2 className="text-base font-bold font-heading text-slate-900 mb-4 flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-forge-primary" /> Repository Activity
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3 rounded-xl bg-slate-50">
                    <GitCommitHorizontal className="w-4 h-4 text-slate-400 mb-1" />
                    <p className="text-lg font-bold font-heading text-slate-900">{analytics.totalCommits ?? "—"}</p>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Commits</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50">
                    <GitPullRequest className="w-4 h-4 text-slate-400 mb-1" />
                    <p className="text-lg font-bold font-heading text-slate-900">{analytics.pullRequests ?? "—"}</p>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Pull Requests</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50">
                    <GitBranch className="w-4 h-4 text-slate-400 mb-1" />
                    <p className="text-lg font-bold font-heading text-slate-900">{(analytics.branches || []).length}</p>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Branches</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50">
                    <CalendarClock className="w-4 h-4 text-slate-400 mb-1" />
                    <p className="text-lg font-bold font-heading text-slate-900">
                      {analytics.lastCommitDate ? new Date(analytics.lastCommitDate).toLocaleDateString() : "—"}
                    </p>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Last Commit</p>
                  </div>
                </div>
                {topLanguages.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2">
                      {topLanguages.map((lang, i) => (
                        <Badge key={i} color={i === 0 ? "forge" : i === 1 ? "purple" : "slate"}>
                          {lang.name}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-2 flex h-2 rounded-full overflow-hidden bg-slate-100">
                      {(() => {
                        const total = topLanguages.reduce((a, b) => a + (b.bytes || 0), 0) || 1;
                        return topLanguages.map((lang, i) => (
                          <div
                            key={i}
                            className={`${i === 0 ? "bg-forge-primary" : i === 1 ? "bg-purple-400" : "bg-slate-400"} h-full`}
                            style={{ width: `${((lang.bytes || 0) / total) * 100}%` }}
                          />
                        ));
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          <form onSubmit={handleSubmit}>
            <Card padding={false} hover={false}>
              <div className="p-6 sm:p-8 space-y-6">
                <h2 className="text-base font-bold font-heading text-slate-900 flex items-center gap-2">
                  <Star className="w-4 h-4 text-forge-primary" />
                  Rubric Scoring
                </h2>

                {rubric.map((r) => (
                  <div key={r.key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div>
                        <span className="text-sm font-semibold text-slate-900">{r.label}</span>
                        <p className="text-xs text-slate-400">{r.desc}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">0</span>
                        <span className="text-lg font-bold font-heading text-forge-primary min-w-[2ch] text-center">{scores[r.key]}</span>
                        <span className="text-xs text-slate-400">10</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      value={scores[r.key]}
                      onChange={(e) => handleScoreChange(r.key, Number(e.target.value))}
                      className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-forge-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-forge-primary [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer"
                    />
                  </div>
                ))}

                <div className="pt-4 border-t border-slate-100">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Detailed Feedback</label>
                  <textarea
                    required rows={4}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Detailed, constructive feedback on code quality, approach, and areas to improve..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:border-forge-primary focus:ring-2 focus:ring-forge-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Recommendation</label>
                  <div className="flex gap-2">
                    {recOptions.map((opt) => (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() => { setRecommendation(opt.value); setRecTouched(true); }}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border-2 ${
                          recommendation === opt.value
                            ? `${opt.activeBg} border-transparent`
                            : opt.bgColor
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {!recTouched && (
                    <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                      <Star className="w-3 h-3 text-forge-secondary" />
                      Suggested from score: <strong className="text-slate-600">{suggested.replace(/_/g, " ")}</strong> — click any option to override.
                    </p>
                  )}
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4">{error}</div>
                )}

                <Button type="submit" fullWidth size="lg" icon={Send} loading={loading}>
                  Submit Evaluation
                </Button>
              </div>
            </Card>
          </form>
        </div>

        <div className="space-y-4">
          <Card padding={false} hover={false}>
            <div className="p-5 text-center">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Overall Score</p>
              <p className="text-4xl font-bold font-heading text-forge-primary">{overallAvg.toFixed(1)}</p>
              <p className="text-xs text-slate-400">/ 10</p>
              <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-forge-primary to-forge-secondary transition-all duration-300"
                  style={{ width: `${overallAvg * 10}%` }} />
              </div>
            </div>
          </Card>

          {rubric.map((r) => (
            <Card key={r.key} padding={false} hover={false}>
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-500">{r.label}</span>
                  <span className="text-sm font-bold font-heading text-forge-primary">{scores[r.key]}/10</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-forge-primary transition-all duration-300"
                    style={{ width: `${scores[r.key] * 10}%` }} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default EvaluateSubmission;