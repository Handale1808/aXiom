import clientPromise from "./mongodb.ts";

export async function setupUserIndexes() {
  try {
    const client = await clientPromise;
    const db = client.db("axiom");
    const collection = db.collection("users");

    // 1. Unique email index for preventing duplicates and fast login lookups
    await collection.createIndex(
      { email: 1 },
      {
        name: "email_unique_index",
        unique: true,
      }
    );

    // 2. CreatedAt index for sorting/querying users by registration date
    await collection.createIndex(
      { createdAt: -1 },
      { name: "user_created_at_index" }
    );
  } catch (error) {
    console.error("Error creating user indexes:", error);
    throw error;
  }
}
