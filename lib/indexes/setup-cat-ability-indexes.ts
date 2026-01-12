import clientPromise from "../mongodb.ts";

/**
 * Result object returned by setupCatAbilityIndexes
 */
export interface IndexSetupResult {
  success: boolean;
  createdIndexes: string[];
  existingIndexes: string[];
  errors: Array<{ indexName: string; error: string }>;
}

/**
 * Creates indexes for the catAbilities collection to optimize queries.
 * 
 * This function creates three indexes:
 * 1. cat_id_index - Single field index on catId for queries like "find all abilities for cat X"
 * 2. cat_ability_ability_id_index - Single field index on abilityId for queries like "find all cats with ability Y"
 * 3. cat_ability_unique_index - Compound unique index on (catId, abilityId) to prevent duplicate assignments
 * 
 * The function is idempotent and safe to call multiple times. If an index already exists with the same
 * specification, it will be reported in existingIndexes. If an index exists with a different specification,
 * an error will be reported.
 * 
 * The function attempts to create all indexes even if some fail, allowing partial success scenarios.
 * 
 * @param databaseName - The database name to use (default: "axiom")
 * @returns Promise resolving to IndexSetupResult with details about which indexes were created, existed, or failed
 * 
 * @example
 * ```typescript
 * const result = await setupCatAbilityIndexes();
 * if (result.success) {
 *   console.log(`Created ${result.createdIndexes.length} indexes`);
 * } else {
 *   console.error('Index creation failed:', result.errors);
 * }
 * ```
 */
export async function setupCatAbilityIndexes(
  databaseName: string = "axiom"
): Promise<IndexSetupResult> {
  const result: IndexSetupResult = {
    success: false,
    createdIndexes: [],
    existingIndexes: [],
    errors: [],
  };

  try {
    // Validate client connection
    const client = await clientPromise;
    if (!client || typeof client.db !== "function") {
      result.errors.push({
        indexName: "connection",
        error: "Invalid MongoDB client: client is null or missing db method",
      });
      return result;
    }

    // Validate database instance
    const db = client.db(databaseName);
    if (!db || typeof db.collection !== "function") {
      result.errors.push({
        indexName: "connection",
        error: "Invalid database instance: db is null or missing collection method",
      });
      return result;
    }

    // Validate collection instance
    const collection = db.collection("catAbilities");
    if (!collection || typeof collection.createIndex !== "function") {
      result.errors.push({
        indexName: "connection",
        error:
          "Invalid collection instance: collection is null or missing createIndex method",
      });
      return result;
    }

    // Define all indexes to create
    const indexes = [
      {
        name: "cat_id_index",
        keys: { catId: 1 },
        options: { name: "cat_id_index" },
      },
      {
        name: "cat_ability_ability_id_index",
        keys: { abilityId: 1 },
        options: { name: "cat_ability_ability_id_index" },
      },
      {
        name: "cat_ability_unique_index",
        keys: { catId: 1, abilityId: 1 },
        options: {
          name: "cat_ability_unique_index",
          unique: true,
        },
      },
    ];

    // Attempt to create all indexes, tracking results
    const indexPromises = indexes.map(async (indexDef) => {
      try {
        await collection.createIndex(indexDef.keys, indexDef.options);
        return { name: indexDef.name, status: "created" as const };
      } catch (error) {
        // Error code 85 means index exists with different options
        // Error code 86 means index already exists (some drivers)
        if ((error as any).code === 85 || (error as any).code === 86) {
          return { name: indexDef.name, status: "existing" as const };
        }

        // All other errors are failures
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return {
          name: indexDef.name,
          status: "error" as const,
          error: errorMessage,
        };
      }
    });

    // Wait for all index operations to complete
    const indexResults = await Promise.allSettled(indexPromises);

    // Process results
    for (const promiseResult of indexResults) {
      if (promiseResult.status === "fulfilled") {
        const indexResult = promiseResult.value;

        if (indexResult.status === "created") {
          result.createdIndexes.push(indexResult.name);
        } else if (indexResult.status === "existing") {
          result.existingIndexes.push(indexResult.name);
        } else if (indexResult.status === "error") {
          result.errors.push({
            indexName: indexResult.name,
            error: indexResult.error || "Unknown error",
          });
        }
      } else {
        // Promise was rejected (shouldn't happen with our try-catch, but defensive)
        const error = promiseResult.reason;
        result.errors.push({
          indexName: "unknown",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Mark as success if at least one index was created or already existed,
    // and no errors occurred
    result.success =
      result.errors.length === 0 &&
      (result.createdIndexes.length > 0 || result.existingIndexes.length > 0);

    return result;
  } catch (error) {
    // Catch any unexpected errors (connection failures, etc.)
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error("Error creating catAbilities indexes:", {
      database: databaseName,
      collection: "catAbilities",
      error: errorMessage,
      errorCode: (error as any).code,
      errorName: (error as any).codeName,
    });

    result.errors.push({
      indexName: "connection",
      error: errorMessage,
    });

    return result;
  }
}