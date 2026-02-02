import React from "react";
import styles from "./CreateLogForm.module.css";
import { FormFieldProps } from "./types";

export function FormField({
  label,
  error,
  required,
  children,
  className = "",
}: FormFieldProps & { className?: string }) {
  return (
    <div className={`${styles.formField} ${className}`}>
      <label className={styles.formFieldLabel}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      {children}
      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
}
