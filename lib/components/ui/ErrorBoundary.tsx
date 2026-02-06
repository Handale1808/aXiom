"use client";

import { Component, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const requestId = (window as any).__lastRequestId || "unknown";

    console.error("ErrorBoundary caught an error:", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      requestId,
      timestamp: new Date().toISOString(),
    });

    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="relative border-2 border-red-500/50 bg-red-950/20 p-4 sm:p-6 md:p-8 backdrop-blur-sm">
          <div className="absolute -left-px -top-px h-3 w-3 sm:h-4 sm:w-4 border-l-2 border-t-2 border-red-500" />
          <div className="absolute -right-px -top-px h-3 w-3 sm:h-4 sm:w-4 border-r-2 border-t-2 border-red-500" />
          <div className="absolute -bottom-px -left-px h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-l-2 border-red-500" />
          <div className="absolute -bottom-px -right-px h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-r-2 border-red-500" />

          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="h-3 w-3 animate-pulse bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
            <div className="text-[10px] sm:text-xs font-bold tracking-wider text-red-400">
              [COMPONENT_ERROR]
            </div>
          </div>

          <p className="text-xs sm:text-sm text-red-200 mb-3">
            A component has encountered an error and cannot be displayed.
          </p>

          {this.state.error && (
            <p className="text-[10px] sm:text-xs text-red-300/70 font-mono mb-3 sm:mb-4">
              {this.state.error.message}
            </p>
          )}

          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="w-full sm:w-auto border border-red-500 bg-black px-4 py-2 text-xs font-bold tracking-wider text-red-400 transition-all hover:bg-red-500 hover:text-black min-h-[44px]"
          >
            RETRY
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
