import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

const StatCard = ({ label, value, icon: Icon, trend, trendLabel, color = "forge" }) => {
  const colorClasses = {
    forge: "from-forge-primary/10 to-forge-primary/5 border-forge-primary/20",
    orange: "from-forge-secondary/10 to-forge-secondary/5 border-forge-secondary/20",
    green: "from-emerald-500/10 to-emerald-500/5 border-emerald-500/20",
    red: "from-red-500/10 to-red-500/5 border-red-500/20",
    purple: "from-purple-500/10 to-purple-500/5 border-purple-500/20",
  };

  const iconColors = {
    forge: "bg-forge-primary/10 text-forge-primary",
    orange: "bg-forge-secondary/10 text-forge-secondary",
    green: "bg-emerald-500/10 text-emerald-600",
    red: "bg-red-500/10 text-red-600",
    purple: "bg-purple-500/10 text-purple-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        relative overflow-hidden rounded-2xl border bg-white p-5
        bg-gradient-to-br ${colorClasses[color]}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="text-3xl font-bold font-heading text-slate-900">{value ?? "—"}</p>
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-1">
              {trend > 0 ? (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-red-500" />
              )}
              <span className={`text-xs font-semibold ${trend > 0 ? "text-emerald-600" : "text-red-600"}`}>
                {Math.abs(trend)}%
              </span>
              {trendLabel && (
                <span className="text-xs text-slate-400 ml-1">{trendLabel}</span>
              )}
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${iconColors[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;
