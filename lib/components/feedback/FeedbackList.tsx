import { useState, useMemo } from "react";
import FeedbackListHeader from "./FeedbackListHeader";
import FeedbackListItem from "./FeedbackListItem";
import FeedbackListToolbar from "./FeedbackListToolbar";
import type { FeedbackWithId } from "@/lib/types/api";
import type { ScaledValues } from "@/lib/hooks/useResponsiveScaling";

interface FeedbackListProps {
  feedbacks: FeedbackWithId[];
  onFeedbackClick?: (feedbackId: string) => void;
  sortColumn?: string | null;
  sortDirection?: "asc" | "desc";
  onSort?: (column: string) => void;
  onClearSort?: () => void;
  isFilterOpen?: boolean;
  onFilterToggle?: () => void;
  selectedSentiments?: string[];
  selectedPriorities?: string[];
  selectedTags?: string[];
  availableTags?: string[];
  onSentimentChange?: (sentiments: string[]) => void;
  onPriorityChange?: (priorities: string[]) => void;
  onTagChange?: (tags: string[]) => void;
  onClearAllFilters?: () => void;
  activeFilterCount?: number;
  isSearchOpen?: boolean;
  onSearchToggle?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onClearSearch?: () => void;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  onDeleteSingle?: (id: string) => void;
  onDeleteMultiple?: (ids: string[]) => void;
  isDeletingIds?: string[];
  hasCatFilter?: string | null;
  onHasCatChange?: (value: string | null) => void;
  scaledValues: ScaledValues;
}

export default function FeedbackList({
  feedbacks,
  onFeedbackClick,
  sortColumn = null,
  sortDirection = "asc",
  onSort,
  onClearSort,
  isFilterOpen = false,
  onFilterToggle,
  selectedSentiments = [],
  selectedPriorities = [],
  selectedTags = [],
  availableTags = [],
  onSentimentChange,
  onPriorityChange,
  onTagChange,
  onClearAllFilters,
  activeFilterCount = 0,
  isSearchOpen = false,
  onSearchToggle,
  searchQuery = "",
  onSearchChange,
  onClearSearch,
  selectedIds = [],
  onSelectionChange,
  onDeleteSingle,
  onDeleteMultiple,
  isDeletingIds = [],
  hasCatFilter = null,
  onHasCatChange,
  scaledValues,
}: FeedbackListProps) {
  const hasNoResults = feedbacks.length === 0;

  const getSortedFeedbacks = useMemo(() => {
    const sorted = [...feedbacks].sort((a, b) => {
      if (!sortColumn) {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      }

      if (sortColumn === "text") {
        return sortDirection === "asc"
          ? a.text.localeCompare(b.text)
          : b.text.localeCompare(a.text);
      }

      if (sortColumn === "sentiment") {
        return sortDirection === "asc"
          ? a.analysis.sentiment.localeCompare(b.analysis.sentiment)
          : b.analysis.sentiment.localeCompare(a.analysis.sentiment);
      }

      if (sortColumn === "priority") {
        return sortDirection === "asc"
          ? a.analysis.priority.localeCompare(b.analysis.priority)
          : b.analysis.priority.localeCompare(a.analysis.priority);
      }

      return 0;
    });
    return sorted;
  }, [feedbacks, sortColumn, sortDirection]);

  const isAllSelected =
    selectedIds.length > 0 && selectedIds.length === feedbacks.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelectionChange?.([]);
    } else {
      onSelectionChange?.(feedbacks.map((f) => f._id));
    }
  };

  const handleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange?.(
        selectedIds.filter((selectedId) => selectedId !== id)
      );
    } else {
      onSelectionChange?.([...selectedIds, id]);
    }
  };

  const handleClearSelection = () => {
    onSelectionChange?.([]);
  };

  const handleDeleteSelected = () => {
    onDeleteMultiple?.(selectedIds);
  };

  return (
    <div style={{ marginBottom: `${scaledValues.spacing.marginLarge}px` }}>
      <FeedbackListToolbar
        isFilterOpen={isFilterOpen}
        onFilterToggle={onFilterToggle || (() => {})}
        selectedSentiments={selectedSentiments}
        selectedPriorities={selectedPriorities}
        selectedTags={selectedTags}
        availableTags={availableTags}
        onSentimentChange={onSentimentChange || (() => {})}
        onPriorityChange={onPriorityChange || (() => {})}
        onTagChange={onTagChange || (() => {})}
        onClearAllFilters={onClearAllFilters || (() => {})}
        activeFilterCount={activeFilterCount}
        isSearchOpen={isSearchOpen}
        onSearchToggle={onSearchToggle || (() => {})}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange || (() => {})}
        onClearSearch={onClearSearch || (() => {})}
        sortColumn={sortColumn}
        onClearSort={onClearSort || (() => {})}
        selectedCount={selectedIds.length}
        onClearSelection={handleClearSelection}
        onDeleteSelected={handleDeleteSelected}
        hasCatFilter={hasCatFilter}
        onHasCatChange={onHasCatChange || (() => {})}
        scaledValues={scaledValues}
      />
      <FeedbackListHeader
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={onSort || (() => {})}
        isAllSelected={isAllSelected}
        onSelectAll={handleSelectAll}
        scaledValues={scaledValues}
      />
      {hasNoResults ? (
        <div
          className="border border-[#30D6D6]/20 text-center"
          style={{ padding: `${scaledValues.padding.extraLarge}px` }}
        >
          <div
            className="text-[#30D6D6]/70"
            style={{ fontSize: `${scaledValues.text.extraSmall}px` }}
          >
            No results found
          </div>
          <div
            className="text-[#006694]"
            style={{
              fontSize: `${scaledValues.text.extraSmall}px`,
              marginTop: `${scaledValues.spacing.marginSmall}px`,
            }}
          >
            Try adjusting your search or filters
          </div>
        </div>
      ) : (
        <div className="border border-[#30D6D6]/20">
          {getSortedFeedbacks.map((feedback, index) => (
            <FeedbackListItem
              key={feedback._id}
              feedback={feedback}
              isSelected={selectedIds.includes(feedback._id)}
              isDeleting={isDeletingIds.includes(feedback._id)}
              onSelect={handleSelect}
              onClick={onFeedbackClick || (() => {})}
              onDelete={onDeleteSingle || (() => {})}
              index={index}
              scaledValues={scaledValues}
            />
          ))}
        </div>
      )}
    </div>
  );
}
