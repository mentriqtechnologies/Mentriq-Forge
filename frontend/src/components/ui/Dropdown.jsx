import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Dropdown = ({ trigger, children, align = "right", label = "Menu" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  const menuId = React.useId();

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        ref.current?.querySelector("[aria-haspopup]")?.focus();
      }
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const alignClasses = {
    left: "left-0",
    right: "right-0",
  };

  const toggle = (e) => {
    setIsOpen((s) => !s);
  };

  const triggerEl =
    trigger && React.isValidElement(trigger)
      ? React.cloneElement(trigger, {
          onClick: (e) => {
            trigger.props.onClick?.(e);
            toggle(e);
          },
          "aria-haspopup": "menu",
          "aria-expanded": isOpen,
          "aria-controls": isOpen ? menuId : undefined,
        })
      : trigger;

  return (
    <div ref={ref} className="relative inline-block">
      {triggerEl}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={menuId}
            role="menu"
            aria-label={label}
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.1 }}
            className={`
              absolute z-50 mt-2 w-56 bg-white rounded-xl border border-slate-200
              shadow-elevated py-1 ${alignClasses[align]}
            `}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const DropdownItem = ({ children, icon: Icon, onClick, danger }) => (
  <button
    type="button"
    role="menuitem"
    onClick={onClick}
    className={`
      w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors
      ${danger ? "text-red-600 hover:bg-red-50" : "text-slate-700 hover:bg-slate-50"}
    `}
  >
    {Icon && <Icon className="w-4 h-4" aria-hidden="true" />}
    {children}
  </button>
);

export const DropdownDivider = () => <div className="my-1 border-t border-slate-200" aria-hidden="true" />;

export default Dropdown;