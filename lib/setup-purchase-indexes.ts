import clientPromise from "./mongodb.ts";

export async function setupPurchaseIndexes() {
  try {
    const client = await clientPromise;
    const db = client.db("axiom");
    const collection = db.collection("purchases");

    // 1. UserId index for querying user's purchase history
    await collection.createIndex(
      { userId: 1 },
      { name: "purchase_user_id_index" }
    );

    // 2. PurchasedAt index for chronological sorting
    await collection.createIndex(
      { purchasedAt: -1 },
      { name: "purchase_purchased_at_index" }
    );

    // 3. Compound index for efficient user history queries
    await collection.createIndex(
      { userId: 1, purchasedAt: -1 },
      { name: "purchase_user_date_index" }
    );
  } catch (error) {
    console.error("Error creating purchase indexes:", error);
    throw error;
  }
}