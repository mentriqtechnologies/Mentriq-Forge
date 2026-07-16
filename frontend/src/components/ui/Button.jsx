import React from "react";
import { motion } from "framer-motion";

const variants = {
  primary:
    "bg-forge-primary text-white hover:bg-forge-primary-dark shadow-md shadow-forge-primary/20 hover:shadow-lg hover:shadow-forge-primary/25",
  secondary:
    "bg-forge-secondary text-white hover:bg-forge-secondary-dark shadow-md shadow-forge-secondary/20 hover:shadow-lg hover:shadow-forge-secondary/25",
  outline:
    "border-2 border-forge-primary text-forge-primary hover:bg-forge-primary hover:text-white",
  ghost:
    "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  danger:
    "bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-600/20",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-8 py-3.5 text-base",
  xl: "px-10 py-4 text-lg",
};

const Button = ({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  fullWidth,
  disabled,
  loading,
  className = "",
  ...props
}) => {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 font-bold rounded-xl
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : Icon && iconPosition === "left" ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
      {!loading && Icon && iconPosition === "right" ? (
        <Icon className="w-4 h-4" />
      ) : null}
    </motion.button>
  );
};

export default Button;
