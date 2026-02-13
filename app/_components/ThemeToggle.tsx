"use client";

import React from "react";
import styles from "./ThemeToggle/ThemeToggle.module.css";
import { useTheme } from "../context/ThemeContext";

export interface ThemeToggleProps {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "ghost";
  className?: string;
}

export function ThemeToggle({
  size = "md",
  variant = "default",
  className = "",
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  const classes = [
    styles.themeToggle,
    styles[`themeToggle${size.charAt(0).toUpperCase() + size.slice(1)}`],
    styles[`themeToggle${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} onClick={toggleTheme} aria-label="Toggle theme">
      {theme === "light" ? (
        <svg
          className={styles.icon}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        <svg
          className={styles.icon}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  );
}
