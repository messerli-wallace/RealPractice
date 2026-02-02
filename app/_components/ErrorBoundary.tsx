"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import styles from "./ErrorBoundary.module.css";
import { logError } from "../../lib/utils/errorLogger";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logError("ErrorBoundary caught an error", error, {
      component: "ErrorBoundary",
      metadata: {
        errorInfo: {
          componentStack: errorInfo.componentStack,
        },
      },
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className={styles.errorBoundary}>
          <h2 className={styles.errorTitle}>Something went wrong</h2>
          <p className={styles.errorMessage}>
            We apologize for the inconvenience.
          </p>
          <p className={styles.errorDetail}>
            {this.state.error && this.state.error.message && (
              <span>Error: {this.state.error.message}</span>
            )}
          </p>
          <button
            onClick={() => window.location.reload()}
            className={styles.reloadButton}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export function withErrorBoundary<
  P extends Record<string, unknown> = Record<string, unknown>,
>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
): React.ComponentType<P> {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback} onError={onError}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
