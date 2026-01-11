import { useEffect } from "react";
import { usePopupPosition } from "../../hooks/usePopupPosition";
import type { ScaledValues } from "../../hooks/useResponsiveScaling";

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
  scaledValues: ScaledValues;
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
  scaledValues,
}: FeedbackFiltersProps) {
  const sentimentOptions = ["Positive", "Neutral", "Negative"];
  const priorityOptions = ["P0", "P1", "P2", "P3"];

  const { triggerRef, popupRef, popupStyle } = usePopupPosition({
    isOpen,
    minSpacing: 2,
    popupWidth: 800,
  });

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      const isOutsideTrigger =
        triggerRef.current && !triggerRef.current.contains(target);
      const isOutsidePopup =
        popupRef.current && !popupRef.current.contains(target);

      if (isOutsideTrigger && isOutsidePopup) {
        onToggle();
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
    <div ref={triggerRef} className="relative">
      <button
        onClick={onToggle}
        className="relative border border-[#30D6D6]/50 bg-black font-bold tracking-wider text-[#30D6D6] transition-all hover:bg-[#30D6D6]/10 hover:border-[#30D6D6] min-h-[44px]"
        style={{
          paddingLeft: `${scaledValues.input.paddingX}px`,
          paddingRight: `${scaledValues.input.paddingX}px`,
          paddingTop: `${scaledValues.input.paddingY}px`,
          paddingBottom: `${scaledValues.input.paddingY}px`,
          fontSize: `${scaledValues.text.extraSmall}px`,
        }}
      >
        FILTER
        {activeFilterCount > 0 && (
          <span
            className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#30D6D6] font-bold text-black shadow-[0_0_8px_rgba(48,214,214,0.8)]"
            style={{
              marginLeft: `${scaledValues.spacing.gapSmall}px`,
              fontSize: `${scaledValues.text.extraSmall}px`,
            }}
          >
            {" "}
            {activeFilterCount}
          </span>
        )}
      </button>
      {isOpen && (
        <div
          ref={popupRef}
          style={{
            ...popupStyle,
            padding: `${scaledValues.padding.large}px`,
          }}
          className="fixed z-10 border-2 border-[#30D6D6]/30 bg-black/95 backdrop-blur-sm"
        >
          {" "}
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
            [FILTER_OPTIONS]
          </h3>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[auto_auto_auto_1fr]"
            style={{
              gap: `${scaledValues.spacing.gapLarge}px`,
              marginBottom: `${scaledValues.spacing.marginMedium}px`,
            }}
          >
            <div>
              <div
                className="font-bold tracking-wider text-[#006694]"
                style={{
                  marginBottom: `${scaledValues.spacing.marginSmall}px`,
                  fontSize: `${scaledValues.text.extraSmall}px`,
                }}
              >
                SENTIMENT
              </div>
              <div className="space-y-3 sm:space-y-2">
                {sentimentOptions.map((sentiment) => (
                  <label
                    key={sentiment}
                    className="flex items-center cursor-pointer text-cyan-100/70 hover:text-[#30D6D6] transition-colors"
                    style={{
                      gap: `${scaledValues.spacing.gapSmall}px`,
                      fontSize: `${scaledValues.label.fontSize}px`,
                    }}
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
                      className="cursor-pointer appearance-none border border-[#30D6D6]/50 bg-black checked:bg-black checked:border-[#30D6D6] checked:before:content-['✓'] checked:before:text-[#30D6D6] checked:before:text-xs checked:before:flex checked:before:items-center checked:before:justify-center"
                      style={{
                        height: `${scaledValues.interactive.checkboxSmall}px`,
                        width: `${scaledValues.interactive.checkboxSmall}px`,
                      }}
                    />
                    {sentiment}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div
                className="font-bold tracking-wider text-[#006694]"
                style={{
                  marginBottom: `${scaledValues.spacing.marginSmall}px`,
                  fontSize: `${scaledValues.text.extraSmall}px`,
                }}
              >
                PRIORITY
              </div>
              <div className="space-y-3 sm:space-y-2">
                {priorityOptions.map((priority) => (
                  <label
                    key={priority}
                    className="flex items-center cursor-pointer text-cyan-100/70 hover:text-[#30D6D6] transition-colors"
                    style={{
                      gap: `${scaledValues.spacing.gapSmall}px`,
                      fontSize: `${scaledValues.label.fontSize}px`,
                    }}
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
                      className="cursor-pointer appearance-none border border-[#30D6D6]/50 bg-black checked:bg-black checked:border-[#30D6D6] checked:before:content-['✓'] checked:before:text-[#30D6D6] checked:before:text-xs checked:before:flex checked:before:items-center checked:before:justify-center"
                      style={{
                        height: `${scaledValues.interactive.checkboxSmall}px`,
                        width: `${scaledValues.interactive.checkboxSmall}px`,
                      }}
                    />
                    {priority}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div
                className="font-bold tracking-wider text-[#006694]"
                style={{
                  marginBottom: `${scaledValues.spacing.marginSmall}px`,
                  fontSize: `${scaledValues.text.extraSmall}px`,
                }}
              >
                CAT_ASSOCIATION
              </div>
              <div className="space-y-3 sm:space-y-2">
                <label
                  className="flex items-center cursor-pointer text-cyan-100/70 hover:text-[#30D6D6] transition-colors"
                  style={{
                    gap: `${scaledValues.spacing.gapSmall}px`,
                    fontSize: `${scaledValues.label.fontSize}px`,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={hasCatFilter === "true"}
                    onChange={() =>
                      onHasCatChange(hasCatFilter === "true" ? null : "true")
                    }
                    className="cursor-pointer appearance-none border border-[#30D6D6]/50 bg-black checked:bg-black checked:border-[#30D6D6] checked:before:content-['✓'] checked:before:text-[#30D6D6] checked:before:text-xs checked:before:flex checked:before:items-center checked:before:justify-center"
                    style={{
                      height: `${scaledValues.interactive.checkboxSmall}px`,
                      width: `${scaledValues.interactive.checkboxSmall}px`,
                    }}
                  />
                  Has Cat
                </label>
                <label
                  className="flex items-center cursor-pointer text-cyan-100/70 hover:text-[#30D6D6] transition-colors"
                  style={{
                    gap: `${scaledValues.spacing.gapSmall}px`,
                    fontSize: `${scaledValues.label.fontSize}px`,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={hasCatFilter === "false"}
                    onChange={() =>
                      onHasCatChange(hasCatFilter === "false" ? null : "false")
                    }
                    className="cursor-pointer appearance-none border border-[#30D6D6]/50 bg-black checked:bg-black checked:border-[#30D6D6] checked:before:content-['✓'] checked:before:text-[#30D6D6] checked:before:text-xs checked:before:flex checked:before:items-center checked:before:justify-center"
                    style={{
                      height: `${scaledValues.interactive.checkboxSmall}px`,
                      width: `${scaledValues.interactive.checkboxSmall}px`,
                    }}
                  />
                  General Feedback
                </label>
              </div>
            </div>

            <div>
              <div
                className="font-bold tracking-wider text-[#006694]"
                style={{
                  marginBottom: `${scaledValues.spacing.marginSmall}px`,
                  fontSize: `${scaledValues.text.extraSmall}px`,
                }}
              >
                TAGS
              </div>
              <div
                className="overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-black [&::-webkit-scrollbar-thumb]:bg-[#30D6D6]/50 [&::-webkit-scrollbar-thumb]:border [&::-webkit-scrollbar-thumb]:border-[#30D6D6] [&::-webkit-scrollbar-thumb]:hover:bg-[#30D6D6] [&::-webkit-scrollbar-thumb]:hover:shadow-[0_0_10px_rgba(48,214,214,0.8)]"
                style={{
                  maxHeight: `${scaledValues.layout.maxHeightScrollable}px`,
                }}
              >
                {" "}
                {availableTags.length === 0 ? (
                  <div
                    className="text-[#006694]"
                    style={{ fontSize: `${scaledValues.text.extraSmall}px` }}
                  >
                    No tags available
                  </div>
                ) : (
                  <div
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
                    style={{ gap: `${scaledValues.spacing.gapSmall}px` }}
                  >
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
                          className="flex items-center cursor-pointer text-cyan-100/70 hover:text-[#30D6D6] transition-colors"
                          style={{
                            gap: `${scaledValues.spacing.gapSmall}px`,
                            fontSize: `${scaledValues.label.fontSize}px`,
                          }}
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
            className="w-full border border-[#30D6D6]/50 bg-black font-bold tracking-wider text-[#30D6D6] transition-all hover:bg-[#30D6D6]/10 hover:border-[#30D6D6] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-black disabled:hover:border-[#30D6D6]/50 min-h-[44px]"
            style={{
              paddingLeft: `${scaledValues.input.paddingX}px`,
              paddingRight: `${scaledValues.input.paddingX}px`,
              paddingTop: `${scaledValues.input.paddingY}px`,
              paddingBottom: `${scaledValues.input.paddingY}px`,
              fontSize: `${scaledValues.text.extraSmall}px`,
            }}
          >
            CLEAR_ALL_FILTERS
          </button>
        </div>
      )}
    </div>
  );
}
