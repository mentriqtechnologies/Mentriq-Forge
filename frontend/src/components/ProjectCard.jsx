import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Building2, ChevronRight, Briefcase, FolderKanban } from "lucide-react";
import { Badge } from "./ui";

const difficultyColor = {
  beginner: "green",
  intermediate: "orange",
  advanced: "red",
};

const ProjectCard = ({ project, index = 0 }) => {
  const isJob = project.applicationMode === "direct_hire";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link to={`/projects/${project._id}`} className="block group">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 transition-all duration-200 hover:shadow-elevated hover:-translate-y-0.5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              {isJob ? (
                <div className="p-1.5 rounded-lg bg-blue-50">
                  <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                </div>
              ) : (
                <div className="p-1.5 rounded-lg bg-forge-primary/10">
                  <FolderKanban className="w-3.5 h-3.5 text-forge-primary" />
                </div>
              )}
              <h3 className="font-heading font-bold text-base text-slate-900 group-hover:text-forge-primary transition-colors leading-snug">
                {project.title}
              </h3>
            </div>
            <Badge color={isJob ? "blue" : "forge"} dot>
              {isJob ? "Job" : "Project Based Job"}
            </Badge>
          </div>
          <p className="text-slate-500 text-sm mb-4 line-clamp-2 leading-relaxed">
            {project.description}
          </p>
          <div className="flex flex-wrap items-center gap-2 mb-4 text-xs text-slate-500">
            <span className="rounded-full bg-slate-100 px-2.5 py-1">{project.jobRole || project.title}</span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1">{project.salary || "Negotiable"}</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {(project.skillsRequired || []).slice(0, 5).map((skill) => (
              <span
                key={skill}
                className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Building2 className="w-3.5 h-3.5" />
              <span>{project.company?.companyName || project.company?.name || "Company"}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              {isJob ? (
                <>
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>{project.workLocation || "Remote"}</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5" />
                  <span>{project.durationDays} days</span>
                </>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProjectCard;
