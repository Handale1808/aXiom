import clientPromise from "./mongodb";

export async function setupCatIndexes() {
  try {
    const client = await clientPromise;
    const db = client.db("axiom");
    const collection = db.collection("cats");

    console.log("Creating indexes for cats collection...");

    // 1. CreatedAt index for sorting/querying cats by creation date
    await collection.createIndex(
      { createdAt: -1 },
      { name: "cat_created_at_index" }
    );
    console.log("✓ CreatedAt index created");

    // 2. Name index for searching cats by name
    await collection.createIndex(
      { name: 1 },
      { name: "cat_name_index" }
    );
    console.log("✓ Name index created");

    // 3. Strength index for filtering cats by strength
    await collection.createIndex(
      { "stats.strength": 1 },
      { name: "stat_strength_index" }
    );
    console.log("✓ Strength index created");

    // 4. Agility index for filtering cats by agility
    await collection.createIndex(
      { "stats.agility": 1 },
      { name: "stat_agility_index" }
    );
    console.log("✓ Agility index created");

    // 5. Psychic index for filtering cats by psychic ability
    await collection.createIndex(
      { "stats.psychic": 1 },
      { name: "stat_psychic_index" }
    );
    console.log("✓ Psychic index created");

    // 6. Size index for filtering cats by size
    await collection.createIndex(
      { "physicalTraits.size": 1 },
      { name: "trait_size_index" }
    );
    console.log("✓ Size index created");

    // 7. SkinType index for filtering cats by skin type
    await collection.createIndex(
      { "physicalTraits.skinType": 1 },
      { name: "trait_skin_type_index" }
    );
    console.log("✓ SkinType index created");

    console.log("All cat indexes created successfully!");
  } catch (error) {
    console.error("Error creating cat indexes:", error);
    throw error;
  }
}