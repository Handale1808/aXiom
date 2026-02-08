import clientPromise from "../mongodb.ts";

export interface IndexResult {
  success: boolean;
  createdIndexes: string[];
  existingIndexes: string[];
  errors: Array<{ indexName: string; error: string }>;
}

interface IndexDefinition {
  name: string;
  spec: Record<string, any>;
  options: Record<string, any>;
}

export async function setupFeedbackIndexes(
  dbName: string = "axiom"
): Promise<IndexResult> {
  const result: IndexResult = {
    success: false,
    createdIndexes: [],
    existingIndexes: [],
    errors: [],
  };

  try {
    const client = await clientPromise;

    if (!client) {
      result.errors.push({
        indexName: "connection",
        error: "MongoDB client is null",
      });
      return result;
    }

    const db = client.db(dbName);

    if (!db) {
      result.errors.push({
        indexName: "database",
        error: "Failed to get database instance",
      });
      return result;
    }

    const collection = db.collection("feedbacks");

    if (!collection) {
      result.errors.push({
        indexName: "collection",
        error: "Failed to get collection instance",
      });
      return result;
    }

    const indexes: IndexDefinition[] = [
      {
        name: "feedback_text_search",
        spec: {
          text: "text",
          "analysis.summary": "text",
        },
        options: {
          name: "feedback_text_search",
          weights: {
            text: 2,
            "analysis.summary": 1,
          },
        },
      },
      {
        name: "sentiment_index",
        spec: { "analysis.sentiment": 1 },
        options: { name: "sentiment_index" },
      },
      {
        name: "priority_index",
        spec: { "analysis.priority": 1 },
        options: { name: "priority_index" },
      },
      {
        name: "tags_index",
        spec: { "analysis.tags": 1 },
        options: { name: "tags_index" },
      },
      {
        name: "created_at_index",
        spec: { createdAt: -1 },
        options: { name: "created_at_index" },
      },
      {
        name: "cat_id_index",
        spec: { catAlienId: 1 },
        options: { name: "cat_id_index" },
      },
      {
        name: "user_id_index",
        spec: { userId: 1 },
        options: { name: "user_id_index" },
      },
      {
        name: "user_cat_index",
        spec: { userId: 1, catAlienId: 1 },
        options: { name: "user_cat_index" },
      },
      {
        name: "cat_created_at_index",
        spec: { catAlienId: 1, createdAt: -1 },
        options: { name: "cat_created_at_index" },
      },
    ];

    const indexPromises = indexes.map(async (index) => {
      try {
        await collection.createIndex(index.spec, index.options);
        return { name: index.name, status: "created" as const };
      } catch (error: any) {
        if (error?.code === 85 || error?.codeName === "IndexOptionsConflict") {
          return { name: index.name, status: "existing" as const };
        }

        const errorMessage =
          error instanceof Error
            ? error.message
            : typeof error === "string"
            ? error
            : "Unknown error";

        return {
          name: index.name,
          status: "error" as const,
          error: errorMessage,
        };
      }
    });

    const indexResults = await Promise.all(indexPromises);

    for (const indexResult of indexResults) {
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
    }

    result.success = result.errors.length === 0;
  } catch (error: any) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : "Unknown connection error";

    result.errors.push({
      indexName: "connection",
      error: errorMessage,
    });
  }

  return result;
}