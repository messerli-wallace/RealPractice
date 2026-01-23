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
        className={`border border-solid ${error ? "border-red-500" : "border-grey"}`}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        cols={60}
      />
    </FormField>
  );
}
