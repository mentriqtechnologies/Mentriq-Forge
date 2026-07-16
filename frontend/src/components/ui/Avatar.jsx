import React from "react";

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-xl",
};

const Avatar = ({ src, name, size = "md", className = "" }) => {
  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`rounded-full object-cover ${sizeClasses[size]} ${className}`}
      />
    );
  }

  return (
    <div
      className={`
        rounded-full bg-gradient-to-br from-forge-primary to-forge-primary-dark
        text-white font-bold flex items-center justify-center
        ${sizeClasses[size]} ${className}
      `}
    >
      {initials}
    </div>
  );
};

export default Avatar;
