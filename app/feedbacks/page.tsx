// app/feedbacks/page.tsx

"use client";
import { useState, useEffect } from "react";
import FeedbackList from "@/lib/components/FeedbackList";

export default function Feedbacks() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeedbacks = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/feedback");
      const data = await response.json();
      
      if (data.success) {
        setFeedbacks(data.data);
      } else {
        throw new Error("Failed to fetch feedbacks");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load feedbacks");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 p-4 font-sans dark:bg-black">
      <div className="mx-auto w-full max-w-4xl space-y-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              All Feedback
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              View and manage all submitted feedback
            </p>
          </div>
          
          <button
            onClick={fetchFeedbacks}
            disabled={isLoading}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            {isLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {isLoading && feedbacks.length === 0 && (
          <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-zinc-600 dark:text-zinc-400">Loading feedbacks...</p>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {!isLoading && feedbacks.length === 0 && !error && (
          <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-zinc-600 dark:text-zinc-400">
              No feedback submissions yet. Be the first to submit!
            </p>
          </div>
        )}

        {feedbacks.length > 0 && <FeedbackList feedbacks={feedbacks} />}
      </div>
    </div>
  );
}