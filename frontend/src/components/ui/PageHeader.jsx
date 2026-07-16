import React from "react";
import { motion } from "framer-motion";

const PageHeader = ({ title, description, actions, className = "" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 ${className}`}
    >
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900">
          {title}
        </h1>
        {description && (
          <p className="text-slate-500 mt-1">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3 shrink-0">{actions}</div>
      )}
    </motion.div>
  );
};

export default PageHeader;
