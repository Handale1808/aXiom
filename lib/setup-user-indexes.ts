import clientPromise from "./mongodb";

export async function setupUserIndexes() {
  try {
    const client = await clientPromise;
    const db = client.db("axiom");
    const collection = db.collection("users");

    console.log("Creating indexes for users collection...");

    // 1. Unique email index for preventing duplicates and fast login lookups
    await collection.createIndex(
      { email: 1 },
      { 
        name: "email_unique_index",
        unique: true 
      }
    );
    console.log("✓ Email unique index created");

    // 2. CreatedAt index for sorting/querying users by registration date
    await collection.createIndex(
      { createdAt: -1 },
      { name: "user_created_at_index" }
    );
    console.log("✓ CreatedAt index created");

    console.log("All user indexes created successfully!");
  } catch (error) {
    console.error("Error creating user indexes:", error);
    throw error;
  }
}