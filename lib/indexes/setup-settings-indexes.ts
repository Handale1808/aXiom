import clientPromise from "../mongodb";

export interface SetupIndexesResult {
  success: boolean;
  createdIndexes: string[];
  existingIndexes: string[];
  errors: Array<{ indexName: string; error: string }>;
}

export async function setupSettingsIndexes(
  dbName: string = "axiom"
): Promise<SetupIndexesResult> {
  const result: SetupIndexesResult = {
    success: false,
    createdIndexes: [],
    existingIndexes: [],
    errors: [],
  };

  let client;
  let db;
  let collection;

  try {
    client = await clientPromise;

    if (!client || typeof client.db !== "function") {
      result.errors.push({
        indexName: "connection",
        error: "Invalid MongoDB client",
      });
      return result;
    }

    db = client.db(dbName);

    if (!db || typeof db.collection !== "function") {
      result.errors.push({
        indexName: "connection",
        error: "Invalid database instance",
      });
      return result;
    }

    collection = db.collection("settings");

    if (!collection || typeof collection.createIndex !== "function") {
      result.errors.push({
        indexName: "connection",
        error: "Invalid collection instance",
      });
      return result;
    }
  } catch (error) {
    result.errors.push({
      indexName: "connection",
      error: error instanceof Error ? error.message : String(error),
    });
    return result;
  }

  const indexes = [
    {
      name: "settings_key_unique_index",
      spec: { key: 1 },
      options: { name: "settings_key_unique_index", unique: true },
    },
    {
      name: "settings_updated_at_index",
      spec: { updatedAt: -1 },
      options: { name: "settings_updated_at_index" },
    },
  ];

  for (const index of indexes) {
    try {
      await collection.createIndex(index.spec, index.options);
      result.createdIndexes.push(index.name);
    } catch (error: any) {
      if (error.code === 85 || error.codeName === "IndexOptionsConflict") {
        result.existingIndexes.push(index.name);
      } else if (
        error.code === 86 ||
        error.codeName === "IndexKeySpecsConflict"
      ) {
        result.existingIndexes.push(index.name);
      } else if (error.code === 11000 || error.message?.includes("E11000")) {
        result.existingIndexes.push(index.name);
      } else {
        result.errors.push({
          indexName: index.name,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  result.success = result.errors.length === 0;

  return result;
}