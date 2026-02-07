// In setup-stock-indexes.ts

import clientPromise from "../mongodb.ts";

export async function setupStockIndexes() {
  try {
    const client = await clientPromise;
    const db = client.db("axiom");
    const collection = db.collection("stock");

    // Drop the old index if it exists
    try {
      await collection.dropIndex("stock_cat_id_index");
    } catch (dropError: any) {
      if (dropError.code !== 27) {
        console.log("Note:", dropError.message);
      }
    }

    // 1. Unique catAlienId index (serves both lookup and uniqueness purposes)
    await collection.createIndex(
      { catAlienId: 1 },
      {
        name: "stock_cat_alien_id_unique_index",
        unique: true,
      }
    );

    // 2. RemovedAt index for filtering in-stock vs removed cats
    await collection.createIndex(
      { removedAt: 1 },
      { name: "stock_removed_at_index" }
    );
  } catch (error) {
    console.error("Error creating stock indexes:", error);
    throw error;
  }
}