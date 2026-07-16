import React from "react";
import { ChevronDown } from "lucide-react";

const Select = ({
  label,
  error,
  options = [],
  placeholder,
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
        <select
          className={`
            w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5
            text-sm text-slate-900
            transition-all duration-200 appearance-none
            focus:outline-none focus:border-forge-primary focus:ring-2 focus:ring-forge-primary/20
            disabled:bg-slate-50 disabled:text-slate-500
            ${error ? "border-red-400" : ""}
            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>{placeholder}</option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
};

export default Select;
