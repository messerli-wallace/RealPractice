import React from "react";
import { DescriptionInputProps } from "./types";
import { FormField } from "./FormField";

export function DescriptionInput({
  value,
  onChange,
  onBlur,
  error,
}: DescriptionInputProps) {
  return (
    <FormField label="Description:" error={error} required>
      <textarea
        className={`w-full border-2 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${error ? "border-red-300 bg-red-50 focus:ring-red-500" : "border-gray-200 focus:ring-blue-500"}`}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        rows={5}
        placeholder="Describe your practice session..."
      />
    </FormField>
  );
}
