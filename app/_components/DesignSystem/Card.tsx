import React from "react";
import styles from "./Card.module.css";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "bordered";
  padding?: "none" | "sm" | "md" | "lg";
}

export function Card({
  variant = "default",
  padding = "md",
  className = "",
  children,
  ...props
}: CardProps) {
  const classes = [
    styles.card,
    styles[`card${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
    padding !== "none"
      ? styles[`padding${padding.charAt(0).toUpperCase() + padding.slice(1)}`]
      : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}

// Export styles for composition
export { styles as cardStyles };
