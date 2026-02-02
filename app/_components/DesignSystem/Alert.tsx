import React from "react";
import styles from "./Alert.module.css";

export interface AlertProps {
  variant?: "success" | "error" | "warning" | "info";
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export function Alert({
  variant = "info",
  title,
  children,
  onClose,
  className = "",
}: AlertProps) {
  const variantClass =
    styles[`alert${variant.charAt(0).toUpperCase() + variant.slice(1)}`];

  const icons = {
    success: "✓",
    error: "✗",
    warning: "⚠",
    info: "ℹ",
  };

  return (
    <div
      className={`${styles.alert} ${variantClass} ${className}`}
      role="alert"
    >
      <div className={styles.alertContent}>
        <div className={styles.alertBody}>
          {title && (
            <h3 className={styles.alertTitle}>
              <span className={styles.icon}>{icons[variant]}</span>
              {title}
            </h3>
          )}
          <div className={styles.alertMessage}>{children}</div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className={styles.alertClose}
            aria-label="Close alert"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

// Export styles for composition
export { styles as alertStyles };
