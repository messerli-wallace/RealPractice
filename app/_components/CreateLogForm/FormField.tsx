import React from "react";
import { FormFieldProps } from "./types";

export function FormField({
  label,
  error,
  required,
  children,
}: FormFieldProps) {
  return (
    <label>
      <span>
        {label}
        {required && "*"}
      </span>
      {children}
      {error && <div className="text-red-500 text-sm">{error}</div>}
    </label>
  );
}
