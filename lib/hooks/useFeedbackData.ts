import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/apiClient";
import type { FeedbackWithId } from "@/lib/types/api";

interface UseFeedbackDataParams {
  page: number;
  pageSize: number;
  selectedSentiments: string[];
  selectedPriorities: string[];
  selectedTags: string[];
  searchQuery: string;
}

interface UseFeedbackDataReturn {
  feedbacks: FeedbackWithId[];
  isLoading: boolean;
  error: string | null;
  total: number;
  hasMore: boolean;
  refetch: () => Promise<void>;
  setFeedbacks: React.Dispatch<React.SetStateAction<FeedbackWithId[]>>;
}

export function useFeedbackData({
  page,
  pageSize,
  selectedSentiments,
  selectedPriorities,
  selectedTags,
  searchQuery,
}: UseFeedbackDataParams): UseFeedbackDataReturn {
  const [feedbacks, setFeedbacks] = useState<FeedbackWithId[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(false);

  const fetchFeedbacks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));

      if (searchQuery) {
        params.set("search", searchQuery);
      }

      if (selectedSentiments.length > 0) {
        selectedSentiments.forEach((sentiment) =>
          params.append("sentiment", sentiment)
        );
      }

      if (selectedPriorities.length > 0) {
        selectedPriorities.forEach((priority) =>
          params.append("priority", priority)
        );
      }

      if (selectedTags.length > 0) {
        selectedTags.forEach((tag) => params.append("tag", tag));
      }

      const data = await apiFetch<{
        success: true;
        data: FeedbackWithId[];
        pagination: {
          total: number;
          limit: number;
          skip: number;
          hasMore: boolean;
        };
      }>(`/api/feedback?${params.toString()}`);

      setFeedbacks(data.data);
      setTotal(data.pagination.total);
      setHasMore(data.pagination.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load feedbacks");
    } finally {
      setIsLoading(false);
    }
  }, [
    page,
    pageSize,
    searchQuery,
    selectedSentiments,
    selectedPriorities,
    selectedTags,
  ]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  return {
    feedbacks,
    isLoading,
    error,
    total,
    hasMore,
    refetch: fetchFeedbacks,
    setFeedbacks,
  };
}
