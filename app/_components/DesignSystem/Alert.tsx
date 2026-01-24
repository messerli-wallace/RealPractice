import React from "react";

export interface AlertProps {
  variant?: "success" | "error" | "warning" | "info";
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export function Alert({
  variant = "info",
  title,
  children,
  onClose,
  className = "",
}: AlertProps) {
  return (
    <div
      className={`p-4 rounded-md bg-${variant}-100 text-${variant}-800 border border-${variant}-200 ${className}`}
      role="alert"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {title && (
            <h3 className="font-medium mb-1">
              {variant === "success" && <span className="mr-2">✓</span>}
              {variant === "error" && <span className="mr-2">✗</span>}
              {variant === "warning" && <span className="mr-2">⚠</span>}
              {variant === "info" && <span className="mr-2">ℹ</span>}
              {title}
            </h3>
          )}
          <div className="text-sm">{children}</div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 text-xl font-bold hover:opacity-70 transition-opacity"
            aria-label="Close alert"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
