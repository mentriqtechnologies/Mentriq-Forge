import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api/axios";
import {
  PageHeader, Card, Button, Input, Select,
  Textarea,
} from "../../components/ui";
import { ArrowLeft, CheckCircle, ExternalLink } from "lucide-react";

const InterviewForm = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    mode: "online",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    meetingUrl: "",
    instructions: "",
    interviewType: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!applicationId) return;
    api.get(`/applications/${applicationId}`).then((res) => {
      const app = res.data.application;
      setForm((prev) => ({
        ...prev,
        mode: app.project?.applicationMode === "direct_hire" ? "offline" : "online",
        date: new Date().toISOString().split("T")[0],
      }));
    }).catch(() => {});
  }, [applicationId]);

  const handleModeChange = (e) => {
    const mode = e.target.value;
    setForm(prev => ({
      ...prev,
      mode,
      date: mode === "online" ? new Date().toISOString().split("T")[0] : prev.date,
      meetingUrl: "",
      location: "",
    }));
  };

  const validateForm = () => {
    const errors = [];
    if (!form.date) errors.push("Date is required");
    if (form.mode === "online" && !form.meetingUrl) errors.push("Meeting URL is required for online interviews");
    if (form.mode === "offline" && !form.location) errors.push("Location is required for offline interviews");
    if (!form.startTime) errors.push("Start time is required");
    if (!form.endTime) errors.push("End time is required");
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(". "));
      return;
    }

    setLoading(true);
    try {
      const payload = {
        mode: form.mode,
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        location: form.location,
        meetingUrl: form.meetingUrl,
        instructions: form.instructions,
        interviewType: form.interviewType,
      };

      await api.post(`/interviews/${applicationId}`, payload);
      setSuccess(true);
      setLoading(false);
      setTimeout(() => navigate(`/evaluator/application/${applicationId}`), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to schedule interview");
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      <Link
        to="/evaluator/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <PageHeader
        title="Schedule Interview"
        description="Schedule an interview for the selected application"
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4 flex items-center gap-3 mb-6">
          <ExternalLink className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl p-4 flex items-center gap-3 mb-6">
          <CheckCircle className="w-4 h-4 shrink-0" />
          Interview scheduled successfully!
        </div>
      )}

      <Card padding={false} hover={false}>
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Interview Mode</label>
              <Select
                value={form.mode}
                onChange={handleModeChange}
                options={[
                  { value: "online", label: "Online" },
                  { value: "offline", label: "Offline / In-Person" },
                ]}
              />
            </div>
            <Input
              label="Date"
              type="date"
              value={form.date}
              onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
              placeholder="Select date"
            />
            <Input
              label="Start Time"
              type="time"
              value={form.startTime}
              onChange={(e) => setForm(prev => ({ ...prev, startTime: e.target.value }))}
              placeholder="HH:MM"
            />
            <Input
              label="End Time"
              type="time"
              value={form.endTime}
              onChange={(e) => setForm(prev => ({ ...prev, endTime: e.target.value }))}
              placeholder="HH:MM"
            />
          </div>

          {form.mode === "online" ? (
            <div>
              <Input
                label="Meeting URL"
                type="text"
                value={form.meetingUrl}
                onChange={(e) => setForm(prev => ({ ...prev, meetingUrl: e.target.value }))}
                placeholder="https://meet.google.com/xxx-yyy-zzz or https://zoom.us/j/123456789"
              />
            </div>
          ) : (
            <div>
              <Input
                label="Location"
                value={form.location}
                onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Company office / Candidate location"
              />
            </div>
          )}

          <Input
            label="Interview Type"
            value={form.interviewType}
            onChange={(e) => setForm(prev => ({ ...prev, interviewType: e.target.value }))}
            placeholder="e.g. Technical Round, Project Review, HR Interview"
          />

          <Textarea
            label="Instructions"
            value={form.instructions}
            onChange={(e) => setForm(prev => ({ ...prev, instructions: e.target.value }))}
            placeholder="Any special instructions for the candidate or interviewer"
            rows={3}
          />

          <Button type="submit" loading={loading} fullWidth size="lg">
            {loading ? "Scheduling..." : "Schedule Interview"}
          </Button>
        </form>
      </Card>
    </motion.div>
  );
};

export default InterviewForm;