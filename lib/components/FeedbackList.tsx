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
}

export default function FeedbackList({ feedbacks }: FeedbackListProps) {
  if (feedbacks.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-xl font-bold text-zinc-900 dark:text-white">
        All Feedback
      </h2>
      <div className="space-y-4">
        {feedbacks.map((feedback) => (
          <div
            key={feedback._id}
            className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="text-zinc-900 dark:text-white">{feedback.text}</p>
            <div className="mt-2 flex gap-2 text-xs text-zinc-500">
              <span className="capitalize">{feedback.analysis.sentiment}</span>
              <span>{feedback.analysis.priority}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}