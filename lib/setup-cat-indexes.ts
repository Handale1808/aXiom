import clientPromise from "./mongodb";

export async function setupCatIndexes() {
  try {
    const client = await clientPromise;
    const db = client.db("axiom");
    const collection = db.collection("cats");

    // 1. CreatedAt index for sorting/querying cats by creation date
    await collection.createIndex(
      { createdAt: -1 },
      { name: "cat_created_at_index" }
    );

    // 2. Name index for searching cats by name
    await collection.createIndex({ name: 1 }, { name: "cat_name_index" });

    // 3. Strength index for filtering cats by strength
    await collection.createIndex(
      { "stats.strength": 1 },
      { name: "stat_strength_index" }
    );

    // 4. Agility index for filtering cats by agility
    await collection.createIndex(
      { "stats.agility": 1 },
      { name: "stat_agility_index" }
    );

    // 5. Psychic index for filtering cats by psychic ability
    await collection.createIndex(
      { "stats.psychic": 1 },
      { name: "stat_psychic_index" }
    );

    // 6. Size index for filtering cats by size
    await collection.createIndex(
      { "physicalTraits.size": 1 },
      { name: "trait_size_index" }
    );

    // 7. SkinType index for filtering cats by skin type
    await collection.createIndex(
      { "physicalTraits.skinType": 1 },
      { name: "trait_skin_type_index" }
    );
  } catch (error) {
    console.error("Error creating cat indexes:", error);
    throw error;
  }
}
