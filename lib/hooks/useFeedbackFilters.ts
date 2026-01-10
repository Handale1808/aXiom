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
  hasCatFilter: string | null;
  handleHasCatChange: (value: string | null) => void;
}

export function useFeedbackFilters(): UseFeedbackFiltersReturn {
  const [selectedSentiments, setSelectedSentiments] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [hasCatFilter, setHasCatFilter] = useState<string | null>(null);

  const loadFiltersFromStorage = useCallback(() => {
    try {
      const saved = localStorage.getItem("feedbackFilters");
      if (saved) {
        const { sentiments, priorities, tags, hasCat } = JSON.parse(saved);
        setSelectedSentiments(sentiments || []);
        setSelectedPriorities(priorities || []);
        setSelectedTags(tags || []);
        setHasCatFilter(hasCat || null);
      }
    } catch (error) {
      console.error("Failed to load filters from storage:", error);
    }
  }, []);

  const saveFiltersToStorage = useCallback(
    (
      sentiments: string[],
      priorities: string[],
      tags: string[],
      hasCat: string | null
    ) => {
      try {
        localStorage.setItem(
          "feedbackFilters",
          JSON.stringify({ sentiments, priorities, tags, hasCat })
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
      saveFiltersToStorage(
        sentiments,
        selectedPriorities,
        selectedTags,
        hasCatFilter
      );
    },
    [selectedPriorities, selectedTags, saveFiltersToStorage, hasCatFilter] // ADD hasCatFilter
  );

  const handlePriorityChange = useCallback(
    (priorities: string[]) => {
      setSelectedPriorities(priorities);
      saveFiltersToStorage(
        selectedSentiments,
        priorities,
        selectedTags,
        hasCatFilter
      );
    },
    [selectedSentiments, selectedTags, saveFiltersToStorage, hasCatFilter] // ADD hasCatFilter
  );

  const handleTagChange = useCallback(
    (tags: string[]) => {
      setSelectedTags(tags);
      saveFiltersToStorage(
        selectedSentiments,
        selectedPriorities,
        tags,
        hasCatFilter
      );
    },
    [selectedSentiments, selectedPriorities, saveFiltersToStorage, hasCatFilter] // ADD hasCatFilter
  );

  const handleHasCatChange = useCallback(
    (value: string | null) => {
      setHasCatFilter(value);
      saveFiltersToStorage(
        selectedSentiments,
        selectedPriorities,
        selectedTags,
        value
      );
    },
    [selectedSentiments, selectedPriorities, selectedTags, saveFiltersToStorage]
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
    setHasCatFilter(null);
    try {
      localStorage.removeItem("feedbackFilters");
    } catch (error) {
      console.error("Failed to clear filters from storage:", error);
    }
  }, []);

  const getActiveFilterCount = useCallback((): number => {
    const hasCatCount = hasCatFilter ? 1 : 0;
    return (
      selectedSentiments.length +
      selectedPriorities.length +
      selectedTags.length +
      hasCatCount
    );
  }, [
    selectedSentiments.length,
    selectedPriorities.length,
    selectedTags.length,
    hasCatFilter,
  ]);

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
    hasCatFilter,
    handleHasCatChange,
  };
}
