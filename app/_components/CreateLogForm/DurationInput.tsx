import React from "react";
import styles from "./CreateLogForm.module.css";
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
        className={`${styles.formInput} ${error ? styles.formInputError : ""}`}
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
