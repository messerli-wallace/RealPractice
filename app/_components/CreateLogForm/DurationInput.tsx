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
      <textarea
        className={`border border-solid ${error ? "border-red-500" : "border-grey"}`}
        required
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        value={value}
        cols={4}
      />
    </FormField>
  );
}
