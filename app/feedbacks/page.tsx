// app/feedbacks/page.tsx

"use client";
import { useState, useEffect } from "react";
import FeedbackList from "@/lib/components/FeedbackList";
import FeedbackDetailModal from "@/lib/components/FeedbackDetailModal";
import FeedbackFilters from "@/lib/components/FeedbackFilters";
import ConfirmationDialog from "@/lib/components/ConfirmationDialog";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedFeedbackIds, setSelectedFeedbackIds] = useState<string[]>([]);
  const [isDeletingIds, setIsDeletingIds] = useState<string[]>([]);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    feedbackIds: string[];
    type: "single" | "bulk";
  } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

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
        feedback.analysis.tags.forEach((tag: string) => {
          if (tag && tag.trim()) {
            tagsSet.add(tag);
          }
        });
      }
    });
    return Array.from(tagsSet).sort();
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setIsSearchOpen(false);
  };

  const getFilteredFeedbacks = () => {
    return feedbacks.filter((feedback) => {
      const sentimentMatch =
        selectedSentiments.length === 0 ||
        selectedSentiments.some(
          (s) => s.toLowerCase() === feedback.analysis.sentiment.toLowerCase()
        );

      const priorityMatch =
        selectedPriorities.length === 0 ||
        selectedPriorities.some(
          (p) => p.toLowerCase() === feedback.analysis.priority.toLowerCase()
        );

      const tagsMatch =
        selectedTags.length === 0 ||
        (feedback.analysis.tags &&
          selectedTags.some((selectedTag) =>
            feedback.analysis.tags.some(
              (tag: string) => tag.toLowerCase() === selectedTag.toLowerCase()
            )
          ));

      const searchMatch =
        !searchQuery ||
        feedback.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (feedback.analysis.tags &&
          feedback.analysis.tags.some((tag: string) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          ));

      return sentimentMatch && priorityMatch && tagsMatch && searchMatch;
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
    setSearchQuery("");
    setIsFilterOpen(false);
    setIsSearchOpen(false);
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

  const deleteFeedback = async (id: string) => {
    setIsDeletingIds((prev) => [...prev, id]);

    try {
      const response = await fetch(`/api/feedback/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

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
  };

  const deleteFeedbackBulk = async (ids: string[]) => {
    setIsDeletingIds(ids);

    try {
      const response = await fetch("/api/feedback", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids }),
      });
      const data = await response.json();

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
  };

  const updateNextAction = async (id: string, newNextAction: string) => {
    setIsUpdating(true);

    try {
      const response = await fetch(`/api/feedback/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nextAction: newNextAction }),
      });
      const data = await response.json();

      if (data.success) {
        setFeedbacks((prev) =>
          prev.map((f) =>
            f._id === id
              ? { ...f, analysis: { ...f.analysis, nextAction: newNextAction } }
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
  };

  const handleDeleteSingle = (id: string) => {
    setDeleteConfirmation({
      isOpen: true,
      feedbackIds: [id],
      type: "single",
    });
  };

  const handleDeleteMultiple = (ids: string[]) => {
    setDeleteConfirmation({
      isOpen: true,
      feedbackIds: ids,
      type: "bulk",
    });
  };

  const confirmDelete = () => {
    if (!deleteConfirmation) return;

    if (deleteConfirmation.type === "single") {
      deleteFeedback(deleteConfirmation.feedbackIds[0]);
    } else {
      deleteFeedbackBulk(deleteConfirmation.feedbackIds);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation(null);
  };

  const handleUpdateNextAction = (id: string, newNextAction: string) => {
    updateNextAction(id, newNextAction);
  };

  const handleSelectionChange = (ids: string[]) => {
    setSelectedFeedbackIds(ids);
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

        {feedbacks.length > 0 && (
          <FeedbackList
            feedbacks={getFilteredFeedbacks()}
            onFeedbackClick={handleFeedbackClick}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
            onClearSort={handleClearSort}
            isFilterOpen={isFilterOpen}
            onFilterToggle={() => setIsFilterOpen(!isFilterOpen)}
            selectedSentiments={selectedSentiments}
            selectedPriorities={selectedPriorities}
            selectedTags={selectedTags}
            availableTags={getAvailableTags()}
            onSentimentChange={handleSentimentChange}
            onPriorityChange={handlePriorityChange}
            onTagChange={handleTagChange}
            onClearAllFilters={handleClearAllFilters}
            activeFilterCount={getActiveFilterCount()}
            isSearchOpen={isSearchOpen}
            onSearchToggle={() => setIsSearchOpen(!isSearchOpen)}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onClearSearch={handleClearSearch}
            selectedIds={selectedFeedbackIds}
            onSelectionChange={handleSelectionChange}
            onDeleteSingle={handleDeleteSingle}
            onDeleteMultiple={handleDeleteMultiple}
            isDeletingIds={isDeletingIds}
          />
        )}

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

        <div className="mt-8 border-t border-[#30D6D6]/20 pt-4 text-center text-xs text-[#30D6D6]/40 tracking-wider">
          AXIOM_ARCHIVE_v2.847 | {feedbacks.length} RECORDS_INDEXED |
          DATABASE_ACTIVE
        </div>
      </div>
      <FeedbackDetailModal
        feedbackId={selectedFeedbackId}
        onClose={handleCloseModal}
        onDelete={handleDeleteSingle}
        onUpdateNextAction={handleUpdateNextAction}
        isDeleting={
          selectedFeedbackId
            ? isDeletingIds.includes(selectedFeedbackId)
            : false
        }
        isUpdating={isUpdating}
      />

      <ConfirmationDialog
        isOpen={deleteConfirmation?.isOpen || false}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title={
          deleteConfirmation?.type === "bulk"
            ? "DELETE_MULTIPLE_FEEDBACKS"
            : "DELETE_FEEDBACK"
        }
        message={
          deleteConfirmation?.type === "bulk"
            ? `Are you sure you want to delete ${deleteConfirmation.feedbackIds.length} feedback items? This action cannot be undone.`
            : "Are you sure you want to delete this feedback? This action cannot be undone."
        }
        confirmText={
          deleteConfirmation?.type === "bulk" ? "DELETE_ALL" : "DELETE"
        }
        cancelText="CANCEL"
        isLoading={isDeletingIds.length > 0}
        variant="danger"
      />
    </div>
  );
}
