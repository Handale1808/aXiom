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
      className={`group grid grid-cols-[40px_30px_1fr_120px_120px_60px_60px] gap-4 px-4 py-3
        index % 2 === 0 ? "bg-black/40" : "bg-[#006694]/10"
      } ${isDeleting ? "opacity-50" : ""}`}
    >
      <div className="flex items-center justify-center">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(feedback._id)}
          className="h-4 w-4 cursor-pointer appearance-none border border-[#30D6D6]/50 bg-black checked:bg-black checked:border-[#30D6D6] checked:before:content-['✓'] checked:before:text-[#30D6D6] checked:before:text-xs checked:before:flex checked:before:items-center checked:before:justify-center"
          aria-label={`Select feedback ${feedback._id}`}
        />
      </div>

      <div className="flex items-center justify-center">
        {feedback.catId && (
          <div
            className="flex items-center justify-center w-5 h-5 border border-[#30D6D6] bg-[#30D6D6]/10"
            title={
              feedback.catName
                ? `Feedback about ${feedback.catName}`
                : "Feedback about a cat"
            }
          >
            <span className="text-[#30D6D6] text-xs font-bold">C</span>
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
        <div className="text-sm text-cyan-100/90 truncate overflow-hidden text-ellipsis whitespace-nowrap">
          {feedback.text}
        </div>
        {feedback.analysis.tags && feedback.analysis.tags.length > 0 && (
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
        className="flex items-center text-xs text-[#006694] group-hover:text-[#30D6D6] cursor-pointer"
        onClick={() => onClick(feedback._id)}
      >
        {">"} VIEW
      </div>
      <div className="flex items-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(feedback._id);
          }}
          disabled={isDeleting}
          className="text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          aria-label={`Delete feedback ${feedback._id}`}
        >
          {isDeleting ? (
            <>
              <span className="inline-block h-2 w-2 animate-pulse bg-red-400" />
              DEL...
            </>
          ) : (
            "DELETE"
          )}
        </button>
      </div>
    </div>
  );
}
