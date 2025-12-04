import { error as logError } from "./logger";

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public requestId?: string
  ) {
    super(message);
    this.name = "ApiError";
  }

  toLogData() {
    return {
      errorType: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      requestId: this.requestId,
      stack: process.env.NODE_ENV === "development" ? this.stack : undefined,
    };
  }
}

export class ValidationError extends ApiError {
  constructor(
    message: string,
    public fields?: Record<string, string>,
    requestId?: string
  ) {
    super(400, message, "VALIDATION_ERROR", requestId);
    this.name = "ValidationError";
  }
}

export class DatabaseError extends ApiError {
  constructor(
    message: string = "Database operation failed",
    requestId?: string
  ) {
    super(500, message, "DATABASE_ERROR", requestId);
    this.name = "DatabaseError";
  }
}

export interface ErrorResponse {
  error: {
    message: string;
    code?: string;
    statusCode: number;
    fields?: Record<string, string>;
    requestId?: string;
  };
}

export function formatErrorResponse(
  error: Error | ApiError,
  requestId?: string
): ErrorResponse {
  if (error instanceof ApiError) {
    logError("API error occurred", error.toLogData());

    return {
      error: {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        ...(error instanceof ValidationError && error.fields
          ? { fields: error.fields }
          : {}),
        ...(requestId ? { requestId } : {}),
      },
    };
  }

  logError("Unexpected error occurred", {
    errorType: error.name,
    message: error.message,
    requestId,
    stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
  });

  return {
    error: {
      message: "Internal server error",
      code: "INTERNAL_ERROR",
      statusCode: 500,
      ...(requestId ? { requestId } : {}),
    },
  };
}
