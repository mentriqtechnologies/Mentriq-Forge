import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api/axios";
import { Save, ArrowLeft, Briefcase } from "lucide-react";
import { PageHeader, Card, Input, Select, Button, PageSkeleton } from "../../components/ui";

const EditProject = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    jobRole: "",
    description: "",
    jobDescription: "",
    requirements: "",
    skillsRequired: "",
    salary: "",
    salaryMin: "",
    salaryMax: "",
    workLocation: "",
    domain: "Full Stack",
    difficulty: "intermediate",
    experienceRequired: "fresher",
    customExperience: "",
    status: "open",
  });

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await api.get(`/projects/${projectId}`);
        const p = res.data.project;
        setForm({
          title: p.title || "",
          jobRole: p.jobRole || "",
          description: p.description || "",
          jobDescription: p.jobDescription || "",
          requirements: (p.requirements || []).join(", "),
          skillsRequired: (p.skillsRequired || []).join(", "),
          salary: p.salary || "Negotiable",
          salaryMin: p.salaryMin || "",
          salaryMax: p.salaryMax || "",
          workLocation: p.workLocation || "",
          domain: p.domain || "Full Stack",
          difficulty: p.difficulty || "intermediate",
          experienceRequired: p.experienceRequired || "fresher",
          customExperience: p.customExperience || "",
          status: p.status || "open",
        });
      } catch (err) {
        setError("Failed to load project");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [projectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        ...form,
        requirements: form.requirements.split(",").map((s) => s.trim()).filter(Boolean),
        skillsRequired: form.skillsRequired.split(",").map((s) => s.trim()).filter(Boolean),
        salaryMin: form.salaryMin ? Number(form.salaryMin) : null,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : null,
        customExperience: form.experienceRequired === "custom" ? form.customExperience : "",
      };
      await api.put(`/projects/${projectId}`, payload);
      navigate(`/company/projects/${projectId}/applicants`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update project");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageSkeleton />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors mb-4">
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <PageHeader
        title="Edit Project / Job"
        description="Update your project or job posting details."
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4 flex items-center gap-3 mb-6">
          <Briefcase className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <Card padding={false} hover={false}>
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <Input label="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input label="Job Role" value={form.jobRole} onChange={(e) => setForm({ ...form, jobRole: e.target.value })} />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea
              required rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:border-forge-primary focus:ring-2 focus:ring-forge-primary/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Job Description</label>
            <textarea
              rows={4}
              value={form.jobDescription}
              onChange={(e) => setForm({ ...form, jobDescription: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:border-forge-primary focus:ring-2 focus:ring-forge-primary/20"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Requirements (comma separated)" value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} />
            <Input label="Skills Required (comma separated)" required value={form.skillsRequired} onChange={(e) => setForm({ ...form, skillsRequired: e.target.value })} />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Salary" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} />
            <Input label="Work Location" value={form.workLocation} onChange={(e) => setForm({ ...form, workLocation: e.target.value })} />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Salary From" type="number" value={form.salaryMin} onChange={(e) => setForm({ ...form, salaryMin: e.target.value })} />
            <Input label="Salary To" type="number" value={form.salaryMax} onChange={(e) => setForm({ ...form, salaryMax: e.target.value })} />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Select
              label="Domain"
              options={[
                "Full Stack", "Frontend", "Backend", "UI/UX", "Data Science",
                "DevOps", "Blockchain/Web3", "Game Development", "Networking",
                "Business Analytics", "Cybersecurity", "AI/ML", "Other",
              ].map(d => ({ value: d, label: d }))}
              value={form.domain}
              onChange={(e) => setForm({ ...form, domain: e.target.value })}
            />
            <Select
              label="Difficulty"
              options={[
                { value: "beginner", label: "Beginner" },
                { value: "intermediate", label: "Intermediate" },
                { value: "advanced", label: "Advanced" },
              ]}
              value={form.difficulty}
              onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Select
              label="Experience Required"
              options={[
                { value: "fresher", label: "Fresher" },
                { value: "0-1", label: "0–1 Years" },
                { value: "1+", label: "1+ Years" },
                { value: "2+", label: "2+ Years" },
                { value: "3+", label: "3+ Years" },
                { value: "5+", label: "5+ Years" },
                { value: "custom", label: "Custom" },
              ]}
              value={form.experienceRequired}
              onChange={(e) => setForm({ ...form, experienceRequired: e.target.value })}
            />
            {form.experienceRequired === "custom" && (
              <Input label="Custom Experience" value={form.customExperience} onChange={(e) => setForm({ ...form, customExperience: e.target.value })} />
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <label className="flex items-center justify-between gap-3 text-sm font-medium text-slate-700">
              <span>Accepting applications</span>
              <input
                type="checkbox"
                checked={form.status === "open"}
                onChange={(e) => setForm({ ...form, status: e.target.checked ? "open" : "closed" })}
                className="h-4 w-4 rounded border-slate-300 text-forge-primary focus:ring-forge-primary"
              />
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <Button type="submit" loading={saving} icon={Save} size="lg" fullWidth>
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
};

export default EditProject;
