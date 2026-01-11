import type { FeedbackWithId } from "@/lib/types/api";
import type { ScaledValues } from "@/lib/hooks/useResponsiveScaling";

interface FeedbackListItemProps {
  feedback: FeedbackWithId;
  isSelected: boolean;
  isDeleting: boolean;
  onSelect: (id: string) => void;
  onClick: (id: string) => void;
  onDelete: (id: string) => void;
  index: number;
  scaledValues: ScaledValues;
}

export default function FeedbackListItem({
  feedback,
  isSelected,
  isDeleting,
  onSelect,
  onClick,
  onDelete,
  index,
  scaledValues,
}: FeedbackListItemProps) {
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

  return (
    <div
      className={`group grid ${
        index % 2 === 0 ? "bg-black/40" : "bg-[#006694]/10"
      } ${isDeleting ? "opacity-50" : ""}`}
      style={{
        gridTemplateColumns: `${scaledValues.layout.gridCols.checkbox}px ${scaledValues.layout.gridCols.catIndicator}px 1fr ${scaledValues.layout.gridCols.sentiment}px ${scaledValues.layout.gridCols.priority}px ${scaledValues.layout.gridCols.view}px ${scaledValues.layout.gridCols.delete}px`,
        gap: `${scaledValues.spacing.gapSmall}px`,
        paddingLeft: `${scaledValues.spacing.gapSmall}px`,
        paddingRight: `${scaledValues.spacing.gapSmall}px`,
        paddingTop: `${scaledValues.input.paddingY}px`,
        paddingBottom: `${scaledValues.input.paddingY}px`
      }}
    >
      <div className="flex items-center justify-center">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(feedback._id)}
          className="cursor-pointer appearance-none border border-[#30D6D6]/50 bg-black checked:bg-black checked:border-[#30D6D6] checked:before:content-['✓'] checked:before:text-[#30D6D6] checked:before:text-xs checked:before:flex checked:before:items-center checked:before:justify-center"
          style={{
            height: `${scaledValues.interactive.checkboxLarge}px`,
            width: `${scaledValues.interactive.checkboxLarge}px`
          }}
          aria-label={`Select feedback ${feedback._id}`}
        />
      </div>

      <div className="flex items-center justify-center">
        {feedback.catId && (
          <div
            className="flex items-center justify-center border border-[#30D6D6] bg-[#30D6D6]/10"
            style={{
              width: `${scaledValues.interactive.iconSize}px`,
              height: `${scaledValues.interactive.iconSize}px`
            }}
            title={
              feedback.catName
                ? `Feedback about ${feedback.catName}`
                : "Feedback about a cat"
            }
          >
            <span 
              className="text-[#30D6D6] font-bold"
              style={{ fontSize: `${scaledValues.text.extraSmall}px` }}
            >
              C
            </span>
          </div>
        )}
      </div>

      <div
        className="cursor-pointer overflow-hidden"
        onClick={() => onClick(feedback._id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick(feedback._id);
          }
        }}
      >
        <div 
          className="text-cyan-100/90 truncate overflow-hidden text-ellipsis whitespace-nowrap"
          style={{ fontSize: `${scaledValues.label.fontSize}px` }}
        >
          {feedback.text}
        </div>
        {feedback.analysis.tags && feedback.analysis.tags.length > 0 && (
          <div 
            className="flex flex-wrap"
            style={{ 
              gap: `${scaledValues.spacing.gapSmall / 2}px`,
              marginTop: `${scaledValues.spacing.marginSmall / 2}px`
            }}
          >
            {feedback.analysis.tags.slice(0, 2).map((tag, idx) => (
              <span
                key={idx}
                className="border border-[#30D6D6]/50 bg-black text-[#30D6D6] rounded-md"
                style={{
                  fontSize: `${scaledValues.text.tiny}px`,
                  paddingLeft: `${scaledValues.interactive.tagPaddingX}px`,
                  paddingRight: `${scaledValues.interactive.tagPaddingX}px`,
                  paddingTop: `${scaledValues.interactive.tagPaddingY}px`,
                  paddingBottom: `${scaledValues.interactive.tagPaddingY}px`
                }}
              >
                {tag}
              </span>
            ))}
            {feedback.analysis.tags.length > 2 && (
              <span 
                className="text-[#30D6D6]/70"
                style={{
                  fontSize: `${scaledValues.text.tiny}px`,
                  paddingLeft: `${scaledValues.interactive.tagPaddingX}px`,
                  paddingTop: `${scaledValues.interactive.tagPaddingY}px`,
                  paddingBottom: `${scaledValues.interactive.tagPaddingY}px`
                }}
              >
                +{feedback.analysis.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
      <div 
        className="flex items-center"
        style={{ 
          gap: `${scaledValues.spacing.gapSmall / 2}px`,
          fontSize: `${scaledValues.text.extraSmall}px`
        }}
      >
        <span
          className={`font-bold capitalize ${getSentimentColor(
            feedback.analysis.sentiment
          )}`}
        >
          <span className="hidden sm:inline">
            {feedback.analysis.sentiment}
          </span>
          <span className="sm:hidden">
            {feedback.analysis.sentiment.toLowerCase().includes("positive")
              ? "Pos"
              : feedback.analysis.sentiment.toLowerCase().includes("negative")
                ? "Neg"
                : "Neu"}
          </span>
        </span>
      </div>
      <div 
        className="flex items-center"
        style={{ 
          gap: `${scaledValues.spacing.gapSmall / 2}px`,
          fontSize: `${scaledValues.text.extraSmall}px`
        }}
      >
        {(() => {
          const { color } = getPriorityIndicator(feedback.analysis.priority);
          return (
            <>
              <div
                style={{
                  height: `${scaledValues.interactive.loadingIndicator}px`,
                  width: `${scaledValues.interactive.loadingIndicator}px`,
                  backgroundColor: color,
                  boxShadow: `0 0 8px ${color}80`,
                }}
              />
              <span 
                className="text-[#30D6D6]"
                style={{ marginLeft: `${scaledValues.spacing.gapSmall}px` }}
              >
                {feedback.analysis.priority}
              </span>
            </>
          );
        })()}
      </div>
      {scaledValues.layout.gridCols.view > 0 && (
        <div
          className="hidden md:flex items-center justify-center text-[#006694] group-hover:text-[#30D6D6] cursor-pointer"
          style={{ fontSize: `${scaledValues.text.extraSmall}px` }}
          onClick={() => onClick(feedback._id)}
        >
          <span className="hidden sm:inline">{">"} VIEW</span>
          <span className="sm:hidden">{">"}</span>
        </div>
      )}
      {scaledValues.layout.gridCols.delete > 0 && (
        <div className="hidden md:flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(feedback._id);
            }}
            disabled={isDeleting}
            className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-h-[44px] md:min-h-0"
            style={{ 
              fontSize: `${scaledValues.text.extraSmall}px`,
              gap: `${scaledValues.spacing.gapSmall / 2}px`
            }}
            aria-label={`Delete feedback ${feedback._id}`}
          >
            {isDeleting ? (
              <>
                <span 
                  className="inline-block animate-pulse bg-red-400"
                  style={{
                    height: `${scaledValues.interactive.loadingIndicator}px`,
                    width: `${scaledValues.interactive.loadingIndicator}px`
                  }}
                />
                <span className="hidden sm:inline">DEL...</span>
              </>
            ) : (
              <>
                <span className="hidden sm:inline">DELETE</span>
                <span className="sm:hidden">DEL</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}