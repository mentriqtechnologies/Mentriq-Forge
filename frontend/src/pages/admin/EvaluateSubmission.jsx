import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api/axios";
import { ArrowLeft, ExternalLink, FileText, Star, Send, User, Mail, BookOpen, Code2, Globe, FolderOpen, MessageSquare } from "lucide-react";
import { PageHeader, Card, Button, Badge, StatusBadge, Avatar, PageSkeleton } from "../../components/ui";

const rubric = [
  { key: "codeQuality", label: "Code Quality", desc: "Clean, readable, maintainable code", icon: Code2 },
  { key: "problemSolving", label: "Problem Solving", desc: "Logical approach, edge cases handled", icon: Star },
  { key: "standardsAdherence", label: "Standards Adherence", desc: "Industry standards & best practices", icon: BookOpen },
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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/submissions/${submissionId}`).then((res) => setSubmission(res.data.submission));
  }, [submissionId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/evaluations", { submissionId, scores, feedback, recommendation });
      navigate("/evaluator/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save evaluation");
    } finally {
      setLoading(false);
    }
  };

  const overallAvg = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;

  if (!submission) return <PageSkeleton />;

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
                <Avatar name={submission.candidate?.name} size="lg" />
                <div>
                  <h3 className="text-base font-bold font-heading text-slate-900">{submission.candidate?.name}</h3>
                  <div className="flex items-center gap-3 text-sm text-slate-400 mt-1">
                    <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {submission.candidate?.email}</span>
                    {submission.candidate?.experienceLevel && (
                      <Badge color="orange" dot>{submission.candidate.experienceLevel}</Badge>
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
                      onChange={(e) => setScores({ ...scores, [r.key]: Number(e.target.value) })}
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
                        onClick={() => setRecommendation(opt.value)}
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
