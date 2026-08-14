import React from "react";

const colorMap = {
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  orange: "bg-orange-50 text-orange-700 border-orange-200",
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  red: "bg-red-50 text-red-700 border-red-200",
  purple: "bg-purple-50 text-purple-700 border-purple-200",
  slate: "bg-slate-100 text-slate-600 border-slate-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
  pink: "bg-pink-50 text-pink-700 border-pink-200",
  cyan: "bg-cyan-50 text-cyan-700 border-cyan-200",
};

const Badge = ({ children, color = "slate", className = "", dot }) => {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border
        ${colorMap[color] || colorMap.slate}
        ${className}
      `}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full bg-current`} />}
      {children}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const statusColorMap = {
    applied: "slate",
    in_progress: "blue",
    submitted: "orange",
    under_review: "amber",
    pending_review: "amber",
    reviewed: "green",
    shortlisted: "green",
    shortlist: "green",
    rejected: "red",
    reject: "red",
    needs_upskilling: "orange",
    interview_scheduled: "purple",
    hired: "indigo",
    open: "green",
    draft: "slate",
    closed: "red",
    archived: "slate",
    active: "green",
    inactive: "slate",
    pending: "amber",
    none: "slate",
    approved: "green",
    beginner: "green",
    intermediate: "orange",
    advanced: "red",
    candidate: "blue",
    company: "purple",
    evaluator: "orange",
    admin: "green",
  };

  return (
    <Badge color={statusColorMap[status] || "slate"} dot>
      {status?.replace(/_/g, " ")}
    </Badge>
  );
};

export default Badge;
