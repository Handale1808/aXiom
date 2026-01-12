import clientPromise from "../mongodb.ts";

export interface SetupIndexesResult {
  success: boolean;
  createdIndexes: string[];
  existingIndexes: string[];
  errors: Array<{
    indexName: string;
    error: string;
  }>;
}

export async function setupPurchaseIndexes(
  dbName: string = "axiom"
): Promise<SetupIndexesResult> {
  const createdIndexes: string[] = [];
  const existingIndexes: string[] = [];
  const errors: Array<{ indexName: string; error: string }> = [];

  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    const collection = db.collection("purchases");

    // Define all indexes upfront for clarity and maintainability
    const indexes = [
      {
        name: "purchase_user_id_index",
        spec: { userId: 1 },
        options: { name: "purchase_user_id_index" },
      },
      {
        name: "purchase_purchased_at_index",
        spec: { purchasedAt: -1 },
        options: { name: "purchase_purchased_at_index" },
      },
      {
        name: "purchase_user_date_index",
        spec: { userId: 1, purchasedAt: -1 },
        options: { name: "purchase_user_date_index" },
      },
    ];

    // Create all indexes in parallel for better performance
    const indexResults = await Promise.allSettled(
      indexes.map((index) =>
        collection
          .createIndex(index.spec, index.options)
          .then(() => ({ name: index.name, status: "created" as const }))
          .catch((error) => {
            // MongoDB error code 85 = IndexOptionsConflict (index already exists)
            // MongoDB error code 86 = IndexKeySpecsConflict (index already exists with different options)
            if (error && typeof error === "object" && "code" in error) {
              if (error.code === 85 || error.code === 86) {
                return { name: index.name, status: "existing" as const };
              }
            }
            throw error;
          })
      )
    );

    // Process results
    indexResults.forEach((result, idx) => {
      const indexName = indexes[idx].name;

      if (result.status === "fulfilled") {
        if (result.value.status === "created") {
          createdIndexes.push(indexName);
        } else {
          existingIndexes.push(indexName);
        }
      } else {
        const error = result.reason;
        let errorMessage: string;

        if (error instanceof Error) {
          // Use Error.name for empty messages
          errorMessage = error.message || error.name;
        } else if (typeof error === "string") {
          errorMessage = error;
        } else if (error === null) {
          errorMessage = "null";
        } else if (error === undefined) {
          errorMessage = "undefined";
        } else {
          // For objects, numbers, etc., convert to string
          errorMessage = String(error);
        }

        errors.push({
          indexName,
          error: errorMessage,
        });
      }
    });

    return {
      success: errors.length === 0,
      createdIndexes,
      existingIndexes,
      errors,
    };
  } catch (error) {
    // Connection-level error (failed to get client or db)
    return {
      success: false,
      createdIndexes,
      existingIndexes,
      errors: [
        {
          indexName: "connection",
          error: error instanceof Error ? error.message : String(error),
        },
      ],
    };
  }
}