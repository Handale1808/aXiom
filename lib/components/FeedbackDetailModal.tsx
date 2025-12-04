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
        <div className="mb-6 flex items-center justify-between border-b-2 border-[#30D6D6]/30 pb-4">
          <div>
            <h2 className="text-xl font-bold tracking-wider text-[#30D6D6] drop-shadow-[0_0_10px_rgba(48,214,214,0.5)]">
              FEEDBACK_DETAILS
            </h2>
            <p className="mt-1 text-xs tracking-widest text-[#006694] font-bold">
              [RECORD_VIEWER]
            </p>
          </div>
          <button
            onClick={onClose}
            className="border-2 border-[#30D6D6] bg-black px-6 py-2 text-sm font-bold tracking-wider text-[#30D6D6] transition-all hover:bg-[#30D6D6] hover:text-black hover:shadow-[0_0_15px_rgba(48,214,214,0.5)]"
          >
            CLOSE
          </button>
        </div>

        {loading && (
          <div className="relative border-2 border-[#30D6D6]/50 bg-[#30D6D6]/10 p-12 text-center">
            <div className="absolute right-4 top-4 h-3 w-3 animate-pulse bg-[#30D6D6] shadow-[0_0_15px_rgba(48,214,214,0.9)]" />
            <div className="mb-3 text-xs tracking-[0.3em] text-[#30D6D6]/70">
              LOADING_RECORD
            </div>
            <div className="flex justify-center gap-1">
              <div
                className="h-2 w-2 animate-pulse bg-[#30D6D6] shadow-[0_0_10px_rgba(48,214,214,0.8)]"
                style={{ animationDelay: "0ms" }}
              />
              <div
                className="h-2 w-2 animate-pulse bg-[#30D6D6] shadow-[0_0_10px_rgba(48,214,214,0.8)]"
                style={{ animationDelay: "150ms" }}
              />
              <div
                className="h-2 w-2 animate-pulse bg-[#30D6D6] shadow-[0_0_10px_rgba(48,214,214,0.8)]"
                style={{ animationDelay: "300ms" }}
              />
            </div>
            <p className="mt-3 text-sm text-cyan-100/60">
              Retrieving feedback data...
            </p>
          </div>
        )}

        {error && (
          <div className="relative border-2 border-red-500/50 bg-red-950/30 p-6">
            <div className="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-red-500" />
            <div className="absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2 border-red-500" />
            <div className="absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-red-500" />
            <div className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-red-500" />

            <div className="flex items-center gap-3 mb-3">
              <div className="h-3 w-3 animate-pulse bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
              <div className="text-xs font-bold tracking-wider text-red-400">
                [LOAD_ERROR]
              </div>
            </div>
            <p className="text-sm text-red-300 mb-3">{error}</p>
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
              className="border border-red-500 bg-black px-4 py-2 text-xs font-bold tracking-wider text-red-400 transition-all hover:bg-red-500 hover:text-black"
            >
              RETRY_LOAD
            </button>
          </div>
        )}

        {feedback && !loading && !error && (
          <div className="space-y-6">
            <div className="border-2 border-[#006694]/30 bg-black/30 p-4">
              <div className="space-y-1 text-sm text-cyan-100/70">
                <p>
                  <span className="text-[#006694]">TIMESTAMP:</span>{" "}
                  {formatDate(feedback.createdAt)}
                </p>
                {feedback.email && (
                  <p>
                    <span className="text-[#006694]">SUBMITTER:</span>{" "}
                    {feedback.email}
                  </p>
                )}
              </div>
            </div>

            <div className="relative border-2 border-[#30D6D6]/30 bg-black/50 p-5 backdrop-blur-sm">
              <div className="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-[#30D6D6]" />
              <div className="absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2 border-[#30D6D6]" />
              <div className="absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-[#30D6D6]" />
              <div className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-[#30D6D6]" />

              <p className="whitespace-pre-wrap text-cyan-100/90 leading-relaxed">
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
