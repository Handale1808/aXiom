import { useState, useEffect, useCallback } from "react";
import type { FeedbackWithId } from "@/lib/types/api";

interface UseFeedbackFiltersReturn {
  selectedSentiments: string[];
  selectedPriorities: string[];
  selectedTags: string[];
  isFilterOpen: boolean;
  searchQuery: string;
  isSearchOpen: boolean;
  setSelectedSentiments: (sentiments: string[]) => void;
  setSelectedPriorities: (priorities: string[]) => void;
  setSelectedTags: (tags: string[]) => void;
  setIsFilterOpen: (isOpen: boolean) => void;
  setSearchQuery: (query: string) => void;
  setIsSearchOpen: (isOpen: boolean) => void;
  handleSentimentChange: (sentiments: string[]) => void;
  handlePriorityChange: (priorities: string[]) => void;
  handleTagChange: (tags: string[]) => void;
  handleSearchChange: (query: string) => void;
  handleClearSearch: () => void;
  handleClearAllFilters: () => void;
  getActiveFilterCount: () => number;
  getAvailableTags: (feedbacks: FeedbackWithId[]) => string[];
}

export function useFeedbackFilters(): UseFeedbackFiltersReturn {
  const [selectedSentiments, setSelectedSentiments] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const loadFiltersFromStorage = useCallback(() => {
    try {
      const saved = localStorage.getItem("feedbackFilters");
      if (saved) {
        const { sentiments, priorities, tags } = JSON.parse(saved);
        setSelectedSentiments(sentiments || []);
        setSelectedPriorities(priorities || []);
        setSelectedTags(tags || []);
      }
    } catch (error) {
      console.error("Failed to load filters from storage:", error);
    }
  }, []);

  const saveFiltersToStorage = useCallback(
    (sentiments: string[], priorities: string[], tags: string[]) => {
      try {
        localStorage.setItem(
          "feedbackFilters",
          JSON.stringify({ sentiments, priorities, tags })
        );
      } catch (error) {
        console.error("Failed to save filters to storage:", error);
      }
    },
    []
  );

  const handleSentimentChange = useCallback(
    (sentiments: string[]) => {
      setSelectedSentiments(sentiments);
      saveFiltersToStorage(sentiments, selectedPriorities, selectedTags);
    },
    [selectedPriorities, selectedTags, saveFiltersToStorage]
  );

  const handlePriorityChange = useCallback(
    (priorities: string[]) => {
      setSelectedPriorities(priorities);
      saveFiltersToStorage(selectedSentiments, priorities, selectedTags);
    },
    [selectedSentiments, selectedTags, saveFiltersToStorage]
  );

  const handleTagChange = useCallback(
    (tags: string[]) => {
      setSelectedTags(tags);
      saveFiltersToStorage(selectedSentiments, selectedPriorities, tags);
    },
    [selectedSentiments, selectedPriorities, saveFiltersToStorage]
  );

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setIsSearchOpen(false);
  }, []);

  const handleClearAllFilters = useCallback(() => {
    setSelectedSentiments([]);
    setSelectedPriorities([]);
    setSelectedTags([]);
    setSearchQuery("");
    setIsFilterOpen(false);
    setIsSearchOpen(false);
    try {
      localStorage.removeItem("feedbackFilters");
    } catch (error) {
      console.error("Failed to clear filters from storage:", error);
    }
  }, []);

  const getActiveFilterCount = useCallback((): number => {
    return (
      selectedSentiments.length +
      selectedPriorities.length +
      selectedTags.length
    );
  }, [selectedSentiments.length, selectedPriorities.length, selectedTags.length]);

  const getAvailableTags = useCallback((feedbacks: FeedbackWithId[]): string[] => {
    const tagsSet = new Set<string>();
    feedbacks.forEach((feedback) => {
      if (feedback.analysis.tags) {
        feedback.analysis.tags.forEach((tag: string) => {
          if (tag && tag.trim()) {
            tagsSet.add(tag);
          }
        });
      }
    });
    return Array.from(tagsSet).sort();
  }, []);

  useEffect(() => {
    loadFiltersFromStorage();
  }, [loadFiltersFromStorage]);

  return {
    selectedSentiments,
    selectedPriorities,
    selectedTags,
    isFilterOpen,
    searchQuery,
    isSearchOpen,
    setSelectedSentiments,
    setSelectedPriorities,
    setSelectedTags,
    setIsFilterOpen,
    setSearchQuery,
    setIsSearchOpen,
    handleSentimentChange,
    handlePriorityChange,
    handleTagChange,
    handleSearchChange,
    handleClearSearch,
    handleClearAllFilters,
    getActiveFilterCount,
    getAvailableTags,
  };
}