import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "bordered";
  padding?: "none" | "sm" | "md" | "lg";
}

export function Card({
  variant = "default",
  padding = "md",
  className = "",
  children,
  ...props
}: CardProps) {
  // Base classes
  const baseClasses = "rounded-lg bg-white";

  // Variant classes
  const variantClasses = {
    default: "shadow-sm",
    elevated: "shadow-md",
    bordered: "border border-gray-200",
  };

  // Padding classes
  const paddingClasses = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
