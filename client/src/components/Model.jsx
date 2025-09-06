import React, { useEffect, useRef } from "react";

/**
 * Model (Modal) component
 * Props:
 * - isOpen: boolean — controls visibility
 * - onClose: () => void — called when user closes (ESC, overlay click, X button)
 * - title: string | ReactNode — header title
 * - children: ReactNode — body content
 * - size?: "sm" | "md" | "lg" — width preset (default: "md")
 */
const Model = ({ isOpen, onClose, title, children, size = "md" }) => {
  const dialogRef = useRef(null);

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClass =
    size === "sm"
      ? "max-w-md"
      : size === "lg"
      ? "max-w-4xl"
      : "max-w-2xl"; // md

  const stop = (e) => e.stopPropagation();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-title"
    >
      {/* Panel */}
      <div
        ref={dialogRef}
        onClick={stop}
        className={`w-full ${widthClass} mx-4 animate-in fade-in zoom-in-95 duration-150`}
      >
        <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200/60">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200/60">
            <h3 id="modal-title" className="text-base md:text-lg font-semibold text-gray-900">
              {title}
            </h3>
            <button
              type="button"
              aria-label="Close"
              className="text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full p-2 transition-colors"
              onClick={onClose}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 11-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-4 max-h-[80vh] overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Model;
