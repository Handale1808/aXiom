import { useState, useEffect } from "react";
import Modal from "./Modal";
import AnalysisResult from "./AnalysisResult";
import { formatDate } from "@/lib/utils/formatDate";
import type { IFeedback } from "@/models/Feedback";

interface FeedbackDetailModalProps {
  feedbackId: string | null;
  onClose: () => void;
}

export default function FeedbackDetailModal({
  feedbackId,
  onClose,
}: FeedbackDetailModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<IFeedback | null>(null);

  useEffect(() => {
    if (!feedbackId) return;

    setLoading(true);
    setError(null);
    setFeedback(null);

    fetch(`/api/feedback/${feedbackId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setFeedback(data.data);
        } else {
          setError("Failed to load feedback");
        }
      })
      .catch((err) => {
        setError(err.message || "Failed to load feedback");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [feedbackId]);

  if (!feedbackId) return null;

  return (
    <Modal isOpen={!!feedbackId} onClose={onClose}>
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
            Feedback Details
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            Close
          </button>
        </div>

        {loading && (
          <div className="py-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900 dark:border-zinc-700 dark:border-t-white"></div>
            <p className="mt-4 text-zinc-600 dark:text-zinc-400">
              Loading feedback details...
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                fetch(`/api/feedback/${feedbackId}`)
                  .then((res) => res.json())
                  .then((data) => {
                    if (data.success) {
                      setFeedback(data.data);
                    } else {
                      setError("Failed to load feedback");
                    }
                  })
                  .catch((err) => {
                    setError(err.message || "Failed to load feedback");
                  })
                  .finally(() => {
                    setLoading(false);
                  });
              }}
              className="mt-2 text-sm text-red-800 underline hover:text-red-900 dark:text-red-200 dark:hover:text-red-100"
            >
              Retry
            </button>
          </div>
        )}

        {feedback && !loading && !error && (
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Submitted on: {formatDate(feedback.createdAt)}
              </p>
              {feedback.email && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Submitted by: {feedback.email}
                </p>
              )}
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Feedback:
              </p>
              <p className="whitespace-pre-wrap text-zinc-900 dark:text-white">
                {feedback.text}
              </p>
            </div>

            <AnalysisResult analysis={feedback.analysis} />
          </div>
        )}
      </div>
    </Modal>
  );
}