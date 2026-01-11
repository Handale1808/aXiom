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
import { useResponsiveScaling } from "@/lib/hooks/useResponsiveScaling";

export default function Feedbacks() {
  const [selectedFeedbackId, setSelectedFeedbackId] = useState<string | null>(
    null
  );
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);
  const scaledValues = useResponsiveScaling();

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
    <div
      className="relative min-h-screen bg-black font-mono"
      style={{ padding: `${scaledValues.padding.small}px` }}
    >
      <div className="relative mx-auto max-w-full md:max-w-5xl">
        <div
          className="border-b-2 border-[#30D6D6]"
          style={{
            marginBottom: `${scaledValues.spacing.marginLarge}px`,
            paddingBottom: `${scaledValues.spacing.marginMedium}px`,
          }}
        >
          <div
            className="flex flex-col md:flex-row md:items-center md:justify-between"
            style={{ gap: `${scaledValues.spacing.gapMedium}px` }}
          >
            <div>
              <h1
                className="font-bold tracking-wider text-[#30D6D6] drop-shadow-[0_0_10px_rgba(48,214,214,0.5)]"
                style={{ fontSize: `${scaledValues.text.large}px` }}
              >
                {" "}
                FEEDBACK_ARCHIVE
              </h1>
              <p
                className="tracking-widest text-[#006694] font-bold"
                style={{
                  marginTop: `${scaledValues.spacing.marginSmall}px`,
                  fontSize: `${scaledValues.text.extraSmall}px`,
                }}
              >
                [DATA_RETRIEVAL_SYSTEM]
              </p>
            </div>

            <button
              onClick={refetch}
              disabled={isLoading}
              className="w-full md:w-auto relative border-2 border-[#30D6D6] bg-black font-bold tracking-wider text-[#30D6D6] transition-all hover:bg-[#30D6D6] hover:text-black hover:shadow-[0_0_20px_rgba(48,214,214,0.5)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-black disabled:hover:text-[#30D6D6] disabled:hover:shadow-none min-h-[44px]"
              style={{
                paddingLeft: `${scaledValues.padding.buttonX}px`,
                paddingRight: `${scaledValues.padding.buttonX}px`,
                paddingTop: `${scaledValues.button.paddingY}px`,
                paddingBottom: `${scaledValues.button.paddingY}px`,
                fontSize: `${scaledValues.button.fontSize}px`,
              }}
            >
              {isLoading ? "SYNCING..." : "REFRESH_DATA"}
            </button>
          </div>
        </div>

        <div
          className="relative border-2 border-[#30D6D6]/30 bg-black/50 backdrop-blur-sm"
          style={{
            marginBottom: `${scaledValues.spacing.marginMedium}px`,
            padding: `${scaledValues.padding.medium}px`,
          }}
        >
          <div
            className="absolute -left-px -top-px border-l-2 border-t-2 border-[#30D6D6]"
            style={{
              height: `${scaledValues.container.cornerSize}px`,
              width: `${scaledValues.container.cornerSize}px`,
            }}
          />
          <div
            className="absolute -right-px -top-px border-r-2 border-t-2 border-[#30D6D6]"
            style={{
              height: `${scaledValues.container.cornerSize}px`,
              width: `${scaledValues.container.cornerSize}px`,
            }}
          />
          <div
            className="absolute -bottom-px -left-px border-b-2 border-l-2 border-[#30D6D6]"
            style={{
              height: `${scaledValues.container.cornerSize}px`,
              width: `${scaledValues.container.cornerSize}px`,
            }}
          />
          <div
            className="absolute -bottom-px -right-px border-b-2 border-r-2 border-[#30D6D6]"
            style={{
              height: `${scaledValues.container.cornerSize}px`,
              width: `${scaledValues.container.cornerSize}px`,
            }}
          />

          <h3
            className="font-bold tracking-widest text-[#30D6D6]"
            style={{
              marginBottom: `${scaledValues.spacing.marginSmall}px`,
              fontSize: `${scaledValues.text.extraSmall}px`,
            }}
          >
            [ARCHIVE_INFO]
          </h3>
          <p
            className="text-cyan-100/70 leading-relaxed"
            style={{ fontSize: `${scaledValues.text.extraSmall}px` }}
          >
            Browse all feline feedback transmissions processed through our
            xenomorphic analysis system.
          </p>
          <p
            className="text-cyan-100/70 leading-relaxed"
            style={{ fontSize: `${scaledValues.text.extraSmall}px` }}
          >
            Probe any transmission node to extract full bio-metric readings and
            temporal coordinates.
          </p>
          <p
            className="text-cyan-100/70 leading-relaxed"
            style={{ fontSize: `${scaledValues.text.extraSmall}px` }}
          >
            Click the column designators to reorganize the data matrix.
          </p>
        </div>

        {error && (
          <div
            className="relative border-2 border-red-500/50 bg-red-950/20 text-center backdrop-blur-sm"
            style={{
              padding: `${scaledValues.padding.large}px`,
              marginBottom: `${scaledValues.spacing.marginLarge}px`,
            }}
          >
            {" "}
            <div
              className="absolute -left-px -top-px border-l-2 border-t-2 border-red-500"
              style={{
                height: `${scaledValues.container.cornerSize}px`,
                width: `${scaledValues.container.cornerSize}px`,
              }}
            />
            <div
              className="absolute -right-px -top-px border-r-2 border-t-2 border-red-500"
              style={{
                height: `${scaledValues.container.cornerSize}px`,
                width: `${scaledValues.container.cornerSize}px`,
              }}
            />
            <div
              className="absolute -bottom-px -left-px border-b-2 border-l-2 border-red-500"
              style={{
                height: `${scaledValues.container.cornerSize}px`,
                width: `${scaledValues.container.cornerSize}px`,
              }}
            />
            <div
              className="absolute -bottom-px -right-px border-b-2 border-r-2 border-red-500"
              style={{
                height: `${scaledValues.container.cornerSize}px`,
                width: `${scaledValues.container.cornerSize}px`,
              }}
            />
            <div
              className="tracking-[0.3em] text-red-400"
              style={{
                marginBottom: `${scaledValues.spacing.marginSmall}px`,
                fontSize: `${scaledValues.text.extraSmall}px`,
              }}
            >
              [SYSTEM_ERROR]
            </div>
            <p
              className="text-red-200"
              style={{ fontSize: `${scaledValues.input.fontSize}px` }}
            >
              {error}
            </p>
            {getLastRequestId() && (
              <p
                className="text-red-400/50 font-mono"
                style={{
                  fontSize: `${scaledValues.text.extraSmall}px`,
                  marginTop: `${scaledValues.spacing.marginMedium}px`,
                }}
              >
                Error ID: {getLastRequestId()}
              </p>
            )}
          </div>
        )}

        {isLoading && feedbacks.length === 0 && (
          <div
            className="relative border-2 border-[#30D6D6]/30 bg-black/50 text-center backdrop-blur-sm"
            style={{ padding: `${scaledValues.padding.extraLarge}px` }}
          >
            <div className="absolute -left-px -top-px h-3 w-3 sm:h-4 sm:w-4 border-l-2 border-t-2 border-[#30D6D6]" />
            <div className="absolute -right-px -top-px h-3 w-3 sm:h-4 sm:w-4 border-r-2 border-t-2 border-[#30D6D6]" />
            <div className="absolute -bottom-px -left-px h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-l-2 border-[#30D6D6]" />
            <div className="absolute -bottom-px -right-px h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-r-2 border-[#30D6D6]" />

            <div
              className="flex items-center justify-center"
              style={{
                marginBottom: `${scaledValues.spacing.gapMedium}px`,
                gap: `${scaledValues.spacing.gapMedium}px`,
              }}
            >
              <div
                className="animate-pulse bg-[#30D6D6] shadow-[0_0_10px_rgba(48,214,214,0.8)]"
                style={{
                  height: `${scaledValues.interactive.loadingIndicator}px`,
                  width: `${scaledValues.interactive.loadingIndicator}px`,
                }}
              />
              <div
                className="tracking-[0.3em] text-[#30D6D6]"
                style={{ fontSize: `${scaledValues.button.fontSize}px` }}
              >
                [SCANNING_DATABASE]
              </div>
            </div>
            <p
              className="text-cyan-100/70"
              style={{ fontSize: `${scaledValues.text.extraSmall}px` }}
            >
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
            scaledValues={scaledValues}
          />
        </ErrorBoundary>

        {feedbacks.length > 0 && (
          <div
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-[#30D6D6]/20"
            style={{
              marginTop: `${scaledValues.spacing.marginMedium}px`,
              paddingTop: `${scaledValues.spacing.marginSmall}px`,
              gap: `${scaledValues.spacing.gapMedium}px`,
            }}
          >
            {" "}
            <div
              className="text-[#30D6D6]/70"
              style={{ fontSize: `${scaledValues.text.extraSmall}px` }}
            >
              Page {page} • Page Size
              <select
                className="bg-black border border-[#30D6D6]/50 text-[#30D6D6] min-h-[44px]"
                style={{
                  marginLeft: `${scaledValues.spacing.gapSmall}px`,
                  paddingLeft: `${scaledValues.spacing.gapSmall}px`,
                  paddingRight: `${scaledValues.spacing.gapSmall}px`,
                  paddingTop: `${scaledValues.spacing.gapSmall / 2}px`,
                  paddingBottom: `${scaledValues.spacing.gapSmall / 2}px`,
                  fontSize: `${scaledValues.text.extraSmall}px`,
                }}
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
            <div
              className="flex w-full sm:w-auto"
              style={{ gap: `${scaledValues.spacing.gapSmall}px` }}
            >
              <button
                onClick={handlePrevPage}
                disabled={page === 1 || isLoading}
                className="flex-1 sm:flex-none border border-[#30D6D6]/50 bg-black font-bold tracking-wider text-[#30D6D6] disabled:opacity-40 min-h-[44px]"
                style={{
                  paddingLeft: `${scaledValues.input.paddingX}px`,
                  paddingRight: `${scaledValues.input.paddingX}px`,
                  paddingTop: `${scaledValues.input.paddingY}px`,
                  paddingBottom: `${scaledValues.input.paddingY}px`,
                  fontSize: `${scaledValues.text.extraSmall}px`,
                }}
              >
                PREV
              </button>
              <button
                onClick={handleNextPage}
                disabled={!hasMore || isLoading}
                className="flex-1 sm:flex-none border border-[#30D6D6]/50 bg-black font-bold tracking-wider text-[#30D6D6] disabled:opacity-40 min-h-[44px]"
                style={{
                  paddingLeft: `${scaledValues.input.paddingX}px`,
                  paddingRight: `${scaledValues.input.paddingX}px`,
                  paddingTop: `${scaledValues.input.paddingY}px`,
                  paddingBottom: `${scaledValues.input.paddingY}px`,
                  fontSize: `${scaledValues.text.extraSmall}px`,
                }}
              >
                NEXT
              </button>
            </div>
          </div>
        )}

        <div
          className="border-t border-[#30D6D6]/20 text-center text-[#30D6D6]/40 tracking-wider"
          style={{
            marginTop: `${scaledValues.spacing.marginExtraLarge}px`,
            paddingTop: `${scaledValues.spacing.marginSmall}px`,
            fontSize: `${scaledValues.text.extraSmall}px`,
          }}
        >
          {" "}
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
