"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
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
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to the centralized error logging system
    logError("ErrorBoundary caught an error", error, {
      component: "ErrorBoundary",
      metadata: {
        errorInfo: {
          componentStack: errorInfo.componentStack,
        },
      },
    });

    // Call the optional error handler prop
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          <h2 className="text-lg font-bold mb-2">Something went wrong</h2>
          <p className="mb-2">We apologize for the inconvenience.</p>
          <p className="text-sm">
            {this.state.error && this.state.error.message && (
              <span>Error: {this.state.error.message}</span>
            )}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Convenience wrapper for functional components
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
