import { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import AnalysisResult from "../AnalysisResult";
import { formatDate } from "@/lib/utils/formatDate";
import type { IFeedback } from "@/models/Feedback";
import { apiFetch } from "@/lib/apiClient";
import { fetchCatByIdAction } from "@/lib/services/catActions";
import { ICat } from "@/models/Cats";
import { IAbility } from "@/models/Ability";
import CatDetails from "../cat-display/CatDetails";
import { useResponsiveScaling } from "@/lib/hooks/useResponsiveScaling";

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
  const scaledValues = useResponsiveScaling();
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
      <div style={{ padding: `${scaledValues.padding.large}px` }}>
        <div 
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b-2 border-[#30D6D6]/30"
          style={{
            marginBottom: `${scaledValues.spacing.marginMedium}px`,
            paddingBottom: `${scaledValues.spacing.marginSmall}px`,
            gap: `${scaledValues.spacing.gapMedium}px`
          }}
        >
          <div>
            <h2 
              className="font-bold tracking-wider text-[#30D6D6] drop-shadow-[0_0_10px_rgba(48,214,214,0.5)]"
              style={{ fontSize: `${scaledValues.text.mediumHeading}px` }}
            >
              FEEDBACK_DETAILS
            </h2>
            <p 
              className="tracking-widest text-[#006694] font-bold"
              style={{ 
                marginTop: `${scaledValues.spacing.marginSmall / 2}px`,
                fontSize: `${scaledValues.text.extraSmall}px`
              }}
            >
              [RECORD_VIEWER]
            </p>
          </div>
          <div 
            className="flex flex-col sm:flex-row w-full sm:w-auto"
            style={{ gap: `${scaledValues.spacing.gapSmall}px` }}
          >
            <button
              onClick={() => feedbackId && onDelete(feedbackId)}
              disabled={isDeleting}
              className="border-2 border-red-500 bg-black font-bold tracking-wider text-red-400 transition-all hover:bg-red-500 hover:text-black hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-h-[44px]"
              style={{
                paddingLeft: `${scaledValues.padding.buttonX}px`,
                paddingRight: `${scaledValues.padding.buttonX}px`,
                paddingTop: `${scaledValues.input.paddingY}px`,
                paddingBottom: `${scaledValues.input.paddingY}px`,
                fontSize: `${scaledValues.text.extraSmall}px`,
                gap: `${scaledValues.spacing.gapSmall}px`
              }}
            >
              {isDeleting && (
                <div 
                  className="animate-pulse bg-red-400"
                  style={{
                    height: `${scaledValues.interactive.loadingIndicator}px`,
                    width: `${scaledValues.interactive.loadingIndicator}px`
                  }}
                />
              )}
              {isDeleting ? "DELETING..." : "DELETE"}
            </button>
            <button
              onClick={onClose}
              className="border-2 border-[#30D6D6] bg-black font-bold tracking-wider text-[#30D6D6] transition-all hover:bg-[#30D6D6] hover:text-black hover:shadow-[0_0_15px_rgba(48,214,214,0.5)] min-h-[44px]"
              style={{
                paddingLeft: `${scaledValues.padding.buttonX}px`,
                paddingRight: `${scaledValues.padding.buttonX}px`,
                paddingTop: `${scaledValues.input.paddingY}px`,
                paddingBottom: `${scaledValues.input.paddingY}px`,
                fontSize: `${scaledValues.text.extraSmall}px`
              }}
            >
              CLOSE
            </button>
          </div>
        </div>

        {loading && (
          <div 
            className="relative border-2 border-[#30D6D6]/50 bg-[#30D6D6]/10 text-center"
            style={{ padding: `${scaledValues.padding.extraLarge}px` }}
          >
            <div 
              className="absolute animate-pulse bg-[#30D6D6] shadow-[0_0_15px_rgba(48,214,214,0.9)]"
              style={{
                right: `${scaledValues.spacing.gapSmall}px`,
                top: `${scaledValues.spacing.gapSmall}px`,
                height: `${scaledValues.interactive.loadingIndicator}px`,
                width: `${scaledValues.interactive.loadingIndicator}px`
              }}
            />
            <div 
              className="tracking-[0.3em] text-[#30D6D6]/70"
              style={{ 
                marginBottom: `${scaledValues.spacing.marginSmall}px`,
                fontSize: `${scaledValues.text.extraSmall}px`
              }}
            >
              LOADING_RECORD
            </div>
            <div 
              className="flex justify-center"
              style={{ gap: `${scaledValues.spacing.gapSmall / 2}px` }}
            >
              <div
                className="animate-pulse bg-[#30D6D6] shadow-[0_0_10px_rgba(48,214,214,0.8)]"
                style={{ 
                  animationDelay: "0ms",
                  height: `${scaledValues.interactive.loadingIndicator}px`,
                  width: `${scaledValues.interactive.loadingIndicator}px`
                }}
              />
              <div
                className="animate-pulse bg-[#30D6D6] shadow-[0_0_10px_rgba(48,214,214,0.8)]"
                style={{ 
                  animationDelay: "150ms",
                  height: `${scaledValues.interactive.loadingIndicator}px`,
                  width: `${scaledValues.interactive.loadingIndicator}px`
                }}
              />
              <div
                className="animate-pulse bg-[#30D6D6] shadow-[0_0_10px_rgba(48,214,214,0.8)]"
                style={{ 
                  animationDelay: "300ms",
                  height: `${scaledValues.interactive.loadingIndicator}px`,
                  width: `${scaledValues.interactive.loadingIndicator}px`
                }}
              />
            </div>
            <p 
              className="text-cyan-100/60"
              style={{ 
                marginTop: `${scaledValues.spacing.marginSmall}px`,
                fontSize: `${scaledValues.button.fontSize}px`
              }}
            >
              Retrieving feedback data...
            </p>
          </div>
        )}

        {error && (
          <div 
            className="relative border-2 border-red-500/50 bg-red-950/30"
            style={{ padding: `${scaledValues.padding.large}px` }}
          >
            <div 
              className="absolute -left-px -top-px border-l-2 border-t-2 border-red-500"
              style={{ 
                height: `${scaledValues.container.cornerSize}px`,
                width: `${scaledValues.container.cornerSize}px`
              }}
            />
            <div 
              className="absolute -right-px -top-px border-r-2 border-t-2 border-red-500"
              style={{ 
                height: `${scaledValues.container.cornerSize}px`,
                width: `${scaledValues.container.cornerSize}px`
              }}
            />
            <div 
              className="absolute -bottom-px -left-px border-b-2 border-l-2 border-red-500"
              style={{ 
                height: `${scaledValues.container.cornerSize}px`,
                width: `${scaledValues.container.cornerSize}px`
              }}
            />
            <div 
              className="absolute -bottom-px -right-px border-b-2 border-r-2 border-red-500"
              style={{ 
                height: `${scaledValues.container.cornerSize}px`,
                width: `${scaledValues.container.cornerSize}px`
              }}
            />

            <div 
              className="flex items-center"
              style={{ 
                gap: `${scaledValues.spacing.gapMedium}px`,
                marginBottom: `${scaledValues.spacing.marginSmall}px`
              }}
            >
              <div 
                className="animate-pulse bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"
                style={{
                  height: `${scaledValues.interactive.loadingIndicator}px`,
                  width: `${scaledValues.interactive.loadingIndicator}px`
                }}
              />
              <div 
                className="font-bold tracking-wider text-red-400"
                style={{ fontSize: `${scaledValues.text.extraSmall}px` }}
              >
                [LOAD_ERROR]
              </div>
            </div>
            <p 
              className="text-red-300"
              style={{ 
                fontSize: `${scaledValues.button.fontSize}px`,
                marginBottom: `${scaledValues.spacing.marginSmall}px`
              }}
            >
              {error}
            </p>
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
              className="w-full sm:w-auto border border-red-500 bg-black font-bold tracking-wider text-red-400 transition-all hover:bg-red-500 hover:text-black min-h-[44px]"
              style={{
                paddingLeft: `${scaledValues.input.paddingX}px`,
                paddingRight: `${scaledValues.input.paddingX}px`,
                paddingTop: `${scaledValues.input.paddingY}px`,
                paddingBottom: `${scaledValues.input.paddingY}px`,
                fontSize: `${scaledValues.text.extraSmall}px`
              }}
            >
              RETRY_LOAD
            </button>
          </div>
        )}

        {feedback && !loading && !error && (
          <div 
            className="flex flex-col"
            style={{ gap: `${scaledValues.spacing.gapLarge}px` }}
          >
            <div 
              className="border-2 border-[#006694]/30 bg-black/30"
              style={{ padding: `${scaledValues.padding.medium}px` }}
            >
              <div 
                className="flex flex-col text-cyan-100/70"
                style={{ 
                  gap: `${scaledValues.spacing.gapSmall / 2}px`,
                  fontSize: `${scaledValues.text.extraSmall}px`
                }}
              >
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
              <div 
                className="border-2 border-[#30D6D6]/30 bg-black/30"
                style={{ padding: `${scaledValues.padding.medium}px` }}
              >
                <div 
                  className="font-bold tracking-wider text-[#006694]"
                  style={{ 
                    fontSize: `${scaledValues.text.extraSmall}px`,
                    marginBottom: `${scaledValues.spacing.marginSmall}px`
                  }}
                >
                  [ASSOCIATED_SPECIMEN]
                </div>
                <div 
                  className="flex flex-col sm:flex-row items-start sm:items-center"
                  style={{ gap: `${scaledValues.spacing.gapMedium}px` }}
                >
                  <div
                    className="border border-[#30D6D6]/50 flex items-center justify-center flex-shrink-0"
                    style={{
                      width: `${scaledValues.interactive.catAvatarSize}px`,
                      height: `${scaledValues.interactive.catAvatarSize}px`
                    }}
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
                    className="w-full sm:w-auto border-2 border-[#30D6D6] bg-black font-bold tracking-wider text-[#30D6D6] transition-all hover:bg-[#30D6D6] hover:text-black disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                    style={{
                      paddingLeft: `${scaledValues.input.paddingX}px`,
                      paddingRight: `${scaledValues.input.paddingX}px`,
                      paddingTop: `${scaledValues.input.paddingY}px`,
                      paddingBottom: `${scaledValues.input.paddingY}px`,
                      fontSize: `${scaledValues.text.extraSmall}px`
                    }}
                  >
                    {isLoadingCat ? "LOADING..." : "VIEW_DETAILS"}
                  </button>
                </div>
              </div>
            )}

            <div 
              className="relative border-2 border-[#30D6D6]/30 bg-black/50 backdrop-blur-sm"
              style={{ padding: `${scaledValues.padding.large}px` }}
            >
              <div 
                className="absolute -left-px -top-px border-l-2 border-t-2 border-[#30D6D6]"
                style={{ 
                  height: `${scaledValues.container.cornerSize}px`,
                  width: `${scaledValues.container.cornerSize}px`
                }}
              />
              <div 
                className="absolute -right-px -top-px border-r-2 border-t-2 border-[#30D6D6]"
                style={{ 
                  height: `${scaledValues.container.cornerSize}px`,
                  width: `${scaledValues.container.cornerSize}px`
                }}
              />
              <div 
                className="absolute -bottom-px -left-px border-b-2 border-l-2 border-[#30D6D6]"
                style={{ 
                  height: `${scaledValues.container.cornerSize}px`,
                  width: `${scaledValues.container.cornerSize}px`
                }}
              />
              <div 
                className="absolute -bottom-px -right-px border-b-2 border-r-2 border-[#30D6D6]"
                style={{ 
                  height: `${scaledValues.container.cornerSize}px`,
                  width: `${scaledValues.container.cornerSize}px`
                }}
              />

              <p 
                className="whitespace-pre-wrap text-cyan-100/90 leading-relaxed"
                style={{ fontSize: `${scaledValues.input.fontSize}px` }}
              >
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