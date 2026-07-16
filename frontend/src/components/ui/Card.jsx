import React from "react";
import { motion } from "framer-motion";

const Card = ({
  children,
  className = "",
  hover = true,
  padding = true,
  glass = false,
  onClick,
  ...props
}) => {
  const Component = onClick ? motion.button : motion.div;

  return (
    <Component
      whileHover={hover ? { y: -2 } : {}}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={`
        rounded-2xl border border-slate-200/80 bg-white
        transition-all duration-200
        ${hover ? "hover:shadow-elevated" : ""}
        ${padding ? "p-5 sm:p-6" : ""}
        ${glass ? "bg-white/80 backdrop-blur-md" : ""}
        ${onClick ? "cursor-pointer text-left w-full" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Card;
