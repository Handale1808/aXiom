import clientPromise from "../mongodb.ts";

export async function setupCartIndexes(dbName: string = "axiom"): Promise<{
  success: boolean;
  createdIndexes: string[];
  existingIndexes: string[];
  
  errors: Array<{ indexName: string; error: string }>;
}> {
  const result = {
    success: true,
    createdIndexes: [] as string[],
    existingIndexes: [] as string[],
    errors: [] as Array<{ indexName: string; error: string }>,
  };

  try {
    const client = await clientPromise;

    if (!client || typeof client.db !== "function") {
      return {
        success: false,
        createdIndexes: [],
        existingIndexes: [],
        errors: [
          { indexName: "connection", error: "Invalid MongoDB client" },
        ],
      };
    }

    const db = client.db(dbName);

    if (!db || typeof db.collection !== "function") {
      return {
        success: false,
        createdIndexes: [],
        existingIndexes: [],
        errors: [
          { indexName: "connection", error: "Invalid database instance" },
        ],
      };
    }

    const collection = db.collection("cart");

    if (!collection || typeof collection.createIndex !== "function") {
      return {
        success: false,
        createdIndexes: [],
        existingIndexes: [],
        errors: [
          { indexName: "connection", error: "Invalid collection instance" },
        ],
      };
    }

    const indexes = [
      {
        fields: { userId: 1 },
        options: { name: "cart_user_id_index" },
      },
      {
        fields: { catId: 1 },
        options: { name: "cart_cat_id_index" },
      },
      {
        fields: { userId: 1, catId: 1 },
        options: { name: "cart_user_cat_unique_index", unique: true },
      },
      {
        fields: { addedAt: -1 },
        options: { name: "cart_added_at_index" },
      },
    ] as const;

    await Promise.all(
      indexes.map(async (idx) => {
        try {
          await collection.createIndex(idx.fields, idx.options);
          result.createdIndexes.push(idx.options.name);
        } catch (error: any) {
          if (error.code === 85 || error.code === 86) {
            result.existingIndexes.push(idx.options.name);
          } else {
            result.success = false;
            result.errors.push({
              indexName: idx.options.name,
              error: error.message || String(error),
            });
          }
        }
      })
    );
  } catch (error: any) {
    result.success = false;
    result.errors.push({
      indexName: "connection",
      error: error.message || String(error),
    });
  }

  return result;
}