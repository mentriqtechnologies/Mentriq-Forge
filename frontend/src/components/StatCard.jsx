import React from "react";

const StatCard = ({ label, value }) => (
  <div className="bg-navy-900 border border-slate-200 rounded-xl p-5">
    <div className="text-3xl font-display font-bold text-forge-orange">{value ?? "—"}</div>
    <div className="text-slate-500 text-sm mt-1">{label}</div>
  </div>
);

export default StatCard;
