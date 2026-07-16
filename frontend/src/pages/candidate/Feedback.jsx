import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../api/axios";
import { MessageSquareQuote, Star, UserCheck, TrendingUp } from "lucide-react";
import { PageHeader, Card, Badge, StatusBadge, EmptyState, PageSkeleton } from "../../components/ui";

const rubricLabels = {
  codeQuality: "Code Quality",
  problemSolving: "Problem Solving",
  standardsAdherence: "Standards Adherence",
  completeness: "Completeness",
  communication: "Communication",
};

const Feedback = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/evaluations/my")
      .then((res) => setResults(res.data.results))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSkeleton />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        title="Your Feedback"
        description="Expert reviews on your submitted work."
      />

      {results.length === 0 ? (
        <EmptyState
          icon={MessageSquareQuote}
          title="No evaluations yet"
          description="Once your submissions are reviewed, feedback will appear here."
        />
      ) : (
        <div className="space-y-6">
          {results.map(({ evaluation, project }, i) => {
            const scores = evaluation.scores || {};
            const scoreValues = Object.values(scores);
            const avg = scoreValues.length ? (scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length).toFixed(1) : "—";

            return (
              <motion.div
                key={evaluation._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card padding={false} hover={false}>
                  <div className="p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
                      <div>
                        <h3 className="text-lg font-bold font-heading text-slate-900">{project?.title}</h3>
                        <p className="text-sm text-slate-400">{project?.domain}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-xs text-slate-400">Overall Score</p>
                          <p className="text-2xl font-bold font-heading text-forge-primary">{avg}/10</p>
                        </div>
                        <StatusBadge status={evaluation.recommendation} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
                      {Object.entries(scores).map(([key, value]) => (
                        <div key={key} className="text-center bg-slate-50 rounded-xl py-4 px-2 border border-slate-100">
                          <p className="text-xl font-bold font-heading text-forge-primary">{value}</p>
                          <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-medium">
                            {rubricLabels[key] || key}
                          </p>
                        </div>
                      ))}
                    </div>

                    {evaluation.feedback && (
                      <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                        <div className="flex items-center gap-2 mb-2">
                          <UserCheck className="w-4 h-4 text-slate-400" />
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Feedback from {evaluation.evaluator?.name || "your evaluator"}
                          </p>
                        </div>
                        <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                          {evaluation.feedback}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default Feedback;
