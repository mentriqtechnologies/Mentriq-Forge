import React from "react";

const Input = ({
  label,
  error,
  icon: Icon,
  className = "",
  ...props
}) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Icon className="w-4 h-4 text-slate-400" />
          </div>
        )}
        <input
          className={`
            w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5
            text-sm text-slate-900 placeholder:text-slate-400
            transition-all duration-200
            focus:outline-none focus:border-forge-primary focus:ring-2 focus:ring-forge-primary/20
            disabled:bg-slate-50 disabled:text-slate-500
            ${Icon ? "pl-10" : ""}
            ${error ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : ""}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
};

export default Input;
