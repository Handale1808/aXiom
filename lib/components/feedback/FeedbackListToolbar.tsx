import FeedbackFilters from "./FeedbackFilters";
import FeedbackSearch from "./FeedbackSearch";
import MobileMenuButton from "./MobileMenuButton";
import { useState, useEffect, useRef } from "react";

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
}: FeedbackListToolbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        toolbarRef.current &&
        !toolbarRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleSearchClick = () => {
    onSearchToggle();
    closeMobileMenu();
  };

  const handleFilterClick = () => {
    onFilterToggle();
    closeMobileMenu();
  };

  return (
    <div ref={toolbarRef} className="border border-[#30D6D6]/30 bg-black/50 p-4 backdrop-blur-sm mb-4">
      <div className="flex items-center justify-between">
        {selectedCount > 0 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 flex-1">
            <div className="text-xs text-[#30D6D6]">
              {selectedCount} selected
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                onClick={onClearSelection}
                className="w-full sm:w-auto border border-yellow-500/50 bg-black px-3 py-2 sm:px-4 sm:py-2 text-xs font-bold tracking-wider text-yellow-500 transition-all hover:bg-yellow-500/10 hover:border-yellow-500 min-h-[44px]"
              >
                CLEAR_SELECTION
              </button>
              <button
                onClick={onDeleteSelected}
                className="w-full sm:w-auto border border-red-500 bg-black px-3 py-2 sm:px-4 sm:py-2 text-xs font-bold tracking-wider text-red-400 transition-all hover:bg-red-500 hover:text-black min-h-[44px]"
              >
                DELETE_SELECTED
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-2 ml-auto relative" ref={mobileMenuRef}>
          <MobileMenuButton
            isOpen={isMobileMenuOpen}
            onToggle={handleMobileMenuToggle}
          />

          {isMobileMenuOpen && (
            <div className="absolute right-0 top-full mt-2 z-20 w-64 border-2 border-[#30D6D6]/30 bg-black/95 backdrop-blur-sm md:hidden">
              <div className="absolute -left-px -top-px h-3 w-3 border-l-2 border-t-2 border-[#30D6D6]" />
              <div className="absolute -right-px -top-px h-3 w-3 border-r-2 border-t-2 border-[#30D6D6]" />
              <div className="absolute -bottom-px -left-px h-3 w-3 border-b-2 border-l-2 border-[#30D6D6]" />
              <div className="absolute -bottom-px -right-px h-3 w-3 border-b-2 border-r-2 border-[#30D6D6]" />

              <div className="flex flex-col gap-2 p-4">
                <button
                  onClick={handleSearchClick}
                  className="relative w-full border border-[#30D6D6]/50 bg-black px-4 py-2.5 text-xs font-bold tracking-wider text-[#30D6D6] transition-all hover:bg-[#30D6D6]/10 hover:border-[#30D6D6] text-left min-h-[44px]"
                >
                  SEARCH
                  {searchQuery && (
                    <span className="ml-2 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#30D6D6] text-[10px] font-bold text-black shadow-[0_0_8px_rgba(48,214,214,0.8)]">
                      1
                    </span>
                  )}
                </button>

                <button
                  onClick={handleFilterClick}
                  className="relative w-full border border-[#30D6D6]/50 bg-black px-4 py-2.5 text-xs font-bold tracking-wider text-[#30D6D6] transition-all hover:bg-[#30D6D6]/10 hover:border-[#30D6D6] text-left min-h-[44px]"
                >
                  FILTER
                  {activeFilterCount > 0 && (
                    <span className="ml-2 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#30D6D6] text-[10px] font-bold text-black shadow-[0_0_8px_rgba(48,214,214,0.8)]">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    onClearSort();
                    closeMobileMenu();
                  }}
                  disabled={!sortColumn}
                  className="w-full border border-[#30D6D6]/50 bg-black px-4 py-2.5 text-xs font-bold tracking-wider text-[#30D6D6] transition-all hover:bg-[#30D6D6]/10 hover:border-[#30D6D6] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-black disabled:hover:border-[#30D6D6]/50 text-left min-h-[44px]"
                >
                  CLEAR_SORT
                </button>
              </div>
            </div>
          )}

          <div className="hidden md:flex md:gap-2">
            <FeedbackSearch
              isOpen={isSearchOpen}
              onToggle={onSearchToggle}
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
              onClearSearch={onClearSearch}
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
            />
            <button
              onClick={onClearSort}
              disabled={!sortColumn}
              className="border border-[#30D6D6]/50 bg-black px-4 py-2 text-xs font-bold tracking-wider text-[#30D6D6] transition-all hover:bg-[#30D6D6]/10 hover:border-[#30D6D6] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-black disabled:hover:border-[#30D6D6]/50"
            >
              CLEAR_SORT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}