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
  // Base classes
  const baseClasses = "p-4 rounded-md";

  // Variant classes
  const variantClasses = {
    success: "bg-green-100 text-green-800 border border-green-200",
    error: "bg-red-100 text-red-800 border border-red-200",
    warning: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    info: "bg-blue-100 text-blue-800 border border-blue-200",
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
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
