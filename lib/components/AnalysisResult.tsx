// lib/components/AnalysisResult.tsx

interface AnalysisData {
  summary: string;
  sentiment: string;
  priority: string;
  tags: string[];
  nextAction: string;
}

interface AnalysisResultProps {
  analysis: AnalysisData;
  isEditingNextAction?: boolean;
  editedNextAction?: string;
  onEditStart?: () => void;
  onEditCancel?: () => void;
  onEditSave?: (newValue: string) => void;
  onNextActionChange?: (value: string) => void;
  isUpdating?: boolean;
  nextActionError?: string | null;
}

export default function AnalysisResult({
  analysis,
  isEditingNextAction = false,
  editedNextAction = "",
  onEditStart,
  onEditCancel,
  onEditSave,
  onNextActionChange,
  isUpdating = false,
  nextActionError = null,
}: AnalysisResultProps) {
  const getSentimentColor = (sentiment: string) => {
    const s = sentiment.toLowerCase();
    if (s.includes("positive")) return "text-[#30D6D6]";
    if (s.includes("negative")) return "text-red-400";
    return "text-[#006694]";
  };

  return (
    <div className="relative border-2 border-[#30D6D6]/50 bg-[#30D6D6]/10 p-6 font-mono">
      <div className="absolute -left-px -top-px h-6 w-6 border-l-2 border-t-2 border-[#30D6D6]" />
      <div className="absolute -right-px -top-px h-6 w-6 border-r-2 border-t-2 border-[#30D6D6]" />
      <div className="absolute -bottom-px -left-px h-6 w-6 border-b-2 border-l-2 border-[#30D6D6]" />
      <div className="absolute -bottom-px -right-px h-6 w-6 border-b-2 border-r-2 border-[#30D6D6]" />

      <div className="mb-4 flex items-center justify-between border-b-2 border-[#30D6D6]/30 pb-3">
        <h2 className="text-sm font-bold tracking-widest text-[#30D6D6]">
          [ANALYSIS_COMPLETE]
        </h2>
      </div>

      <div className="space-y-4">
        <div className="border-l-2 border-[#006694] pl-4">
          <span className="text-xs font-bold tracking-wider text-[#006694]">
            SUMMARY:
          </span>
          <p className="mt-1 text-cyan-100/90 leading-relaxed">
            {analysis.summary}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="border border-[#006694]/30 bg-black/30 p-3">
            <span className="text-xs font-bold tracking-wider text-[#006694]">
              SENTIMENT_ANALYSIS:
            </span>
            <p
              className={`mt-1 font-bold capitalize ${getSentimentColor(
                analysis.sentiment
              )}`}
            >
              {analysis.sentiment}
            </p>
          </div>

          <div className="border border-[#006694]/30 bg-black/30 p-3">
            <span className="text-xs font-bold tracking-wider text-[#006694]">
              PRIORITY_LEVEL:
            </span>
            <div className="mt-1 flex items-center gap-2">
              {(() => {
                const p = analysis.priority.toLowerCase();
                let color = "#BB489A";
                if (p.includes("p3")) color = "#30D6D6";
                if (p.includes("p2")) color = "#6CBE4D";
                if (p.includes("p1")) color = "#a44aff";
                if (p.includes("p0")) color = "#BB489A";

                return (
                  <>
                    <span className="font-bold" style={{ color }}>
                      {analysis.priority}
                    </span>
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        <div>
          <span className="text-xs font-bold tracking-wider text-[#006694]">
            TAGS_DETECTED:
          </span>
          <div className="mt-2 flex flex-wrap gap-2">
            {analysis.tags.map((tag: string, i: number) => (
              <span
                key={i}
                className="border border-[#30D6D6] bg-black px-3 py-1 text-xs tracking-wide text-[#30D6D6]"
              >
                {">"} {tag.toUpperCase()}
              </span>
            ))}
          </div>
        </div>

        <div className="relative border-2 border-[#30D6D6]/30 bg-black/50 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold tracking-wider text-[#006694]">
              RECOMMENDED_ACTION:
            </span>
            {!isEditingNextAction && onEditStart && (
              <button
                data-testid="edit-button"
                onClick={onEditStart}
                className="border border-yellow-500/50 bg-black px-3 py-1 text-xs font-bold tracking-wider text-yellow-500 transition-all hover:bg-yellow-500/10 hover:border-yellow-500"
              >
                EDIT
              </button>
            )}
          </div>

          {!isEditingNextAction ? (
            <p className="mt-2 text-cyan-100/90 leading-relaxed">
              {analysis.nextAction}
            </p>
          ) : (
            <div className="mt-2 space-y-3">
              <div>
                <textarea
                  data-testid="next-action-input"
                  value={editedNextAction}
                  onChange={(e) => onNextActionChange?.(e.target.value)}
                  disabled={isUpdating}
                  className="w-full min-h-[100px] bg-black border border-[#30D6D6]/50 p-3 text-cyan-100/90 font-mono text-sm leading-relaxed resize-y focus:outline-none focus:border-[#30D6D6] disabled:opacity-50"
                  placeholder="Enter recommended action..."
                />
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-[#006694]">
                    {editedNextAction.length}/500
                  </span>
                  {nextActionError && (
                    <span className="text-xs text-red-400">
                      {nextActionError}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  data-testid="cancel-edit-button"
                  onClick={onEditCancel}
                  disabled={isUpdating}
                  className="border border-[#006694] bg-black px-4 py-2 text-xs font-bold tracking-wider text-[#006694] transition-all hover:bg-[#006694]/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  CANCEL
                </button>
                <button
                  onClick={() => onEditSave?.(editedNextAction)}
                  disabled={
                    isUpdating ||
                    editedNextAction.trim().length < 10 ||
                    editedNextAction.trim().length > 500
                  }
                  className="border border-[#6CBE4D] bg-black px-4 py-2 text-xs font-bold tracking-wider text-[#6CBE4D] transition-all hover:bg-[#6CBE4D] hover:text-black disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isUpdating && (
                    <div className="h-2 w-2 animate-pulse bg-[#6CBE4D]" />
                  )}
                  {isUpdating ? "SAVING..." : "SAVE"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
