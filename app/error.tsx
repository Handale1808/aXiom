"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="relative min-h-screen bg-black p-4 font-mono flex items-center justify-center">
      <div className="relative max-w-2xl w-full">
        <div className="relative border-2 border-red-500/50 bg-red-950/20 p-12 text-center backdrop-blur-sm">
          <div className="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-red-500" />
          <div className="absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2 border-red-500" />
          <div className="absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-red-500" />
          <div className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-red-500" />

          <div className="mb-6 flex items-center justify-center gap-3">
            <div className="h-3 w-3 animate-pulse bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
            <div className="text-sm tracking-[0.3em] text-red-400">
              [CRITICAL_ERROR]
            </div>
          </div>

          <h2 className="text-2xl font-bold tracking-wider text-red-400 mb-4">
            SYSTEM_MALFUNCTION
          </h2>

          <p className="text-red-200 mb-2">
            The xenomorphic analysis system has encountered an unexpected error.
          </p>

          <p className="text-red-300/70 text-sm mb-6 font-mono">
            {error.message || "Unknown error occurred"}
          </p>

          <div className="flex gap-4 justify-center">
            <button
              onClick={reset}
              className="border-2 border-red-500 bg-black px-8 py-3 text-sm font-bold tracking-wider text-red-400 transition-all hover:bg-red-500 hover:text-black hover:shadow-[0_0_20px_rgba(239,68,68,0.5)]"
            >
              ATTEMPT_RECOVERY
            </button>

            <button
              onClick={() => (window.location.href = "/")}
              className="border-2 border-[#30D6D6] bg-black px-8 py-3 text-sm font-bold tracking-wider text-[#30D6D6] transition-all hover:bg-[#30D6D6] hover:text-black hover:shadow-[0_0_20px_rgba(48,214,214,0.5)]"
            >
              RETURN_HOME
            </button>
          </div>

          {process.env.NODE_ENV === "development" && (
            <details className="mt-8 text-left">
              <summary className="cursor-pointer text-xs text-red-400/70 hover:text-red-400 mb-2">
                [DEBUG_INFO]
              </summary>
              <pre className="text-xs text-red-300/50 bg-black/50 p-4 rounded border border-red-500/30 overflow-auto max-h-40">
                {error.stack}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}