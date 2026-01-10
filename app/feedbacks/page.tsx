"use client";

import { useState } from "react";
import FeedbackList from "@/lib/components/feedback/FeedbackList";
import FeedbackDetailModal from "@/lib/components/feedback/FeedbackDetailModal";
import ConfirmationDialog from "@/lib/components/ui/ConfirmationDialog";
import { useFeedbackData } from "@/lib/hooks/useFeedbackData";
import { useFeedbackFilters } from "@/lib/hooks/useFeedbackFilters";
import { useFeedbackActions } from "@/lib/hooks/useFeedbackActions";
import ErrorBoundary from "@/lib/components/ui/ErrorBoundary";
import { getLastRequestId } from "@/lib/apiClient";

export default function Feedbacks() {
  const [selectedFeedbackId, setSelectedFeedbackId] = useState<string | null>(
    null
  );
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);

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
    hasCatFilter,
    handleHasCatChange,
  } = useFeedbackFilters();

  const {
    feedbacks,
    isLoading,
    error,
    total,
    hasMore,
    refetch,
    setFeedbacks,
    allAvailableTags,
  } = useFeedbackData({
    page,
    pageSize,
    selectedSentiments,
    selectedPriorities,
    selectedTags,
    searchQuery,
    hasCatFilter,
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
    <div className="relative min-h-screen bg-black p-2 sm:p-3 md:p-4 font-mono">
      <div className="relative mx-auto max-w-full md:max-w-5xl">
        <div className="mb-6 sm:mb-8 border-b-2 border-[#30D6D6] pb-4 sm:pb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-0">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-wider text-[#30D6D6] drop-shadow-[0_0_10px_rgba(48,214,214,0.5)]">
                FEEDBACK_ARCHIVE
              </h1>
              <p className="mt-2 text-xs sm:text-sm tracking-widest text-[#006694] font-bold">
                [DATA_RETRIEVAL_SYSTEM]
              </p>
            </div>

            <button
              onClick={refetch}
              disabled={isLoading}
              className="w-full md:w-auto relative border-2 border-[#30D6D6] bg-black px-4 py-2 md:px-8 md:py-3 text-sm md:text-base font-bold tracking-wider text-[#30D6D6] transition-all hover:bg-[#30D6D6] hover:text-black hover:shadow-[0_0_20px_rgba(48,214,214,0.5)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-black disabled:hover:text-[#30D6D6] disabled:hover:shadow-none min-h-[44px]"
            >
              {isLoading ? "SYNCING..." : "REFRESH_DATA"}
            </button>
          </div>
        </div>

        <div className="mb-4 sm:mb-6 relative border-2 border-[#30D6D6]/30 bg-black/50 p-3 sm:p-4 md:p-5 backdrop-blur-sm">
          <div className="absolute -left-px -top-px h-3 w-3 sm:h-4 sm:w-4 border-l-2 border-t-2 border-[#30D6D6]" />
          <div className="absolute -right-px -top-px h-3 w-3 sm:h-4 sm:w-4 border-r-2 border-t-2 border-[#30D6D6]" />
          <div className="absolute -bottom-px -left-px h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-l-2 border-[#30D6D6]" />
          <div className="absolute -bottom-px -right-px h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-r-2 border-[#30D6D6]" />

          <h3 className="mb-2 sm:mb-3 text-xs sm:text-sm font-bold tracking-widest text-[#30D6D6]">
            [ARCHIVE_INFO]
          </h3>
          <p className="text-xs sm:text-sm text-cyan-100/70 leading-relaxed">
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
          <div className="relative border-2 border-red-500/50 bg-red-950/20 p-4 sm:p-5 md:p-6 text-center backdrop-blur-sm mb-6 sm:mb-8">
            <div className="absolute -left-px -top-px h-3 w-3 sm:h-4 sm:w-4 border-l-2 border-t-2 border-red-500" />
            <div className="absolute -right-px -top-px h-3 w-3 sm:h-4 sm:w-4 border-r-2 border-t-2 border-red-500" />
            <div className="absolute -bottom-px -left-px h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-l-2 border-red-500" />
            <div className="absolute -bottom-px -right-px h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-r-2 border-red-500" />

            <div className="mb-2 text-xs tracking-[0.3em] text-red-400">
              [SYSTEM_ERROR]
            </div>
            <p className="text-sm sm:text-base text-red-200">{error}</p>
            {getLastRequestId() && (
              <p className="text-xs text-red-400/50 mt-3 font-mono">
                Error ID: {getLastRequestId()}
              </p>
            )}
          </div>
        )}

        {isLoading && feedbacks.length === 0 && (
          <div className="relative border-2 border-[#30D6D6]/30 bg-black/50 p-6 sm:p-8 md:p-12 text-center backdrop-blur-sm">
            <div className="absolute -left-px -top-px h-3 w-3 sm:h-4 sm:w-4 border-l-2 border-t-2 border-[#30D6D6]" />
            <div className="absolute -right-px -top-px h-3 w-3 sm:h-4 sm:w-4 border-r-2 border-t-2 border-[#30D6D6]" />
            <div className="absolute -bottom-px -left-px h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-l-2 border-[#30D6D6]" />
            <div className="absolute -bottom-px -right-px h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-r-2 border-[#30D6D6]" />

            <div className="mb-4 flex items-center justify-center gap-3">
              <div className="h-3 w-3 animate-pulse bg-[#30D6D6] shadow-[0_0_10px_rgba(48,214,214,0.8)]" />
              <div className="text-sm tracking-[0.3em] text-[#30D6D6]">
                [SCANNING_DATABASE]
              </div>
            </div>
            <p className="text-xs sm:text-sm text-cyan-100/70">
              Retrieving feedback records from xenomorphic archive...
            </p>
          </div>
        )}

        <ErrorBoundary>
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
            availableTags={allAvailableTags}
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
            hasCatFilter={hasCatFilter}
            onHasCatChange={handleHasCatChange}
          />
        </ErrorBoundary>

        {feedbacks.length > 0 && (
          <div className="mt-4 sm:mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-[#30D6D6]/20 pt-3 sm:pt-4">
            <div className="text-[10px] sm:text-xs text-[#30D6D6]/70">
              Page {page} • Page Size
              <select
                className="ml-2 bg-black border border-[#30D6D6]/50 text-[#30D6D6] px-2 py-1 text-xs min-h-[44px]"
                value={pageSize}
                onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="ml-3">Total {total}</span>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={handlePrevPage}
                disabled={page === 1 || isLoading}
                className="flex-1 sm:flex-none border border-[#30D6D6]/50 bg-black px-3 py-2 sm:px-4 sm:py-2 text-xs font-bold tracking-wider text-[#30D6D6] disabled:opacity-40 min-h-[44px]"
              >
                PREV
              </button>
              <button
                onClick={handleNextPage}
                disabled={!hasMore || isLoading}
                className="flex-1 sm:flex-none border border-[#30D6D6]/50 bg-black px-3 py-2 sm:px-4 sm:py-2 text-xs font-bold tracking-wider text-[#30D6D6] disabled:opacity-40 min-h-[44px]"
              >
                NEXT
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 sm:mt-8 border-t border-[#30D6D6]/20 pt-3 sm:pt-4 text-center text-[10px] sm:text-xs text-[#30D6D6]/40 tracking-wider">
          AXIOM_ARCHIVE_v2.847 | {feedbacks.length} RECORDS_INDEXED |
          DATABASE_ACTIVE
        </div>
      </div>

      <ErrorBoundary>
        {" "}
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
      </ErrorBoundary>

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
