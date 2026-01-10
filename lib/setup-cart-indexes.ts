import clientPromise from "./mongodb.ts";

export async function setupCartIndexes() {
  try {
    const client = await clientPromise;
    const db = client.db("axiom");
    const collection = db.collection("cart");

    // 1. UserId index for querying all cart items for a specific user
    await collection.createIndex({ userId: 1 }, { name: "cart_user_id_index" });

    // 2. CatId index for stock validation queries
    await collection.createIndex({ catId: 1 }, { name: "cart_cat_id_index" });

    // 3. Compound unique index to prevent duplicate cart entries
    await collection.createIndex(
      { userId: 1, catId: 1 },
      {
        name: "cart_user_cat_unique_index",
        unique: true,
      }
    );

    // 4. AddedAt index for sorting cart items
    await collection.createIndex(
      { addedAt: -1 },
      { name: "cart_added_at_index" }
    );
  } catch (error) {
    console.error("Error creating cart indexes:", error);
    throw error;
  }
}