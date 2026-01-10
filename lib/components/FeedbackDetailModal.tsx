import { useState, useEffect } from "react";
import Modal from "./Modal";
import AnalysisResult from "./AnalysisResult";
import { formatDate } from "@/lib/utils/formatDate";
import type { IFeedback } from "@/models/Feedback";
import { apiFetch } from "@/lib/apiClient";
import { fetchCatByIdAction } from "@/lib/services/catActions";
import { ICat } from "@/models/Cats";
import { IAbility } from "@/models/Ability";
import CatDetails from "./CatDetails";

interface FeedbackDetailModalProps {
  feedbackId: string | null;
  onClose: () => void;
  onDelete: (id: string) => void;
  onUpdateNextAction: (id: string, newNextAction: string) => void;
  isDeleting: boolean;
  isUpdating: boolean;
}

export default function FeedbackDetailModal({
  feedbackId,
  onClose,
  onDelete,
  onUpdateNextAction,
  isDeleting,
  isUpdating,
}: FeedbackDetailModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<IFeedback | null>(null);
  const [isEditingNextAction, setIsEditingNextAction] = useState(false);
  const [editedNextAction, setEditedNextAction] = useState("");
  const [nextActionError, setNextActionError] = useState<string | null>(null);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [catData, setCatData] = useState<{
    cat: ICat | null;
    abilities: IAbility[];
  } | null>(null);
  const [isLoadingCat, setIsLoadingCat] = useState(false);

  const handleViewCat = async () => {
    if (!feedback?.catId) return;

    setIsLoadingCat(true);
    try {
      const data = await fetchCatByIdAction(feedback.catId);
      setCatData(data);
      setIsCatModalOpen(true);
    } catch (error) {
      console.error("Failed to load cat details:", error);
    } finally {
      setIsLoadingCat(false);
    }
  };

  const validateNextAction = (value: string): string | null => {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return "Next action cannot be empty";
    }
    if (trimmed.length < 10) {
      return "Next action must be at least 10 characters";
    }
    if (trimmed.length > 500) {
      return "Next action must not exceed 500 characters";
    }
    return null;
  };

  const handleEditStart = () => {
    if (feedback?.analysis.nextAction) {
      setEditedNextAction(feedback.analysis.nextAction);
      setIsEditingNextAction(true);
      setNextActionError(null);
    }
  };

  const handleEditCancel = () => {
    setIsEditingNextAction(false);
    setEditedNextAction("");
    setNextActionError(null);
  };

  const handleEditSave = (newValue: string) => {
    const validationError = validateNextAction(newValue);
    if (validationError) {
      setNextActionError(validationError);
      return;
    }

    if (feedbackId) {
      onUpdateNextAction(feedbackId, newValue.trim());
    }
  };

  const handleNextActionChange = (value: string) => {
    setEditedNextAction(value);
    if (nextActionError) {
      setNextActionError(null);
    }
  };

  useEffect(() => {
    if (!feedbackId) return;

    setLoading(true);
    setError(null);
    setFeedback(null);

    apiFetch<{ success: true; data: IFeedback }>(`/api/feedback/${feedbackId}`)
      .then((data) => {
        setFeedback(data.data);
      })
      .catch((err: Error) => {
        setError(err.message || "Failed to load feedback");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [feedbackId]);

  useEffect(() => {
    if (!isUpdating && isEditingNextAction && feedback) {
      setIsEditingNextAction(false);
      setEditedNextAction("");
      setNextActionError(null);
    }
  }, [isUpdating, isEditingNextAction, feedback]);

  if (!feedbackId) {
    return null;
  }

  return (
    <Modal isOpen={!!feedbackId} onClose={onClose} showDefaultClose={false}>
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
          <div className="flex gap-2">
            <button
              onClick={() => feedbackId && onDelete(feedbackId)}
              disabled={isDeleting}
              className="border-2 border-red-500 bg-black px-6 py-2 text-sm font-bold tracking-wider text-red-400 transition-all hover:bg-red-500 hover:text-black hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isDeleting && (
                <div className="h-2 w-2 animate-pulse bg-red-400" />
              )}
              {isDeleting ? "DELETING..." : "DELETE"}
            </button>
            <button
              onClick={onClose}
              className="border-2 border-[#30D6D6] bg-black px-6 py-2 text-sm font-bold tracking-wider text-[#30D6D6] transition-all hover:bg-[#30D6D6] hover:text-black hover:shadow-[0_0_15px_rgba(48,214,214,0.5)]"
            >
              CLOSE
            </button>
          </div>
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
                apiFetch<{ success: true; data: IFeedback }>(
                  `/api/feedback/${feedbackId}`
                )
                  .then((data) => {
                    setFeedback(data.data);
                  })
                  .catch((err: Error) => {
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

            {feedback.catId && feedback.catName && (
              <div className="border-2 border-[#30D6D6]/30 bg-black/30 p-4">
                <div className="text-xs font-bold tracking-wider text-[#006694] mb-3">
                  [ASSOCIATED_SPECIMEN]
                </div>
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 border border-[#30D6D6]/50 flex items-center justify-center"
                    dangerouslySetInnerHTML={{
                      __html: feedback.catSvgImage || "",
                    }}
                  />
                  <div className="flex-1">
                    <div className="text-[#30D6D6] font-bold tracking-wider">
                      {feedback.catName}
                    </div>
                  </div>
                  <button
                    onClick={handleViewCat}
                    disabled={isLoadingCat}
                    className="border-2 border-[#30D6D6] bg-black px-4 py-2 text-xs font-bold tracking-wider text-[#30D6D6] transition-all hover:bg-[#30D6D6] hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingCat ? "LOADING..." : "VIEW_DETAILS"}
                  </button>
                </div>
              </div>
            )}

            <div className="relative border-2 border-[#30D6D6]/30 bg-black/50 p-5 backdrop-blur-sm">
              <div className="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-[#30D6D6]" />
              <div className="absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2 border-[#30D6D6]" />
              <div className="absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-[#30D6D6]" />
              <div className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-[#30D6D6]" />

              <p className="whitespace-pre-wrap text-cyan-100/90 leading-relaxed">
                {feedback.text}
              </p>
            </div>

            <AnalysisResult
              analysis={feedback.analysis}
              isEditingNextAction={isEditingNextAction}
              editedNextAction={editedNextAction}
              onEditStart={handleEditStart}
              onEditCancel={handleEditCancel}
              onEditSave={handleEditSave}
              onNextActionChange={handleNextActionChange}
              isUpdating={isUpdating}
              nextActionError={nextActionError}
            />
          </div>
        )}
      </div>
      {isCatModalOpen && catData?.cat && (
        <Modal isOpen={isCatModalOpen} onClose={() => setIsCatModalOpen(false)}>
          <CatDetails
            cat={catData.cat}
            abilities={catData.abilities}
            onClose={() => setIsCatModalOpen(false)}
            showAddToCart={false}
          />
        </Modal>
      )}
    </Modal>
  );
}
