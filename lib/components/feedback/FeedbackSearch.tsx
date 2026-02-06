import { useEffect } from "react";
import { usePopupPosition } from "../../hooks/usePopupPosition";
import type { ScaledValues } from "../../hooks/useResponsiveScaling";

interface FeedbackSearchProps {
  isOpen: boolean;
  onToggle: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearSearch: () => void;
  scaledValues: ScaledValues;
}

export default function FeedbackSearch({
  isOpen,
  onToggle,
  searchQuery,
  onSearchChange,
  onClearSearch,
  scaledValues,
}: FeedbackSearchProps) {
  const { triggerRef, popupRef, popupStyle } = usePopupPosition({
    isOpen,
    minSpacing: 2,
    popupWidth: 400,
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
        SEARCH
        {searchQuery && (
          <span
            className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#30D6D6] font-bold text-black shadow-[0_0_8px_rgba(48,214,214,0.8)]"
            style={{
              marginLeft: `${scaledValues.spacing.gapSmall}px`,
              fontSize: `${scaledValues.text.extraSmall}px`,
            }}
          >
            {" "}
            1
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
            [SEARCH_DATABASE]
          </h3>
          <div
            style={{ marginBottom: `${scaledValues.spacing.marginSmall}px` }}
          >
            <label
              className="block font-bold tracking-wider text-[#006694]"
              style={{
                marginBottom: `${scaledValues.spacing.marginSmall}px`,
                fontSize: `${scaledValues.text.extraSmall}px`,
              }}
            >
              SEARCH_QUERY
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search feedback text and tags..."
              className="w-full bg-black border border-[#30D6D6]/50 text-cyan-100 placeholder-[#006694] focus:outline-none focus:border-[#30D6D6] transition-colors min-h-[44px]"
              style={{
                paddingLeft: `${scaledValues.input.paddingX}px`,
                paddingRight: `${scaledValues.input.paddingX}px`,
                paddingTop: `${scaledValues.input.paddingY}px`,
                paddingBottom: `${scaledValues.input.paddingY}px`,
                fontSize: `${scaledValues.input.fontSize}px`,
              }}
            />
          </div>
          <button
            onClick={onClearSearch}
            disabled={!searchQuery}
            className="w-full border border-[#30D6D6]/50 bg-black font-bold tracking-wider text-[#30D6D6] transition-all hover:bg-[#30D6D6]/10 hover:border-[#30D6D6] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-black disabled:hover:border-[#30D6D6]/50 min-h-[44px]"
            style={{
              paddingLeft: `${scaledValues.input.paddingX}px`,
              paddingRight: `${scaledValues.input.paddingX}px`,
              paddingTop: `${scaledValues.input.paddingY}px`,
              paddingBottom: `${scaledValues.input.paddingY}px`,
              fontSize: `${scaledValues.text.extraSmall}px`,
            }}
          >
            CLEAR_SEARCH
          </button>
        </div>
      )}
    </div>
  );
}
