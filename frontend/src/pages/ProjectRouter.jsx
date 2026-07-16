import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import JobDetail from "./JobDetail";
import ProjectDetail from "./ProjectDetail";

const ProjectRouter = () => {
  const { id } = useParams();
  const [mode, setMode] = useState(null);

  useEffect(() => {
    api.get(`/projects/${id}`).then((res) => {
      setMode(res.data.project.applicationMode);
    }).catch(() => setMode("unknown"));
  }, [id]);

  if (!mode) {
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

  if (mode === "direct_hire") return <JobDetail />;
  return <ProjectDetail />;
};

export default ProjectRouter;
