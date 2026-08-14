import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api/axios";
import { Plus, Send, Briefcase, Clock, Users, BarChart3, BookOpen, Tag } from "lucide-react";
import { PageHeader, Card, Input, Select, Textarea, Button } from "../../components/ui";

const domains = [
  "Full Stack",
  "Frontend",
  "Backend",
  "UI/UX",
  "Data Science",
  "DevOps",
  "Blockchain/Web3",
  "Game Development",
  "Networking",
  "Business Analytics",
  "Cybersecurity",
  "AI/ML",
  "Other",
];

const CreateProject = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isDirectHireMode = new URLSearchParams(location.search).get("mode") === "direct";
  const [form, setForm] = useState({
    title: "",
    description: "",
    jobDescription: "",
    requirements: "",
    salary: "",
    domain: "Full Stack",
    skillsRequired: "",
    difficulty: "intermediate",
    type: "simulated",
    deliverables: "",
    durationDays: 7,
    hiringGoal: 1,
    acceptApplications: true,
    workLocation: "",
    salaryMin: "",
    salaryMax: "",
    isDirectHire: isDirectHireMode,
    experienceRequired: "fresher",
    customExperience: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.description.trim()) errs.description = "A brief description is required";
    if (!form.skillsRequired.trim()) errs.skillsRequired = "At least one skill is required";
    if (!Number(form.durationDays) || Number(form.durationDays) < 1) errs.durationDays = "Duration must be at least 1 day";
    if (!Number(form.hiringGoal) || Number(form.hiringGoal) < 1) errs.hiringGoal = "Openings must be at least 1";
    if (form.salaryMin && form.salaryMax && Number(form.salaryMax) < Number(form.salaryMin)) {
      errs.salaryMin = "Max salary must be greater than or equal to min";
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setError("");
      return;
    }
    setErrors({});
    setError("");
    setLoading(true);
    try {
      const payload = {
        ...form,
        title: form.title.trim(),
        jobRole: form.title.trim(),
        description: form.description.trim(),
        jobDescription: form.jobDescription.trim() || form.description.trim(),
        requirements: form.requirements.split(",").map((s) => s.trim()).filter(Boolean),
        skillsRequired: form.skillsRequired.split(",").map((s) => s.trim()).filter(Boolean),
        deliverables: form.deliverables.split(",").map((s) => s.trim()).filter(Boolean),
        durationDays: Number(form.durationDays),
        hiringGoal: Number(form.hiringGoal),
        salary: form.salary.trim() || "Negotiable",
        status: form.acceptApplications ? "open" : "closed",
        isDirectHire: isDirectHireMode || form.isDirectHire,
        applicationMode: isDirectHireMode || form.isDirectHire ? "direct_hire" : "project",
        workLocation: form.workLocation.trim(),
        salaryMin: form.salaryMin ? Number(form.salaryMin) : null,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : null,
        experienceRequired: form.experienceRequired,
        customExperience: form.experienceRequired === "custom" ? form.customExperience : "",
      };
      const res = await api.post("/projects", payload);
      navigate(`/company/projects/${res.data.project._id}/applicants`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
      <PageHeader
        title={isDirectHireMode ? "Post a Direct Hiring Job" : "Post a Project Based Job"}
        description={isDirectHireMode ? "Share a role that can be applied to directly with candidate details and resume link." : "Define a project based job for candidates to execute. Skill-first hiring starts here."}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4 flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
            <Briefcase className="w-4 h-4 text-red-600" />
          </div>
          {error}
        </div>
      )}

      <Card padding={false} hover={false}>
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {isDirectHireMode && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <p className="font-semibold">Direct hiring mode</p>
              <p className="mt-1">Candidates will apply directly with their name, mobile number, qualification, and resume link for company review.</p>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-sm font-bold font-heading text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              {isDirectHireMode ? "Job Details" : "Project Based Job Details"}
            </h3>
            <Input label={isDirectHireMode ? "Job Title" : "Project Based Job Title"} name="title" placeholder={isDirectHireMode ? "e.g. Sales Executive or Content Writer" : "e.g. Build a Customer Support Workflow"} required error={errors.title} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <div className="grid md:grid-cols-2 gap-4">
              <Select
                label="Experience Required"
                required
                options={[
                  { value: "fresher", label: "Fresher" },
                  { value: "0-1", label: "0–1 Years" },
                  { value: "1+", label: "1+ Years" },
                  { value: "2+", label: "2+ Years" },
                  { value: "3+", label: "3+ Years" },
                  { value: "5+", label: "5+ Years" },
                  { value: "custom", label: "Custom Experience" },
                ]}
                value={form.experienceRequired}
                onChange={(e) => setForm({ ...form, experienceRequired: e.target.value })}
              />
              {form.experienceRequired === "custom" && (
                <Input
                  label="Specify Experience"
                  placeholder="e.g. 4+ Years in React"
                  required
                  value={form.customExperience}
                  onChange={(e) => setForm({ ...form, customExperience: e.target.value })}
                />
              )}
            </div>
            <div>
              <Textarea
                name="description"
                label={isDirectHireMode ? "Job Brief" : "Project Based Job Brief"}
                required
                rows={4}
                error={errors.description}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder={isDirectHireMode ? "Describe the role, responsibilities, and what you are looking for..." : "Describe the project based job, goals, and expectations..."}
              />
            </div>
            <div>
              <Textarea
                name="jobDescription"
                label="Job Description"
                rows={4}
                value={form.jobDescription}
                onChange={(e) => setForm({ ...form, jobDescription: e.target.value })}
                placeholder={isDirectHireMode ? "Outline the day-to-day responsibilities and expectations..." : "Outline role responsibilities and what the candidate will do..."}
              />
            </div>
            <Input label="Requirements (comma separated)" placeholder={isDirectHireMode ? "Communication, Excel, Customer handling" : "React, REST APIs, GitHub"} value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} />
            {isDirectHireMode ? (
              <div className="grid md:grid-cols-2 gap-4">
                <Input label="Work Location" placeholder="Remote / Bengaluru, India" value={form.workLocation} onChange={(e) => setForm({ ...form, workLocation: e.target.value })} />
                <Input label="Salary / Compensation" placeholder="₹1,50,000 / year or Negotiable" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} />
              </div>
            ) : (
              <Input label="Salary / Compensation" placeholder="₹1,50,000 / year or Negotiable" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} />
            )}
            {isDirectHireMode && (
              <div className="grid md:grid-cols-2 gap-4">
                <Input label="Salary From" type="number" placeholder="500000" error={errors.salaryMin} value={form.salaryMin} onChange={(e) => setForm({ ...form, salaryMin: e.target.value })} />
                <Input label="Salary To" type="number" placeholder="800000" value={form.salaryMax} onChange={(e) => setForm({ ...form, salaryMax: e.target.value })} />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold font-heading text-slate-900 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Classification
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Select label="Domain" options={domains.map(d => ({ value: d, label: d }))} value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} />
              <Select label="Difficulty" options={[
                { value: "beginner", label: "Beginner" },
                { value: "intermediate", label: "Intermediate" },
                { value: "advanced", label: "Advanced" },
              ]} value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} />
            </div>
            <Input label="Skills Required (comma separated)" name="skillsRequired" placeholder={isDirectHireMode ? "Communication, Teamwork, Problem solving" : "React, Node.js, MongoDB"} required error={errors.skillsRequired} value={form.skillsRequired} onChange={(e) => setForm({ ...form, skillsRequired: e.target.value })} />
          </div>

          {!isDirectHireMode && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold font-heading text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Scope & Deliverables
              </h3>
              <Input label="Deliverables (comma separated)" placeholder="GitHub repo, Live demo, README" value={form.deliverables} onChange={(e) => setForm({ ...form, deliverables: e.target.value })} />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input label="Duration (days)" type="number" min={1} icon={Clock} error={errors.durationDays} value={form.durationDays} onChange={(e) => setForm({ ...form, durationDays: e.target.value })} />
                <Input label="Openings" type="number" min={1} icon={Users} error={errors.hiringGoal} value={form.hiringGoal} onChange={(e) => setForm({ ...form, hiringGoal: e.target.value })} />
                <Select label="Project Based Job Type" options={[
                  { value: "simulated", label: "Simulated" },
                  { value: "live", label: "Live" },
                ]} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <label className="flex items-center justify-between gap-3 text-sm font-medium text-slate-700">
              <span>{isDirectHireMode ? "Accept applications for this job right now" : "Accept applications for this project based job right now"}</span>
              <input
                type="checkbox"
                checked={form.acceptApplications}
                onChange={(e) => setForm({ ...form, acceptApplications: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-forge-primary focus:ring-forge-primary"
              />
            </label>
            <p className="mt-2 text-xs text-slate-500">Turn this off to close applications and stop new candidates from applying.</p>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <Button type="submit" loading={loading} icon={Send} size="lg" fullWidth>
              {isDirectHireMode ? "Publish Direct Hiring Job" : "Publish Project Based Job"}
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
};

export default CreateProject;
