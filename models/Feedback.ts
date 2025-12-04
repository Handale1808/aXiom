import { ObjectId } from "mongodb";

export interface IAnalysis {
  summary: string;
  sentiment: "positive" | "neutral" | "negative";
  tags: string[];
  priority: "P0" | "P1" | "P2" | "P3";
  nextAction: string;
}

export interface IFeedback {
  _id?: ObjectId;
  text: string;
  email?: string;
  createdAt: Date;
  analysis: IAnalysis;
}
