import FeedbackFilters from "./FeedbackFilters";
import FeedbackSearch from "./FeedbackSearch";

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
}: FeedbackListToolbarProps) {
  return (
    <div className="border border-[#30D6D6]/30 bg-black/50 p-4 backdrop-blur-sm mb-4">
      <div className="flex items-center justify-between">
        {selectedCount > 0 && (
          <div className="flex items-center gap-4">
            <div className="text-xs text-[#30D6D6]">
              {selectedCount} selected
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClearSelection}
                className="border border-yellow-500/50 bg-black px-4 py-2 text-xs font-bold tracking-wider text-yellow-500 transition-all hover:bg-yellow-500/10 hover:border-yellow-500"
              >
                CLEAR_SELECTION
              </button>
              <button
                onClick={onDeleteSelected}
                className="border border-red-500 bg-black px-4 py-2 text-xs font-bold tracking-wider text-red-400 transition-all hover:bg-red-500 hover:text-black"
              >
                DELETE_SELECTED
              </button>
            </div>
          </div>
        )}
        <div className="flex gap-2 ml-auto">
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
  );
}