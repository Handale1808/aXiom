// lib/components/FeedbackList.tsx

import FeedbackFilters from "./FeedbackFilters";
import FeedbackSearch from "./FeedbackSearch";

interface FeedbackItem {
  _id: string;
  text: string;
  analysis: {
    sentiment: string;
    priority: string;
    tags?: string[];
  };
  createdAt?: string;
}

interface FeedbackListProps {
  feedbacks: FeedbackItem[];
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
}: FeedbackListProps) {
  const hasNoResults = feedbacks.length === 0;

  const getSentimentColor = (sentiment: string) => {
    const s = sentiment.toLowerCase();
    if (s.includes("positive")) return "text-[#30D6D6]";
    if (s.includes("negative")) return "text-red-400";
    return "text-[#006694]";
  };

  const getPriorityIndicator = (priority: string) => {
    const p = priority.toLowerCase();
    if (p.includes("p3")) return { color: "#30D6D6" };
    if (p.includes("p2")) return { color: "#6CBE4D" };
    if (p.includes("p1")) return { color: "#a44aff" };
    if (p.includes("p0")) return { color: "#BB489A" };
    return { color: "#BB489A" };
  };

  const getSortedFeedbacks = () => {
    const sorted = [...feedbacks].sort((a, b) => {
      if (!sortColumn) {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      }

      let compareA: any;
      let compareB: any;

      switch (sortColumn) {
        case "text":
          compareA = a.text.toLowerCase();
          compareB = b.text.toLowerCase();
          break;
        case "sentiment":
          const sentimentOrder: Record<string, number> = {
            positive: 3,
            neutral: 2,
            negative: 1,
          };
          compareA = sentimentOrder[a.analysis.sentiment.toLowerCase()] || 0;
          compareB = sentimentOrder[b.analysis.sentiment.toLowerCase()] || 0;
          break;
        case "priority":
          const priorityOrder: Record<string, number> = {
            p0: 4,
            p1: 3,
            p2: 2,
            p3: 1,
          };
          const getPriorityValue = (priority: string) => {
            const match = priority.toLowerCase().match(/p[0-3]/);
            return match ? priorityOrder[match[0]] || 0 : 0;
          };
          compareA = getPriorityValue(a.analysis.priority);
          compareB = getPriorityValue(b.analysis.priority);
          break;
        default:
          return 0;
      }

      if (compareA < compareB) return sortDirection === "asc" ? -1 : 1;
      if (compareA > compareB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  };

  const handleSelectAll = () => {
    if (selectedIds.length === feedbacks.length) {
      onSelectionChange?.([]);
    } else {
      onSelectionChange?.(feedbacks.map((f) => f._id));
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange?.(
        selectedIds.filter((selectedId) => selectedId !== id)
      );
    } else {
      onSelectionChange?.([...selectedIds, id]);
    }
  };

  const isAllSelected =
    feedbacks.length > 0 && selectedIds.length === feedbacks.length;

  const SortArrow = ({ column }: { column: string }) => {
    if (sortColumn !== column) return null;
    return <span className="ml-1">{sortDirection === "asc" ? "▲" : "▼"}</span>;
  };

  return (
    <div className="mt-8 font-mono">
      <div className="mb-4 border-b border-[#30D6D6]/30 pb-2">
        <div className="flex justify-between items-center">
          <p className="text-xs text-[#006694]">
            Total Records: {feedbacks.length}
          </p>
          {selectedIds.length > 0 && (
            <div className="mb-4 border-2 border-yellow-500/50 bg-yellow-950/20 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold tracking-wider text-yellow-500 mr-10">
                    {selectedIds.length} ITEMS_SELECTED
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onSelectionChange?.([])}
                    className="border border-yellow-500/50 bg-black px-4 py-2 text-xs font-bold tracking-wider text-yellow-500 transition-all hover:bg-yellow-500/10 hover:border-yellow-500"
                  >
                    CLEAR_SELECTION
                  </button>
                  <button
                    onClick={() => onDeleteMultiple?.(selectedIds)}
                    className="border border-red-500 bg-black px-4 py-2 text-xs font-bold tracking-wider text-red-400 transition-all hover:bg-red-500 hover:text-black"
                  >
                    DELETE_SELECTED
                  </button>
                </div>
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <FeedbackSearch
              isOpen={isSearchOpen}
              onToggle={onSearchToggle || (() => {})}
              searchQuery={searchQuery}
              onSearchChange={onSearchChange || (() => {})}
              onClearSearch={onClearSearch || (() => {})}
            />
            <FeedbackFilters
              isOpen={isFilterOpen}
              onToggle={onFilterToggle || (() => {})}
              selectedSentiments={selectedSentiments}
              selectedPriorities={selectedPriorities}
              selectedTags={selectedTags}
              availableTags={availableTags}
              onSentimentChange={onSentimentChange || (() => {})}
              onPriorityChange={onPriorityChange || (() => {})}
              onTagChange={onTagChange || (() => {})}
              onClearAll={onClearAllFilters || (() => {})}
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

      {hasNoResults ? null : (
        <div className="border border-[#30D6D6]/20">
          <div className="grid grid-cols-[40px_1fr_120px_120px_60px_60px] gap-4 border-b-2 border-[#30D6D6]/50 bg-[#006694]/20 px-4 py-2 text-xs font-bold tracking-wider text-[#30D6D6]">
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={handleSelectAll}
                className="h-4 w-4 cursor-pointer appearance-none border border-[#30D6D6]/50 bg-black checked:bg-black checked:border-[#30D6D6] checked:before:content-['✓'] checked:before:text-[#30D6D6] checked:before:text-xs checked:before:flex checked:before:items-center checked:before:justify-center"
                aria-label="Select all feedbacks"
              />
            </div>
            <div
              className="cursor-pointer hover:text-white transition-colors"
              onClick={() => onSort?.("text")}
            >
              FEEDBACK_TEXT
              <SortArrow column="text" />
            </div>
            <div
              className="cursor-pointer hover:text-white transition-colors"
              onClick={() => onSort?.("sentiment")}
            >
              SENTIMENT
              <SortArrow column="sentiment" />
            </div>
            <div
              className="cursor-pointer hover:text-white transition-colors"
              onClick={() => onSort?.("priority")}
            >
              PRIORITY
              <SortArrow column="priority" />
            </div>
            <div>VIEW</div>
            <div>DELETE</div>
          </div>
          {getSortedFeedbacks().map((feedback, index) => (
            <div
              key={feedback._id}
              className={`group grid grid-cols-[40px_1fr_120px_120px_60px_60px] gap-4 px-4 py-3 transition-all hover:bg-[#30D6D6]/10 ${
                index % 2 === 0 ? "bg-black/40" : "bg-[#006694]/10"
              } ${isDeletingIds.includes(feedback._id) ? "opacity-50" : ""}`}
            >
              <div className="flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(feedback._id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleSelectOne(feedback._id);
                  }}
                  disabled={isDeletingIds.includes(feedback._id)}
                  className="h-4 w-4 cursor-pointer appearance-none border border-[#30D6D6]/50 bg-black checked:bg-black checked:border-[#30D6D6] checked:before:content-['✓'] checked:before:text-[#30D6D6] checked:before:text-xs checked:before:flex checked:before:items-center checked:before:justify-center"
                  aria-label={`Select feedback ${feedback._id}`}
                />
              </div>
              <div
                className="flex flex-col gap-1 min-w-0 cursor-pointer"
                onClick={() => onFeedbackClick?.(feedback._id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onFeedbackClick?.(feedback._id);
                  }
                }}
              >
                <div className="text-sm text-cyan-100/90 truncate">
                  {feedback.text}
                </div>
                {feedback.analysis.tags &&
                  feedback.analysis.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {feedback.analysis.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 border border-[#30D6D6]/50 bg-black text-[#30D6D6] rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span
                  className={`font-bold capitalize ${getSentimentColor(
                    feedback.analysis.sentiment
                  )}`}
                >
                  {feedback.analysis.sentiment}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                {(() => {
                  const { color } = getPriorityIndicator(
                    feedback.analysis.priority
                  );
                  return (
                    <>
                      <div
                        className="h-2 w-2"
                        style={{
                          backgroundColor: color,
                          boxShadow: `0 0 8px ${color}80`,
                        }}
                      />
                      <span className="ml-2 text-[#30D6D6]">
                        {feedback.analysis.priority}
                      </span>
                    </>
                  );
                })()}
              </div>
              <div
                className="flex items-center text-xs text-[#006694] group-hover:text-[#30D6D6] cursor-pointer"
                onClick={() => onFeedbackClick?.(feedback._id)}
              >
                {">"} VIEW
              </div>
              <div className="flex items-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSingle?.(feedback._id);
                  }}
                  disabled={isDeletingIds.includes(feedback._id)}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  aria-label={`Delete feedback ${feedback._id}`}
                >
                  {isDeletingIds.includes(feedback._id) ? (
                    <div className="h-2 w-2 animate-pulse bg-red-400" />
                  ) : (
                    "DEL"
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
