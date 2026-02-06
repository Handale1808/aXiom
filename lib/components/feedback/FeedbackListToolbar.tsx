import FeedbackFilters from "./FeedbackFilters";
import FeedbackSearch from "./FeedbackSearch";
import { useState, useEffect, useRef } from "react";
import type { ScaledValues } from "@/lib/hooks/useResponsiveScaling";

interface FeedbackListToolbarProps {
  // Filter props
  isFilterOpen: boolean;
  onFilterToggle: () => void;
  selectedSentiments: string[];
  selectedPriorities: string[];
  selectedTags: string[];
  availableTags: string[];
  onSentimentChange: (sentiments: string[]) => void;
  onPriorityChange: (priorities: string[]) => void;
  onTagChange: (tags: string[]) => void;
  onClearAllFilters: () => void;
  activeFilterCount: number;
  // Search props
  isSearchOpen: boolean;
  onSearchToggle: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearSearch: () => void;
  // Sort props
  sortColumn: string | null;
  onClearSort: () => void;
  // Selection props
  selectedCount: number;
  onClearSelection: () => void;
  onDeleteSelected: () => void;
  hasCatFilter: string | null;
  onHasCatChange: (value: string | null) => void;
  scaledValues: ScaledValues;
}

export default function FeedbackListToolbar({
  isFilterOpen,
  onFilterToggle,
  selectedSentiments,
  selectedPriorities,
  selectedTags,
  availableTags,
  onSentimentChange,
  onPriorityChange,
  onTagChange,
  onClearAllFilters,
  activeFilterCount,
  isSearchOpen,
  onSearchToggle,
  searchQuery,
  onSearchChange,
  onClearSearch,
  sortColumn,
  onClearSort,
  selectedCount,
  onClearSelection,
  onDeleteSelected,
  hasCatFilter,
  onHasCatChange,
  scaledValues,
}: FeedbackListToolbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  return (
    <div
      className="border border-[#30D6D6]/30 bg-black/50 backdrop-blur-sm"
      style={{
        padding: `${scaledValues.container.padding}px`,
        marginBottom: `${scaledValues.spacing.marginMedium}px`,
      }}
    >
      <div className="flex items-center justify-between">
        {selectedCount > 0 && (
          <div
            className="flex flex-col sm:flex-row items-start sm:items-center flex-1"
            style={{ gap: `${scaledValues.spacing.gapMedium}px` }}
          >
            <div
              className="text-[#30D6D6]"
              style={{ fontSize: `${scaledValues.text.extraSmall}px` }}
            >
              {selectedCount} selected
            </div>
            <div
              className="flex flex-col sm:flex-row w-full sm:w-auto"
              style={{ gap: `${scaledValues.spacing.gapSmall}px` }}
            >
              <button
                onClick={onClearSelection}
                className="w-full sm:w-auto border border-yellow-500/50 bg-black font-bold tracking-wider text-yellow-500 transition-all hover:bg-yellow-500/10 hover:border-yellow-500 min-h-[44px]"
                style={{
                  paddingLeft: `${scaledValues.input.paddingX}px`,
                  paddingRight: `${scaledValues.input.paddingX}px`,
                  paddingTop: `${scaledValues.input.paddingY}px`,
                  paddingBottom: `${scaledValues.input.paddingY}px`,
                  fontSize: `${scaledValues.text.extraSmall}px`,
                }}
              >
                CLEAR_SELECTION
              </button>
              <button
                onClick={onDeleteSelected}
                className="w-full sm:w-auto border border-red-500 bg-black font-bold tracking-wider text-red-400 transition-all hover:bg-red-500 hover:text-black min-h-[44px]"
                style={{
                  paddingLeft: `${scaledValues.input.paddingX}px`,
                  paddingRight: `${scaledValues.input.paddingX}px`,
                  paddingTop: `${scaledValues.input.paddingY}px`,
                  paddingBottom: `${scaledValues.input.paddingY}px`,
                  fontSize: `${scaledValues.text.extraSmall}px`,
                }}
              >
                DELETE_SELECTED
              </button>
            </div>
          </div>
        )}

        <div
          className="flex ml-auto"
          style={{ gap: `${scaledValues.spacing.gapSmall}px` }}
        >
          <FeedbackSearch
            isOpen={isSearchOpen}
            onToggle={onSearchToggle}
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            onClearSearch={onClearSearch}
            scaledValues={scaledValues}
          />
          <FeedbackFilters
            isOpen={isFilterOpen}
            onToggle={onFilterToggle}
            selectedSentiments={selectedSentiments}
            selectedPriorities={selectedPriorities}
            selectedTags={selectedTags}
            availableTags={availableTags}
            onSentimentChange={onSentimentChange}
            onPriorityChange={onPriorityChange}
            onTagChange={onTagChange}
            onClearAll={onClearAllFilters}
            activeFilterCount={activeFilterCount}
            hasCatFilter={hasCatFilter}
            onHasCatChange={onHasCatChange}
            scaledValues={scaledValues}
          />
          <button
            onClick={onClearSort}
            disabled={!sortColumn}
            className="border border-[#30D6D6]/50 bg-black font-bold tracking-wider text-[#30D6D6] transition-all hover:bg-[#30D6D6]/10 hover:border-[#30D6D6] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-black disabled:hover:border-[#30D6D6]/50 min-h-[44px]"
            style={{
              paddingLeft: `${scaledValues.input.paddingX}px`,
              paddingRight: `${scaledValues.input.paddingX}px`,
              paddingTop: `${scaledValues.input.paddingY}px`,
              paddingBottom: `${scaledValues.input.paddingY}px`,
              fontSize: `${scaledValues.text.extraSmall}px`,
            }}
          >
            CLEAR_SORT
          </button>
        </div>
      </div>
    </div>
  );
}
