import clientPromise from "../mongodb.ts";

export async function setupAbilityIndexes() {
  try {
    const client = await clientPromise;
    const db = client.db("axiom");
    const collection = db.collection("abilities");

    // 1. Unique key index for preventing duplicates and fast lookups
    await collection.createIndex(
      { key: 1 },
      {
        name: "ability_key_unique_index",
        unique: true,
      }
    );

    // 2. CreatedAt index for sorting/querying abilities by creation date
    await collection.createIndex(
      { createdAt: -1 },
      { name: "ability_created_at_index" }
    );
  } catch (error) {
    console.error("Error creating ability indexes:", error);
    throw error;
  }
}
 