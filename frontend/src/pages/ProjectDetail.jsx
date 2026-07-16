import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import {
  Clock, Signal, Building2, CheckCircle, ArrowLeft,
  Briefcase, FileText, BookOpen, ChevronRight, Award,
  Users,
} from "lucide-react";
import { Badge, StatusBadge, Button, Card } from "../components/ui";

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get(`/projects/${id}`).then((res) => setProject(res.data.project));
  }, [id]);

  const handleApply = async () => {
    setApplying(true);
    setMessage("");
    try {
      await api.post("/applications", { projectId: id });
      setApplied(true);
      setMessage("Applied successfully! Check your candidate dashboard to begin.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not apply to this role");
    } finally {
      setApplying(false);
    }
  };

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="space-y-4">
          <div className="h-8 w-64 shimmer rounded-lg" />
          <div className="h-4 w-96 shimmer rounded-lg" />
          <div className="h-32 w-full shimmer rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      <Link
        to="/projects"
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to opportunities
      </Link>

      <div className="flex flex-wrap items-center gap-3 mb-2">
        <Badge color="forge" dot>Project Based Job</Badge>
        <Badge color="forge" dot>{project.domain}</Badge>
        <StatusBadge status={project.difficulty} />
        {project.status && <StatusBadge status={project.status} />}
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold font-heading text-slate-900 mb-4 leading-tight">
        {project.title}
      </h1>

      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-8">
        <div className="flex items-center gap-1.5">
          <Building2 className="w-4 h-4" />
          {project.company?.companyName || project.company?.name || "Company"}
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          {project.durationDays} days
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="w-4 h-4" />
          {project.hiringGoal || 1} opening{project.hiringGoal !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {(project.skillsRequired || []).map((s) => (
          <span
            key={s}
            className="text-xs px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 font-medium"
          >
            {s}
          </span>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 space-y-6">
          <Card padding={false} hover={false}>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4 text-forge-primary" />
                <h2 className="text-base font-bold font-heading text-slate-900">Project Based Job Description</h2>
              </div>
              <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">
                {project.description}
              </p>
            </div>
          </Card>

          {project.requirements?.length > 0 && (
            <Card padding={false} hover={false}>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-4 h-4 text-forge-primary" />
                  <h2 className="text-base font-bold font-heading text-slate-900">Requirements & Skills</h2>
                </div>
                <ul className="space-y-2">
                  {project.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-600">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      </div>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          )}

          {project.deliverables?.length > 0 && (
            <Card padding={false} hover={false}>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <h2 className="text-base font-bold font-heading text-slate-900">Deliverables</h2>
                </div>
                <ul className="space-y-2">
                  {project.deliverables.map((d, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      </div>
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card padding={false} hover={false}>
            <div className="p-5">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Project Based Job Details</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Clock className="w-4 h-4" />
                    Duration
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{project.durationDays} days</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Signal className="w-4 h-4" />
                    Difficulty
                  </div>
                  <StatusBadge status={project.difficulty} />
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Award className="w-4 h-4" />
                    Experience
                  </div>
                  <span className="text-sm font-semibold text-slate-900">
                    {project.experienceRequired === "custom"
                      ? project.customExperience || "Custom"
                      : ({ fresher: "Fresher", "0-1": "0–1 Years", "1+": "1+ Years", "2+": "2+ Years", "3+": "3+ Years", "5+": "5+ Years" }[project.experienceRequired] || "Fresher")}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Users className="w-4 h-4" />
                    Team Size
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{project.hiringGoal || 1}</span>
                </div>
                {project.deadline && (
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Clock className="w-4 h-4" />
                      Deadline
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{new Date(project.deadline).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Award className="w-4 h-4" />
                    Status
                  </div>
                  <StatusBadge status={project.status} />
                </div>
              </div>
            </div>
          </Card>

          {message && (
            <div
              className={`rounded-xl p-4 text-sm border ${
                applied
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          {user?.role === "candidate" ? (
            <Button
              onClick={handleApply}
              disabled={applying || applied || project.status !== "open"}
              fullWidth
              size="lg"
              icon={applied ? CheckCircle : Briefcase}
              loading={applying}
              variant={applied ? "outline" : "primary"}
            >
              {project.status !== "open"
                ? "Applications Closed"
                : applied ? "Applied Successfully" : applying ? "Applying..." : "Participate in Project Based Job"}
            </Button>
          ) : !user ? (
            <Link to="/login">
              <Button fullWidth size="lg">
                Log in to Apply
              </Button>
            </Link>
          ) : (
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-500 text-center">
              Only candidates can apply to project based jobs.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectDetail;
