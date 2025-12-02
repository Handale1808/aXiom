// app/page.tsx

"use client";
import { useState, useEffect } from "react";
import TextSubmit from "@/lib/components/TextSubmit";

export default function Home() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const response = await fetch("/api/feedback");
      const data = await response.json();
      if (data.success) {
        setFeedbacks(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch feedbacks:", err);
    }
  };

  const handleSubmit = async (text: string) => {
    setIsSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to submit feedback");
      }

      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 font-sans dark:bg-black">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Feedback Analyzer
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Submit your feedback and get AI-powered analysis
          </p>
        </div>

        <TextSubmit
          onSubmit={handleSubmit}
          placeholder="Enter your feedback..."
        />

        {isSubmitting && (
          <div className="rounded-lg border border-zinc-200 bg-white p-4 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-zinc-600 dark:text-zinc-400">Analyzing...</p>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {result && (
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
              Analysis Results
            </h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Summary:
                </span>
                <p className="mt-1 text-zinc-900 dark:text-white">
                  {result.analysis.summary}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Sentiment:
                </span>
                <p className="mt-1 capitalize text-zinc-900 dark:text-white">
                  {result.analysis.sentiment}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Priority:
                </span>
                <p className="mt-1 text-zinc-900 dark:text-white">
                  {result.analysis.priority}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Tags:
                </span>
                <div className="mt-1 flex flex-wrap gap-2">
                  {result.analysis.tags.map((tag: string, i: number) => (
                    <span
                      key={i}
                      className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Next Action:
                </span>
                <p className="mt-1 text-zinc-900 dark:text-white">
                  {result.analysis.nextAction}
                </p>
              </div>
            </div>
          </div>
        )}
        {feedbacks.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 text-xl font-bold text-zinc-900 dark:text-white">
              All Feedback
            </h2>
            <div className="space-y-4">
              {feedbacks.map((feedback) => (
                <div
                  key={feedback._id}
                  className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <p className="text-zinc-900 dark:text-white">
                    {feedback.text}
                  </p>
                  <div className="mt-2 flex gap-2 text-xs text-zinc-500">
                    <span className="capitalize">
                      {feedback.analysis.sentiment}
                    </span>
                    <span>{feedback.analysis.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
