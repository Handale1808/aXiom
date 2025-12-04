"use client";

import { useState } from "react";
import FeedbackList from "@/lib/components/FeedbackList";
import FeedbackDetailModal from "@/lib/components/FeedbackDetailModal";
import ConfirmationDialog from "@/lib/components/ConfirmationDialog";
import { useFeedbackData } from "@/lib/hooks/useFeedbackData";
import { useFeedbackFilters } from "@/lib/hooks/useFeedbackFilters";
import { useFeedbackActions } from "@/lib/hooks/useFeedbackActions";

export default function Feedbacks() {
  const [selectedFeedbackId, setSelectedFeedbackId] = useState<string | null>(
    null
  );
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);

  const {
    selectedSentiments,
    selectedPriorities,
    selectedTags,
    isFilterOpen,
    searchQuery,
    isSearchOpen,
    setIsFilterOpen,
    setIsSearchOpen,
    handleSentimentChange,
    handlePriorityChange,
    handleTagChange,
    handleSearchChange,
    handleClearSearch,
    handleClearAllFilters,
    getActiveFilterCount,
    getAvailableTags,
  } = useFeedbackFilters();

  const {
    feedbacks,
    isLoading,
    error,
    total,
    hasMore,
    refetch,
    setFeedbacks,
  } = useFeedbackData({
    page,
    pageSize,
    selectedSentiments,
    selectedPriorities,
    selectedTags,
    searchQuery,
  });

  const {
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
  } = useFeedbackActions({
    setFeedbacks,
    setError: () => {},
    selectedFeedbackId,
    setSelectedFeedbackId,
  });

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

  const handlePrevPage = () => {
    setPage((p) => Math.max(1, p - 1));
  };

  const handleNextPage = () => {
    if (hasMore) setPage((p) => p + 1);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  const handleFeedbackClick = (feedbackId: string) => {
    setSelectedFeedbackId(feedbackId);
  };

  const handleCloseModal = () => {
    setSelectedFeedbackId(null);
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
              onClick={refetch}
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

        {error && (
          <div className="relative border-2 border-red-500/50 bg-red-950/20 p-6 text-center backdrop-blur-sm mb-8">
            <div className="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-red-500" />
            <div className="absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2 border-red-500" />
            <div className="absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-red-500" />
            <div className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-red-500" />

            <div className="mb-2 text-xs tracking-[0.3em] text-red-400">
              [SYSTEM_ERROR]
            </div>
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {isLoading && feedbacks.length === 0 && (
          <div className="relative border-2 border-[#30D6D6]/30 bg-black/50 p-12 text-center backdrop-blur-sm">
            <div className="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-[#30D6D6]" />
            <div className="absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2 border-[#30D6D6]" />
            <div className="absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-[#30D6D6]" />
            <div className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-[#30D6D6]" />

            <div className="mb-4 flex items-center justify-center gap-3">
              <div className="h-3 w-3 animate-pulse bg-[#30D6D6] shadow-[0_0_10px_rgba(48,214,214,0.8)]" />
              <div className="text-sm tracking-[0.3em] text-[#30D6D6]">
                [SCANNING_DATABASE]
              </div>
            </div>
            <p className="text-cyan-100/70">
              Retrieving feedback records from xenomorphic archive...
            </p>
          </div>
        )}

        {!isLoading && feedbacks.length === 0 && (
          <div className="relative border-2 border-[#006694]/50 bg-[#006694]/10 p-12 text-center backdrop-blur-sm">
            <div className="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-[#006694]" />
            <div className="absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2 border-[#006694]" />
            <div className="absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-[#006694]" />
            <div className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-[#006694]" />

            <div className="mb-4 text-xs tracking-[0.3em] text-[#006694]">
              [NO_DATA_FOUND]
            </div>
            <p className="text-cyan-100/70">
              No feedback entries detected in the archive.
            </p>
            <p className="mt-2 text-sm text-[#006694]">
              Initialize first entry via SUBMIT terminal.
            </p>
          </div>
        )}

        {feedbacks.length > 0 && (
          <FeedbackList
            feedbacks={feedbacks}
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
            availableTags={getAvailableTags(feedbacks)}
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

        {feedbacks.length > 0 && (
          <div className="mt-6 flex items-center justify-between border-t border-[#30D6D6]/20 pt-4">
            <div className="text-xs text-[#30D6D6]/70">
              Page {page} • Page Size
              <select
                className="ml-2 bg-black border border-[#30D6D6]/50 text-[#30D6D6] px-2 py-1 text-xs"
                value={pageSize}
                onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="ml-3">Total {total}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePrevPage}
                disabled={page === 1 || isLoading}
                className="border border-[#30D6D6]/50 bg-black px-4 py-2 text-xs font-bold tracking-wider text-[#30D6D6] disabled:opacity-40"
              >
                PREV
              </button>
              <button
                onClick={handleNextPage}
                disabled={!hasMore || isLoading}
                className="border border-[#30D6D6]/50 bg-black px-4 py-2 text-xs font-bold tracking-wider text-[#30D6D6] disabled:opacity-40"
              >
                NEXT
              </button>
            </div>
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