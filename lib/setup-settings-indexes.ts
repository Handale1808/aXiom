import clientPromise from "./mongodb.ts";

export async function setupSettingsIndexes() {
  try {
    const client = await clientPromise;
    const db = client.db("axiom");
    const collection = db.collection("settings");

    // 1. Unique key index for preventing duplicates and fast lookups
    await collection.createIndex(
      { key: 1 },
      {
        name: "settings_key_unique_index",
        unique: true,
      }
    );

    // 2. UpdatedAt index for audit trail queries
    await collection.createIndex(
      { updatedAt: -1 },
      { name: "settings_updated_at_index" }
    );
  } catch (error) {
    console.error("Error creating settings indexes:", error);
    throw error;
  }
}