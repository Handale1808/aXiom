// app/feedbacks/page.tsx

"use client";
import { useState, useEffect } from "react";
import FeedbackList from "@/lib/components/FeedbackList";
import FeedbackDetailModal from "@/lib/components/FeedbackDetailModal";
import FeedbackFilters from "@/lib/components/FeedbackFilters";

export default function Feedbacks() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFeedbackId, setSelectedFeedbackId] = useState<string | null>(
    null
  );
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedSentiments, setSelectedSentiments] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const loadFiltersFromStorage = () => {
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
  };

  const saveFiltersToStorage = (
    sentiments: string[],
    priorities: string[],
    tags: string[]
  ) => {
    try {
      localStorage.setItem(
        "feedbackFilters",
        JSON.stringify({ sentiments, priorities, tags })
      );
    } catch (error) {
      console.error("Failed to save filters to storage:", error);
    }
  };

  const getAvailableTags = (): string[] => {
    const tagsSet = new Set<string>();
    feedbacks.forEach((feedback) => {
      if (feedback.analysis.tags) {
        feedback.analysis.tags.forEach((tag : string) => {
          if (tag && tag.trim()) {
            tagsSet.add(tag);
          }
        });
      }
    });
    return Array.from(tagsSet).sort();
  };

  const getFilteredFeedbacks = () => {
    return feedbacks.filter((feedback) => {
      const sentimentMatch =
        selectedSentiments.length === 0 ||
        selectedSentiments.includes(feedback.analysis.sentiment);

      const priorityMatch =
        selectedPriorities.length === 0 ||
        selectedPriorities.includes(feedback.analysis.priority);

      const tagsMatch =
        selectedTags.length === 0 ||
        (feedback.analysis.tags &&
          selectedTags.every((selectedTag) =>
            feedback.analysis.tags.includes(selectedTag)
          ));

      return sentimentMatch && priorityMatch && tagsMatch;
    });
  };

  const getActiveFilterCount = () => {
    return (
      selectedSentiments.length +
      selectedPriorities.length +
      selectedTags.length
    );
  };

  const handleSentimentChange = (sentiments: string[]) => {
    setSelectedSentiments(sentiments);
    saveFiltersToStorage(sentiments, selectedPriorities, selectedTags);
  };

  const handlePriorityChange = (priorities: string[]) => {
    setSelectedPriorities(priorities);
    saveFiltersToStorage(selectedSentiments, priorities, selectedTags);
  };

  const handleTagChange = (tags: string[]) => {
    setSelectedTags(tags);
    saveFiltersToStorage(selectedSentiments, selectedPriorities, tags);
  };

  const handleClearAllFilters = () => {
    setSelectedSentiments([]);
    setSelectedPriorities([]);
    setSelectedTags([]);
    setIsFilterOpen(false);
    try {
      localStorage.removeItem("feedbackFilters");
    } catch (error) {
      console.error("Failed to clear filters from storage:", error);
    }
  };

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

  const handleFeedbackClick = (feedbackId: string) => {
    setSelectedFeedbackId(feedbackId);
  };

  const handleCloseModal = () => {
    setSelectedFeedbackId(null);
  };

  useEffect(() => {
    loadFiltersFromStorage();
    fetchFeedbacks();
  }, []);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleClearSort = () => {
    setSortColumn(null);
    setSortDirection("asc");
  };

  return (
    <div className="relative min-h-screen bg-black p-4 font-mono">
      <div className="relative mx-auto max-w-5xl">
        <div className="mb-8 border-b-2 border-[#30D6D6] pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-wider text-[#30D6D6] drop-shadow-[0_0_10px_rgba(48,214,214,0.5)]">
                FEEDBACK_ARCHIVE
              </h1>
              <p className="mt-2 text-sm tracking-widest text-[#006694] font-bold">
                [DATA_RETRIEVAL_SYSTEM]
              </p>
            </div>

            <button
              onClick={fetchFeedbacks}
              disabled={isLoading}
              className="relative border-2 border-[#30D6D6] bg-black px-8 py-3 font-bold tracking-wider text-[#30D6D6] transition-all hover:bg-[#30D6D6] hover:text-black hover:shadow-[0_0_20px_rgba(48,214,214,0.5)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-black disabled:hover:text-[#30D6D6] disabled:hover:shadow-none"
            >
              {isLoading ? "SYNCING..." : "REFRESH_DATA"}
            </button>
          </div>
        </div>

        <div className="mb-6 relative border-2 border-[#30D6D6]/30 bg-black/50 p-5 backdrop-blur-sm">
          <div className="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-[#30D6D6]" />
          <div className="absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2 border-[#30D6D6]" />
          <div className="absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-[#30D6D6]" />
          <div className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-[#30D6D6]" />

          <h3 className="mb-3 text-sm font-bold tracking-widest text-[#30D6D6]">
            [ARCHIVE_INFO]
          </h3>
          <p className="text-cyan-100/70 leading-relaxed">
            Browse all feline feedback transmissions processed through our
            xenomorphic analysis system.
          </p>
          <p className="text-cyan-100/70 leading-relaxed">
            Probe any transmission node to extract full bio-metric readings and
            temporal coordinates.
          </p>
          <p className="text-cyan-100/70 leading-relaxed">
            Click the column designators to reorganize the data matrix.
          </p>
        </div>

        {isLoading && feedbacks.length === 0 && (
          <div className="relative border-2 border-[#30D6D6]/50 bg-[#30D6D6]/10 p-8 text-center">
            <div className="absolute right-4 top-4 h-3 w-3 animate-pulse bg-[#30D6D6] shadow-[0_0_15px_rgba(48,214,214,0.9)]" />
            <div className="mb-3 text-xs tracking-[0.3em] text-[#30D6D6]/70">
              LOADING_DATABASE
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
              Retrieving feedback records...
            </p>
          </div>
        )}

        {error && (
          <div className="relative border-2 border-red-500/50 bg-red-950/30 p-6">
            <div className="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-red-500" />
            <div className="absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2 border-red-500" />
            <div className="absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-red-500" />
            <div className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-red-500" />

            <div className="flex items-center gap-3">
              <div className="h-3 w-3 animate-pulse bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
              <div>
                <div className="text-xs font-bold tracking-wider text-red-400">
                  [DATABASE_ERROR]
                </div>
                <p className="mt-1 text-sm text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!isLoading && feedbacks.length === 0 && !error && (
          <div className="relative border-2 border-[#006694]/50 bg-black/50 p-12 text-center backdrop-blur-sm">
            <div className="absolute left-1/2 top-8 h-3 w-3 -translate-x-1/2 bg-[#006694] shadow-[0_0_10px_rgba(0,102,148,0.8)]" />

            <div className="mb-4 text-xs tracking-[0.3em] text-[#006694]">
              DATABASE_EMPTY
            </div>
            <p className="text-cyan-100/70">
              No feedback transmissions detected in the system.
            </p>
            <p className="mt-2 text-sm text-[#006694]">
              Initialize first entry via SUBMIT terminal.
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <FeedbackFilters
            isOpen={isFilterOpen}
            onToggle={() => setIsFilterOpen(!isFilterOpen)}
            selectedSentiments={selectedSentiments}
            selectedPriorities={selectedPriorities}
            selectedTags={selectedTags}
            availableTags={getAvailableTags()}
            onSentimentChange={handleSentimentChange}
            onPriorityChange={handlePriorityChange}
            onTagChange={handleTagChange}
            onClearAll={handleClearAllFilters}
            activeFilterCount={getActiveFilterCount()}
          />
        </div>

        {feedbacks.length > 0 && getFilteredFeedbacks().length === 0 && (
          <div className="relative border-2 border-yellow-500/50 bg-yellow-950/20 p-12 text-center backdrop-blur-sm mb-8">
            <div className="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-yellow-500" />
            <div className="absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2 border-yellow-500" />
            <div className="absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-yellow-500" />
            <div className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-yellow-500" />

            <div className="mb-4 text-xs tracking-[0.3em] text-yellow-500">
              [FILTER_MISMATCH]
            </div>
            <p className="text-cyan-100/70 mb-2">
              No feedback matches your current filter selection.
            </p>
            <p className="text-sm text-yellow-500/70 mb-4">
              Active filters: {getActiveFilterCount()} applied
            </p>
            <button
              onClick={handleClearAllFilters}
              className="border border-yellow-500/50 bg-black px-6 py-2 text-xs font-bold tracking-wider text-yellow-500 transition-all hover:bg-yellow-500/10 hover:border-yellow-500"
            >
              CLEAR_ALL_FILTERS
            </button>
          </div>
        )}

        {feedbacks.length > 0 && (
          <FeedbackList
            feedbacks={getFilteredFeedbacks()}
            onFeedbackClick={handleFeedbackClick}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
            onClearSort={handleClearSort}
          />
        )}

        <div className="mt-8 border-t border-[#30D6D6]/20 pt-4 text-center text-xs text-[#30D6D6]/40 tracking-wider">
          AXIOM_ARCHIVE_v2.847 | {feedbacks.length} RECORDS_INDEXED |
          DATABASE_ACTIVE
        </div>
      </div>
      <FeedbackDetailModal
        feedbackId={selectedFeedbackId}
        onClose={handleCloseModal}
      />
    </div>
  );
}
