// setup-ability-indexes.ts - CORRECTED VERSION
import clientPromise from "../mongodb.ts";

export interface IndexSetupResult {
  success: boolean;
  createdIndexes: string[];
  existingIndexes: string[];
  errors: Array<{ indexName: string; error: string }>;
}

/**
 * Safely converts any error value to a string, handling edge cases like:
 * - null/undefined message properties
 * - toString() that throws
 * - non-Error objects
 */
function safeErrorToString(error: any): string {
  try {
    // Try to get message property first
    if (error?.message !== undefined && error?.message !== null) {
      return String(error.message);
    }
    
    // For string errors
    if (typeof error === 'string') {
      return error;
    }
    
    // Try String() conversion
    return String(error);
  } catch {
    // If toString() throws, return a safe fallback
    return 'Unknown error (error serialization failed)';
  }
}

/**
 * Sets up MongoDB indexes for the abilities collection.
 * This function is idempotent and never throws - it always returns a result object.
 * 
 * @param dbName - The database name (defaults to "axiom")
 * @returns IndexSetupResult with success status and details
 */
export async function setupAbilityIndexes(
  dbName: string = "axiom"
): Promise<IndexSetupResult> {
  const result: IndexSetupResult = {
    success: true,
    createdIndexes: [],
    existingIndexes: [],
    errors: [],
  };

  try {
    // Get and validate client
    const client = await clientPromise;
    if (!client || typeof client.db !== 'function') {
      throw new Error('Invalid MongoDB client: client is null or missing db method');
    }
    
    // Get and validate database
    const db = client.db(dbName);
    if (!db || typeof db.collection !== 'function') {
      throw new Error('Invalid database instance: db is null or missing collection method');
    }
    
    // Get and validate collection
    const collection = db.collection("abilities");
    if (!collection || typeof collection.createIndex !== 'function') {
      throw new Error('Invalid collection instance: collection is null or missing createIndex method');
    }

    // Define indexes
    const indexes = [
      {
        key: { key: 1 },
        options: { name: "ability_key_unique_index", unique: true },
      },
      {
        key: { createdAt: -1 },
        options: { name: "ability_created_at_index" },
      },
    ] as const;

    // Create each index with idempotency
    for (const { key, options } of indexes) {
      try {
        await collection.createIndex(key, options);
        result.createdIndexes.push(options.name);
      } catch (error: any) {
        // Check if index already exists (MongoDB error codes 85 or 86)
        const isAlreadyExists = 
          error?.code === 85 || 
          error?.code === 86 || 
          error?.codeName === "IndexAlreadyExists";
        
        if (isAlreadyExists) {
          result.existingIndexes.push(options.name);
        } else {
          // Record the error using safe conversion
          result.success = false;
          const errorMessage = safeErrorToString(error);
          result.errors.push({
            indexName: options.name,
            error: errorMessage,
          });
        }
      }
    }

    return result;
    
  } catch (error: any) {
    // Connection-level or setup failure
    result.success = false;
    const errorMessage = safeErrorToString(error);
    result.errors.push({
      indexName: "connection",
      error: errorMessage,
    });
    return result;
  }
}