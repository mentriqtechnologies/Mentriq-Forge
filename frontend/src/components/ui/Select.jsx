import React, { useId } from "react";
import { ChevronDown } from "lucide-react";

const Select = ({
  label,
  name,
  error,
  help,
  options = [],
  placeholder,
  className = "",
  required,
  ...props
}) => {
  const fieldId = useId();
  const errorId = `${fieldId}-error`;
  const helpId = `${fieldId}-help`;
  const describedBy = [error ? errorId : null, help ? helpId : null]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={fieldId} className="block text-sm font-medium text-slate-700">
          {label}
          {required && (
            <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>
          )}
        </label>
      )}
      <div className="relative">
        <select
          id={fieldId}
          name={name}
          required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`
            w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5
            text-sm text-slate-900
            transition-all duration-200 appearance-none pr-10
            focus:outline-none focus:border-forge-primary focus:ring-2 focus:ring-forge-primary/20
            disabled:bg-slate-50 disabled:text-slate-500
            ${error ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : ""}
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
        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" aria-hidden="true" />
      </div>
      {help && !error && (
        <p id={helpId} className="text-xs text-slate-400 mt-1">{help}</p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
};

export default Select;