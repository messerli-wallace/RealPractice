import React from "react";
import { DurationInputProps } from "./types";
import { FormField } from "./FormField";

export function DurationInput({
  value,
  onChange,
  onBlur,
  error,
}: DurationInputProps) {
  return (
    <FormField label="Duration (minutes):" error={error} required>
      <input
        type="number"
        className={`w-full border-2 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${error ? "border-red-300 bg-red-50 focus:ring-red-500" : "border-gray-200 focus:ring-blue-500"}`}
        required
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        value={value}
        min="1"
        placeholder="Enter duration in minutes"
      />
    </FormField>
  );
}
