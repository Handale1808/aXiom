import { useEffect, useRef } from "react";

interface FeedbackFiltersProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedSentiments: string[];
  selectedPriorities: string[];
  selectedTags: string[];
  availableTags: string[];
  onSentimentChange: (sentiments: string[]) => void;
  onPriorityChange: (priorities: string[]) => void;
  onTagChange: (tags: string[]) => void;
  onClearAll: () => void;
  activeFilterCount: number;
  hasCatFilter: string | null;
  onHasCatChange: (value: string | null) => void;
}

export default function FeedbackFilters({
  isOpen,
  onToggle,
  selectedSentiments,
  selectedPriorities,
  selectedTags,
  availableTags,
  onSentimentChange,
  onPriorityChange,
  onTagChange,
  onClearAll,
  activeFilterCount,
  hasCatFilter,
  onHasCatChange,
}: FeedbackFiltersProps) {
  const sentimentOptions = ["Positive", "Neutral", "Negative"];
  const priorityOptions = ["P0", "P1", "P2", "P3"];

  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      if (filterRef.current && !filterRef.current.contains(target)) {
        const toolbar = document.querySelector('[ref="toolbarRef"]');
        if (toolbar && !toolbar.contains(target)) {
          onToggle();
        } else if (!toolbar) {
          onToggle();
        }
      }
    };

    setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onToggle]);

  const handleCheckboxChange = (
    value: string,
    currentSelection: string[],
    onChange: (values: string[]) => void
  ) => {
    if (currentSelection.includes(value)) {
      onChange(currentSelection.filter((item) => item !== value));
    } else {
      onChange([...currentSelection, value]);
    }
  };

  return (
    <div ref={filterRef} className="relative">
      <button
        onClick={onToggle}
        className="relative border border-[#30D6D6]/50 bg-black px-3 py-2 sm:px-4 sm:py-2 text-xs font-bold tracking-wider text-[#30D6D6] transition-all hover:bg-[#30D6D6]/10 hover:border-[#30D6D6] min-h-[44px]"
      >
        FILTER
        {activeFilterCount > 0 && (
          <span className="ml-2 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#30D6D6] text-[10px] font-bold text-black shadow-[0_0_8px_rgba(48,214,214,0.8)]">
            {activeFilterCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 md:left-auto md:right-0 top-full mt-2 z-10 w-screen max-w-[calc(100vw-16px)] md:w-[800px] border-2 border-[#30D6D6]/30 bg-black/95 p-4 md:p-6 backdrop-blur-sm">
          <div className="absolute -left-px -top-px h-3 w-3 md:h-4 md:w-4 border-l-2 border-t-2 border-[#30D6D6]" />
          <div className="absolute -right-px -top-px h-3 w-3 md:h-4 md:w-4 border-r-2 border-t-2 border-[#30D6D6]" />
          <div className="absolute -bottom-px -left-px h-3 w-3 md:h-4 md:w-4 border-b-2 border-l-2 border-[#30D6D6]" />
          <div className="absolute -bottom-px -right-px h-3 w-3 md:h-4 md:w-4 border-b-2 border-r-2 border-[#30D6D6]" />

          <h3 className="mb-3 md:mb-4 text-xs sm:text-sm font-bold tracking-widest text-[#30D6D6]">
            [FILTER_OPTIONS]
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[auto_auto_auto_1fr] gap-4 md:gap-6 mb-4 md:mb-6">
            <div>
              <div className="mb-3 text-[10px] sm:text-xs font-bold tracking-wider text-[#006694]">
                SENTIMENT
              </div>
              <div className="space-y-3 sm:space-y-2">
                {sentimentOptions.map((sentiment) => (
                  <label
                    key={sentiment}
                    className="flex items-center gap-3 sm:gap-2 cursor-pointer text-xs sm:text-sm text-cyan-100/70 hover:text-[#30D6D6] transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSentiments.includes(sentiment)}
                      onChange={() =>
                        handleCheckboxChange(
                          sentiment,
                          selectedSentiments,
                          onSentimentChange
                        )
                      }
                      className="h-4 w-4 cursor-pointer appearance-none border border-[#30D6D6]/50 bg-black checked:bg-black checked:border-[#30D6D6] checked:before:content-['✓'] checked:before:text-[#30D6D6] checked:before:text-xs checked:before:flex checked:before:items-center checked:before:justify-center"
                    />
                    {sentiment}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-3 text-[10px] sm:text-xs font-bold tracking-wider text-[#006694]">
                PRIORITY
              </div>
              <div className="space-y-3 sm:space-y-2">
                {priorityOptions.map((priority) => (
                  <label
                    key={priority}
                    className="flex items-center gap-3 sm:gap-2 cursor-pointer text-xs sm:text-sm text-cyan-100/70 hover:text-[#30D6D6] transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPriorities.includes(priority)}
                      onChange={() =>
                        handleCheckboxChange(
                          priority,
                          selectedPriorities,
                          onPriorityChange
                        )
                      }
                      className="h-4 w-4 cursor-pointer appearance-none border border-[#30D6D6]/50 bg-black checked:bg-black checked:border-[#30D6D6] checked:before:content-['✓'] checked:before:text-[#30D6D6] checked:before:text-xs checked:before:flex checked:before:items-center checked:before:justify-center"
                    />
                    {priority}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-3 text-[10px] sm:text-xs font-bold tracking-wider text-[#006694]">
                CAT_ASSOCIATION
              </div>
              <div className="space-y-3 sm:space-y-2">
                <label className="flex items-center gap-3 sm:gap-2 cursor-pointer text-xs sm:text-sm text-cyan-100/70 hover:text-[#30D6D6] transition-colors">
                  <input
                    type="checkbox"
                    checked={hasCatFilter === "true"}
                    onChange={() =>
                      onHasCatChange(hasCatFilter === "true" ? null : "true")
                    }
                    className="h-4 w-4 cursor-pointer appearance-none border border-[#30D6D6]/50 bg-black checked:bg-black checked:border-[#30D6D6] checked:before:content-['✓'] checked:before:text-[#30D6D6] checked:before:text-xs checked:before:flex checked:before:items-center checked:before:justify-center"
                  />
                  Has Cat
                </label>
                <label className="flex items-center gap-3 sm:gap-2 cursor-pointer text-xs sm:text-sm text-cyan-100/70 hover:text-[#30D6D6] transition-colors">
                  <input
                    type="checkbox"
                    checked={hasCatFilter === "false"}
                    onChange={() =>
                      onHasCatChange(hasCatFilter === "false" ? null : "false")
                    }
                    className="h-4 w-4 cursor-pointer appearance-none border border-[#30D6D6]/50 bg-black checked:bg-black checked:border-[#30D6D6] checked:before:content-['✓'] checked:before:text-[#30D6D6] checked:before:text-xs checked:before:flex checked:before:items-center checked:before:justify-center"
                  />
                  General Feedback
                </label>
              </div>
            </div>

            <div>
              <div className="mb-3 text-[10px] sm:text-xs font-bold tracking-wider text-[#006694]">
                TAGS
              </div>
              <div className="max-h-40 sm:max-h-32 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-black [&::-webkit-scrollbar-thumb]:bg-[#30D6D6]/50 [&::-webkit-scrollbar-thumb]:border [&::-webkit-scrollbar-thumb]:border-[#30D6D6] [&::-webkit-scrollbar-thumb]:hover:bg-[#30D6D6] [&::-webkit-scrollbar-thumb]:hover:shadow-[0_0_10px_rgba(48,214,214,0.8)]">
                {availableTags.length === 0 ? (
                  <div className="text-[10px] sm:text-xs text-[#006694]">
                    No tags available
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {[...availableTags]
                      .sort((a, b) => {
                        const aSelected = selectedTags.includes(a);
                        const bSelected = selectedTags.includes(b);
                        if (aSelected && !bSelected) return -1;
                        if (!aSelected && bSelected) return 1;
                        return 0;
                      })
                      .map((tag) => (
                        <label
                          key={tag}
                          className="flex items-center gap-3 sm:gap-2 cursor-pointer text-xs sm:text-sm text-cyan-100/70 hover:text-[#30D6D6] transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedTags.includes(tag)}
                            onChange={() =>
                              handleCheckboxChange(
                                tag,
                                selectedTags,
                                onTagChange
                              )
                            }
                            className="h-4 w-4 cursor-pointer appearance-none flex-shrink-0 border border-[#30D6D6]/50 bg-black checked:bg-black checked:border-[#30D6D6] checked:before:content-['✓'] checked:before:text-[#30D6D6] checked:before:text-xs checked:before:flex checked:before:items-center checked:before:justify-center"
                          />
                          <span className="truncate">{tag}</span>
                        </label>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClearAll}
            disabled={activeFilterCount === 0}
            className="w-full border border-[#30D6D6]/50 bg-black px-4 py-2.5 sm:py-2 text-xs font-bold tracking-wider text-[#30D6D6] transition-all hover:bg-[#30D6D6]/10 hover:border-[#30D6D6] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-black disabled:hover:border-[#30D6D6]/50 min-h-[44px]"
          >
            CLEAR_ALL_FILTERS
          </button>
        </div>
      )}
    </div>
  );
}