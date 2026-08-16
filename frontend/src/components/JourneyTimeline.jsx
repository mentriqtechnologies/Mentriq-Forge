import React from "react";
import {
  FileText, RefreshCw, FolderOpen, SearchCheck, Send, Building2,
  Handshake, Clock3, CalendarClock, CheckCircle2, XCircle,
} from "lucide-react";
import Badge from "./ui/Badge";

// Canonical map of every stage in the recruitment journey with its display label,
// color and icon. Used by JourneyTimeline across evaluator, company and admin views.
export const STAGE_INFO = {
  applied: { label: "Applied", color: "slate", icon: FileText },
  in_progress: { label: "Work In Progress", color: "blue", icon: RefreshCw },
  submitted: { label: "Work Submitted", color: "orange", icon: FolderOpen },
  under_review: { label: "Evaluator Review", color: "amber", icon: SearchCheck },
  shortlisted: { label: "Forwarded to Company", color: "green", icon: Send },
  company_reviewing: { label: "Company Reviewing", color: "blue", icon: Building2 },
  company_interview: { label: "Company Interview", color: "purple", icon: Handshake },
  decision_pending: { label: "Decision Pending", color: "amber", icon: Clock3 },
  interview_scheduled: { label: "Interview Scheduled", color: "purple", icon: CalendarClock },
  hired: { label: "Hired", color: "green", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "red", icon: XCircle },
};

const roleBadgeColor = {
  candidate: "blue",
  evaluator: "orange",
  company: "purple",
  admin: "green",
};

export const JourneyTimeline = ({ history = [], highlight = "" }) => {
  if (!history || history.length === 0) {
    return (
      <div className="flex items-center justify-center p-4 rounded-xl bg-slate-50 text-xs text-slate-400">
        No journey history recorded yet.
      </div>
    );
  }

  const entries = [...history].sort((a, b) => new Date(a.at) - new Date(b.at));

  return (
    <ol className="relative space-y-4 before:content-[''] before:absolute before:left-[13px] before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
      {entries.map((entry, i) => {
        const info = STAGE_INFO[entry.status] || {
          label: entry.status?.replace(/_/g, " "),
          color: "slate",
          icon: FileText,
        };
        const Icon = info.icon;
        const isHighlighted = entry.status === highlight;
        return (
          <li key={i} className="relative pl-10">
            <span
              className={`
                absolute left-0 top-0 w-7 h-7 rounded-full grid place-items-center border
                ${
                  isHighlighted
                    ? "bg-forge-primary border-forge-primary text-white"
                    : "bg-white border-slate-200 text-slate-400"
                }
              `}
            >
              <Icon className="w-3.5 h-3.5" />
            </span>
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <span className="text-sm font-semibold text-slate-900">{info.label}</span>
              <Badge color={info.color}>{entry.status}</Badge>
              {entry.byRole && (
                <Badge color={roleBadgeColor[entry.byRole] || "slate"} dot>
                  {entry.byRole}
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {entry.at
                ? new Date(entry.at).toLocaleString(undefined, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""}
              {entry.by?.name ? ` · by ${entry.by.name}` : ""}
            </p>
          </li>
        );
      })}
    </ol>
  );
};

export default JourneyTimeline;