import clientPromise from "./mongodb";

export async function setupCatAbilityIndexes() {
  try {
    const client = await clientPromise;
    const db = client.db("axiom");
    const collection = db.collection("catAbilities");

    console.log("Creating indexes for catAbilities collection...");

    // 1. CatId index for querying all abilities for a specific cat
    await collection.createIndex(
      { catId: 1 },
      { name: "cat_id_index" }
    );
    console.log("✓ CatId index created");

    // 2. AbilityId index for querying all cats with a specific ability
    await collection.createIndex(
      { abilityId: 1 },
      { name: "cat_ability_ability_id_index" }
    );
    console.log("✓ AbilityId index created");

    // 3. Compound unique index to prevent duplicate abilities on same cat
    await collection.createIndex(
      { catId: 1, abilityId: 1 },
      { 
        name: "cat_ability_unique_index",
        unique: true 
      }
    );
    console.log("✓ Compound unique index created");

    console.log("All catAbilities indexes created successfully!");
  } catch (error) {
    console.error("Error creating catAbilities indexes:", error);
    throw error;
  }
}