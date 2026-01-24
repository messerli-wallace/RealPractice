import React from "react";
import { FormFieldProps } from "./types";

export function FormField({
  label,
  error,
  required,
  children,
  className = "",
}: FormFieldProps & { className?: string }) {
  return (
    <div className={`form-field mb-6 ${className}`}>
      <label className="block mb-3">
        <span className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </span>
        {children}
      </label>
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
    </div>
  );
}
