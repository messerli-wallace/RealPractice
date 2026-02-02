import React from "react";
import styles from "./CreateLogForm.module.css";
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
        className={`${styles.formInput} ${error ? styles.formInputError : ""}`}
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
