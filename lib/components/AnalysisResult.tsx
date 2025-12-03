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
}

export default function AnalysisResult({ analysis }: AnalysisResultProps) {
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
        <div className="h-2 w-2 animate-pulse bg-[#30D6D6] shadow-[0_0_10px_rgba(48,214,214,0.8)]" />
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
            <p className={`mt-1 font-bold capitalize ${getSentimentColor(analysis.sentiment)}`}>
              {analysis.sentiment}
            </p>
          </div>

          <div className="border border-[#006694]/30 bg-black/30 p-3">
            <span className="text-xs font-bold tracking-wider text-[#006694]">
              PRIORITY_LEVEL:
            </span>
            <p className="mt-1 font-bold text-[#30D6D6]">
              {analysis.priority}
            </p>
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
          <div className="absolute right-2 top-2 h-2 w-2 bg-[#30D6D6] shadow-[0_0_8px_rgba(48,214,214,0.8)]" />
          <span className="text-xs font-bold tracking-wider text-[#006694]">
            RECOMMENDED_ACTION:
          </span>
          <p className="mt-2 text-cyan-100/90 leading-relaxed">
            {analysis.nextAction}
          </p>
        </div>
      </div>
    </div>
  );
}