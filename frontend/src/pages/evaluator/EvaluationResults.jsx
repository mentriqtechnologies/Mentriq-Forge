import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import {
  FileText, Users, Search, CheckCircle, TrendingUp,
} from "lucide-react";
import { PageHeader, Card, Badge, StatusBadge, Button, Select, Input, EmptyState, } from "../../components/ui";

const EvaluatorEvaluationResults = () => {
  const { applicationId } = useParams();
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    setLoading(true);
    try {
      let params = {};
      if (applicationId) params.applicationId = applicationId;
      if (search) params.search = search;
      const res = await api.get("/evaluations", { params });
      setEvaluations(res.data.evaluations || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const today = new Date().toLocaleDateString();

  if (loading) {
    return (
      <div className="h-64 grid place-items-center">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-20 h-8 bg-slate-200 rounded animate-bounce" />
        ))}
      </div>
    );
  }

  if (evaluations.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No evaluations found"
        description={applicationId ? "No evaluations for this application yet." : "Submit evaluations for reviewed submissions."}
        actionLabel={applicationId ? "Back to Dashboard" : undefined}
        onAction={() => applicationId && navigate("/evaluator/dashboard")}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Evaluation Results"
        description={applicationId ? `Evaluations for Application #${applicationId}` : "All Evaluation Results"}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <Select
          label="Application"
          onChange={(e) => navigate(`/evaluator/evaluations/${e.target.value}`)}
        >
          <option value="">All Applications</option>
          {evaluations.map((ev, idx) => {
            const evObj = ev.evaluation;
            return (
              <option key={idx} value={evObj.application || ""}>
                {evObj.application ? `App ${evObj.application}` : "Unknown"}
              </option>
            );
          })}
        </Select>
        <Input
          type="text"
          placeholder="Search evaluations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <p className="text-sm text-slate-400 mb-4">{evaluations.length} evaluation{evaluations.length !== 1 ? "s" : ""} found</p>

      <div className="space-y-3">
        {evaluations.map((ev, i) => {
          const evObj = ev.evaluation;
          const scoreKeys = ["codeQuality", "problemSolving", "standardsAdherence", "completeness", "communication"];
          const avgScore =
            Object.values(evObj.scores || {}).reduce((a, b) => a + (b || 0), 0) /
            (Object.keys(evObj.scores || {}).length || 1);
          const recBadge = evObj.recommendation === "shortlist" ? (
            <Badge color="green" size="sm">
              Shortlist
            </Badge>
          ) : evObj.recommendation === "reject" ? (
            <Badge color="red" size="sm">Reject</Badge>
          ) : (
            <Badge color="orange" size="sm">Needs Upskilling</Badge>
          );
          const avgScoreDisplay = avgScore.toFixed(1);

          return (
            <Card padding={false} key={i}>
              <div className="p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm-items-center gap-3 mb-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      Submission {ev.submission?.repoUrl ? ev.submission.repoUrl.split("/").pop() : "N/A"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {evObj.evaluator?.name || "Evaluator"} • {new Date(evObj.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {recBadge}
                </div>

                <div className="grid grid-cols-5 gap-1 text-center text-xs">
                  {scoreKeys.map((key) => {
                    const score = evObj.scores?.[key] || 0;
                    return (
                      <div key={key} className={`p-1 rounded bg-slate-100 ${score >= 8 ? "bg-green-100" : score >= 6 ? "bg-amber-100" : "bg-red-100"}`}>
                        {score}/10
                      </div>
                    );
                  })}
                </div>

                <p className="text-sm mt-2 text-slate-600">
                  {evObj.feedback ? `Feedback: ${evObj.feedback.substring(0, 100)}${evObj.feedback.length > 100 ? "..." : ""}` : "No feedback provided"}
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default EvaluatorEvaluationResults;