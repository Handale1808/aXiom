export type Sentiment = "positive" | "neutral" | "negative";
export type Priority = "P0" | "P1" | "P2" | "P3";

export interface FeedbackAnalysis {
  summary: string;
  sentiment: Sentiment;
  tags: string[];
  priority: Priority;
  nextAction: string;
}