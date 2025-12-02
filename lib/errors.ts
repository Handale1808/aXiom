export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, public fields?: Record<string, string>) {
    super(400, message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class DatabaseError extends ApiError {
  constructor(message: string = 'Database operation failed') {
    super(500, message, 'DATABASE_ERROR');
    this.name = 'DatabaseError';
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
    return {
      error: {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        ...(error instanceof ValidationError && error.fields ? { fields: error.fields } : {}),
        ...(requestId ? { requestId } : {})
      }
    };
  }

  return {
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
      statusCode: 500,
      ...(requestId ? { requestId } : {})
    }
  };
}