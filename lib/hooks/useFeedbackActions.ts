import { useState, useCallback } from "react";
import { apiFetch } from "@/lib/apiClient";
import type { FeedbackWithId, ApiSuccessResponse } from "@/lib/types/api";

interface DeleteConfirmation {
  isOpen: boolean;
  feedbackIds: string[];
  type: "single" | "bulk";
}

interface UseFeedbackActionsParams {
  setFeedbacks: React.Dispatch<React.SetStateAction<FeedbackWithId[]>>;
  setError: (error: string | null) => void;
  selectedFeedbackId: string | null;
  setSelectedFeedbackId: (id: string | null) => void;
}

interface UseFeedbackActionsReturn {
  selectedFeedbackIds: string[];
  isDeletingIds: string[];
  deleteConfirmation: DeleteConfirmation | null;
  isUpdating: boolean;
  handleSelectionChange: (ids: string[]) => void;
  handleDeleteSingle: (id: string) => void;
  handleDeleteMultiple: (ids: string[]) => void;
  confirmDelete: () => void;
  cancelDelete: () => void;
  handleUpdateNextAction: (id: string, newNextAction: string) => void;
}

export function useFeedbackActions({
  setFeedbacks,
  setError,
  selectedFeedbackId,
  setSelectedFeedbackId,
}: UseFeedbackActionsParams): UseFeedbackActionsReturn {
  const [selectedFeedbackIds, setSelectedFeedbackIds] = useState<string[]>([]);
  const [isDeletingIds, setIsDeletingIds] = useState<string[]>([]);
  const [deleteConfirmation, setDeleteConfirmation] =
    useState<DeleteConfirmation | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const deleteFeedback = useCallback(
    async (id: string) => {
      setIsDeletingIds((prev) => [...prev, id]);

      try {
        const data = await apiFetch<{ success: true }>(`/api/feedback/${id}`, {
          method: "DELETE",
        });

        if (data.success) {
          setFeedbacks((prev) => prev.filter((f) => f._id !== id));
          setSelectedFeedbackIds((prev) =>
            prev.filter((selectedId) => selectedId !== id)
          );

          if (selectedFeedbackId === id) {
            setSelectedFeedbackId(null);
          }

          setDeleteConfirmation(null);
        } else {
          setError("Failed to delete feedback");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to delete feedback"
        );
      } finally {
        setIsDeletingIds((prev) =>
          prev.filter((deletingId) => deletingId !== id)
        );
      }
    },
    [setFeedbacks, selectedFeedbackId, setSelectedFeedbackId, setError]
  );

  const deleteFeedbackBulk = useCallback(
    async (ids: string[]) => {
      setIsDeletingIds(ids);

      try {
        const data = await apiFetch<{ success: true }>("/api/feedback", {
          method: "DELETE",
          body: JSON.stringify({ ids }),
        });

        if (data.success) {
          setFeedbacks((prev) => prev.filter((f) => !ids.includes(f._id)));
          setSelectedFeedbackIds([]);

          if (selectedFeedbackId && ids.includes(selectedFeedbackId)) {
            setSelectedFeedbackId(null);
          }

          setDeleteConfirmation(null);
        } else {
          setError("Failed to delete feedbacks");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to delete feedbacks"
        );
      } finally {
        setIsDeletingIds([]);
      }
    },
    [setFeedbacks, selectedFeedbackId, setSelectedFeedbackId, setError]
  );

  const updateNextAction = useCallback(
    async (id: string, newNextAction: string) => {
      setIsUpdating(true);

      try {
        const data = await apiFetch<ApiSuccessResponse<FeedbackWithId>>(
          `/api/feedback/${id}`,
          {
            method: "PATCH",
            body: JSON.stringify({ nextAction: newNextAction }),
          }
        );

        if (data.success) {
          setFeedbacks((prev) =>
            prev.map((f) =>
              f._id === id
                ? {
                    ...f,
                    analysis: { ...f.analysis, nextAction: newNextAction },
                  }
                : f
            )
          );
        } else {
          setError("Failed to update feedback");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update feedback"
        );
      } finally {
        setIsUpdating(false);
      }
    },
    [setFeedbacks, setError]
  );

  const handleDeleteSingle = useCallback((id: string) => {
    setDeleteConfirmation({
      isOpen: true,
      feedbackIds: [id],
      type: "single",
    });
  }, []);

  const handleDeleteMultiple = useCallback((ids: string[]) => {
    setDeleteConfirmation({
      isOpen: true,
      feedbackIds: ids,
      type: "bulk",
    });
  }, []);

  const confirmDelete = useCallback(() => {
    if (!deleteConfirmation) return;

    if (deleteConfirmation.type === "single") {
      deleteFeedback(deleteConfirmation.feedbackIds[0]);
    } else {
      deleteFeedbackBulk(deleteConfirmation.feedbackIds);
    }
  }, [deleteConfirmation, deleteFeedback, deleteFeedbackBulk]);

  const cancelDelete = useCallback(() => {
    setDeleteConfirmation(null);
  }, []);

  const handleUpdateNextAction = useCallback(
    (id: string, newNextAction: string) => {
      updateNextAction(id, newNextAction);
    },
    [updateNextAction]
  );

  const handleSelectionChange = useCallback((ids: string[]) => {
    setSelectedFeedbackIds(ids);
  }, []);

  return {
    selectedFeedbackIds,
    isDeletingIds,
    deleteConfirmation,
    isUpdating,
    handleSelectionChange,
    handleDeleteSingle,
    handleDeleteMultiple,
    confirmDelete,
    cancelDelete,
    handleUpdateNextAction,
  };
}