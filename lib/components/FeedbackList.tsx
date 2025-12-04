// lib/components/FeedbackList.tsx

interface FeedbackItem {
  _id: string;
  text: string;
  analysis: {
    sentiment: string;
    priority: string;
  };
}

interface FeedbackListProps {
  feedbacks: FeedbackItem[];
  onFeedbackClick?: (feedbackId: string) => void;
}

export default function FeedbackList({
  feedbacks,
  onFeedbackClick,
}: FeedbackListProps) {
  if (feedbacks.length === 0) {
    return null;
  }

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
    if (p.includes("p1")) return { color: "#6CBE4D" };
    if (p.includes("p0")) return { color: "#BB489A" };
    return { color: "#BB489A" };
  };

  return (
    <div className="mt-8 font-mono">
      <div className="mb-4 border-b border-[#30D6D6]/30 pb-2">
        <p className="mt-1 text-xs text-[#006694]">
          Total Records: {feedbacks.length}
        </p>
      </div>
      <div className="border border-[#30D6D6]/20">
        <div className="grid grid-cols-[1fr_120px_120px_80px] gap-4 border-b-2 border-[#30D6D6]/50 bg-[#006694]/20 px-4 py-2 text-xs font-bold tracking-wider text-[#30D6D6]">
          <div>FEEDBACK_TEXT</div>
          <div>SENTIMENT</div>
          <div>PRIORITY</div>
          <div>ACTION</div>
        </div>
        {feedbacks.map((feedback, index) => (
          <div
            key={feedback._id}
            onClick={() => onFeedbackClick?.(feedback._id)}
            className={`group grid cursor-pointer grid-cols-[1fr_120px_120px_80px] gap-4 px-4 py-3 transition-all hover:bg-[#30D6D6]/10 ${
              index % 2 === 0 ? "bg-black/40" : "bg-[#006694]/10"
            }`}
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
            <div className="flex items-center text-xs text-[#006694] group-hover:text-[#30D6D6]">
              {">"} VIEW
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
