"use client";

import React from "react";
import styles from "./Textarea.module.css";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export function Textarea({
  label,
  error,
  helperText,
  required,
  id,
  className = "",
  ...props
}: TextareaProps) {
  const generatedId = React.useId();
  const textareaId = id || `textarea-${generatedId}`;

  return (
    <div className={`${styles.textareaGroup} ${className}`}>
      {label && (
        <label htmlFor={textareaId} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}

      <textarea
        id={textareaId}
        className={`${styles.textarea} ${error ? styles.textareaError : ""}`}
        rows={4}
        aria-invalid={!!error}
        aria-describedby={
          error
            ? `${textareaId}-error`
            : helperText
              ? `${textareaId}-helper`
              : undefined
        }
        {...props}
      />

      {helperText && !error && (
        <p id={`${textareaId}-helper`} className={styles.helperText}>
          {helperText}
        </p>
      )}

      {error && (
        <p id={`${textareaId}-error`} className={styles.errorText} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// Export styles for composition
export { styles as textareaStyles };
