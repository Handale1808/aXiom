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
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
        Analysis Results
      </h2>
      <div className="space-y-3">
        <div>
          <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Summary:
          </span>
          <p className="mt-1 text-zinc-900 dark:text-white">
            {analysis.summary}
          </p>
        </div>
        <div>
          <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Sentiment:
          </span>
          <p className="mt-1 capitalize text-zinc-900 dark:text-white">
            {analysis.sentiment}
          </p>
        </div>
        <div>
          <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Priority:
          </span>
          <p className="mt-1 text-zinc-900 dark:text-white">
            {analysis.priority}
          </p>
        </div>
        <div>
          <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Tags:
          </span>
          <div className="mt-1 flex flex-wrap gap-2">
            {analysis.tags.map((tag: string, i: number) => (
              <span
                key={i}
                className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div>
          <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Next Action:
          </span>
          <p className="mt-1 text-zinc-900 dark:text-white">
            {analysis.nextAction}
          </p>
        </div>
      </div>
    </div>
  );
}