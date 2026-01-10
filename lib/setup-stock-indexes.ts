import clientPromise from "./mongodb.ts";

export async function setupStockIndexes() {
  try {
    const client = await clientPromise;
    const db = client.db("axiom");
    const collection = db.collection("stock");

    // 1. CatId index for looking up stock entry by cat
    await collection.createIndex(
      { catId: 1 },
      { name: "stock_cat_id_index" }
    );

    // 2. RemovedAt index for filtering in-stock vs removed cats
    await collection.createIndex(
      { removedAt: 1 },
      { name: "stock_removed_at_index" }
    );

    // 3. Unique catId index to enforce one stock entry per cat
    await collection.createIndex(
      { catId: 1 },
      {
        name: "stock_cat_id_unique_index",
        unique: true,
      }
    );
  } catch (error) {
    console.error("Error creating stock indexes:", error);
    throw error;
  }
}