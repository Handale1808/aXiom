import { debug, info, sanitizeFilter } from "./logger";

interface DatabaseOperationOptions {
  operation: string;
  collection: string;
  requestId?: string;
  filter?: any;
}

export async function withDatabaseLogging<T>(
  fn: () => Promise<T>,
  options: DatabaseOperationOptions
): Promise<T> {
  const { operation, collection, requestId, filter } = options;
  const startTime = Date.now();

  debug("Executing database operation", {
    requestId,
    operation,
    collection,
    filter: filter ? sanitizeFilter(filter) : undefined,
  });

  try {
    const result = await fn();
    const duration = Date.now() - startTime;

    let recordCount: number | undefined;
    if (Array.isArray(result)) {
      recordCount = result.length;
    } else if (result && typeof result === "object" && "insertedId" in result) {
      recordCount = 1;
    }

    info("Database operation completed", {
      requestId,
      operation,
      collection,
      duration,
      recordCount,
    });

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;

    throw error;
  }
}

export function logDatabaseError(
  error: Error,
  options: DatabaseOperationOptions
): void {
  const { operation, collection, requestId } = options;

  debug("Database operation failed", {
    requestId,
    operation,
    collection,
    error: error.message,
  });
}
