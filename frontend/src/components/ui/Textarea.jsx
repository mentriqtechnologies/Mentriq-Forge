import React, { useId } from "react";

const Textarea = ({
  label,
  name,
  error,
  help,
  className = "",
  required,
  rows = 4,
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
      <textarea
        id={fieldId}
        name={name}
        rows={rows}
        required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`
          w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5
          text-sm text-slate-900 placeholder:text-slate-400
          transition-all duration-200
          focus:outline-none focus:border-forge-primary focus:ring-2 focus:ring-forge-primary/20
          disabled:bg-slate-50 disabled:text-slate-500
          ${error ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : ""}
          ${className}
        `}
        {...props}
      />
      {help && !error && (
        <p id={`${fieldId}-help`} className="text-xs text-slate-400 mt-1">{help}</p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
};

export default Textarea;