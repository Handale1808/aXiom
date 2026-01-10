import type { FeedbackWithId } from "@/lib/types/api";

interface FeedbackListItemProps {
  feedback: FeedbackWithId;
  isSelected: boolean;
  isDeleting: boolean;
  onSelect: (id: string) => void;
  onClick: (id: string) => void;
  onDelete: (id: string) => void;
  index: number;
}

export default function FeedbackListItem({
  feedback,
  isSelected,
  isDeleting,
  onSelect,
  onClick,
  onDelete,
  index,
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
      className={`group grid grid-cols-[44px_30px_1fr_50px_50px] md:grid-cols-[40px_30px_1fr_120px_120px_60px_60px] gap-2 md:gap-4 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 ${
        index % 2 === 0 ? "bg-black/40" : "bg-[#006694]/10"
      } ${isDeleting ? "opacity-50" : ""}`}
    >
      <div className="flex items-center justify-center">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(feedback._id)}
          className="h-5 w-5 md:h-4 md:w-4 cursor-pointer appearance-none border border-[#30D6D6]/50 bg-black checked:bg-black checked:border-[#30D6D6] checked:before:content-['✓'] checked:before:text-[#30D6D6] checked:before:text-xs checked:before:flex checked:before:items-center checked:before:justify-center"
          aria-label={`Select feedback ${feedback._id}`}
        />
      </div>

      <div className="flex items-center justify-center">
        {feedback.catId && (
          <div
            className="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 border border-[#30D6D6] bg-[#30D6D6]/10"
            title={
              feedback.catName
                ? `Feedback about ${feedback.catName}`
                : "Feedback about a cat"
            }
          >
            <span className="text-[#30D6D6] text-[10px] sm:text-xs font-bold">
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
        <div className="text-xs sm:text-sm text-cyan-100/90 truncate overflow-hidden text-ellipsis whitespace-nowrap">
          {feedback.text}
        </div>
        {feedback.analysis.tags && feedback.analysis.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {feedback.analysis.tags.slice(0, 2).map((tag, idx) => (
              <span
                key={idx}
                className="text-[9px] sm:text-[10px] px-1.5 py-0.5 sm:px-2 sm:py-0.5 border border-[#30D6D6]/50 bg-black text-[#30D6D6] rounded-md"
              >
                {tag}
              </span>
            ))}
            {feedback.analysis.tags.length > 2 && (
              <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 text-[#30D6D6]/70">
                +{feedback.analysis.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 text-[10px] sm:text-xs">
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
      <div className="flex items-center gap-1 text-[10px] sm:text-xs">
        {(() => {
          const { color } = getPriorityIndicator(feedback.analysis.priority);
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
        className="hidden md:flex items-center justify-center text-[10px] sm:text-xs text-[#006694] group-hover:text-[#30D6D6] cursor-pointer"
        onClick={() => onClick(feedback._id)}
      >
        <span className="hidden sm:inline">{">"} VIEW</span>
        <span className="sm:hidden">{">"}</span>
      </div>
      <div className="hidden md:flex items-center justify-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(feedback._id);
          }}
          disabled={isDeleting}
          className="text-[10px] sm:text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 min-h-[44px] md:min-h-0"
          aria-label={`Delete feedback ${feedback._id}`}
        >
          {isDeleting ? (
            <>
              <span className="inline-block h-2 w-2 animate-pulse bg-red-400" />
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
    </div>
  );
}
