import type { IFeedback, IAnalysis } from "@/models/Feedback";

// MongoDB returns _id as string in JSON responses
export interface FeedbackWithId extends Omit<IFeedback, "_id" | "userId" | "catId"> {
  _id: string;
  catId?: string;
  userId?: string;
  catName?: string;
  catSvgImage?: string;
}

// Generic success response wrapper
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

// Standardized error response (matches lib/errors.ts)
export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    details?: unknown;
  };
  requestId?: string;
}

// Pagination metadata
export interface PaginationMeta {
  total: number;
  limit: number;
  skip: number;
  hasMore: boolean;
}

// Feedback list response with pagination
export interface FeedbackListResponse {
  success: true;
  data: FeedbackWithId[];
  pagination: PaginationMeta;
}

// Request types
export interface FeedbackCreateRequest {
  text: string;
  email?: string;
}

export interface FeedbackUpdateRequest {
  nextAction: string;
}

export interface FeedbackDeleteRequest {
  id: string;
}

// Re-export discriminated union types from IAnalysis
export type Sentiment = IAnalysis["sentiment"];
export type Priority = IAnalysis["priority"];