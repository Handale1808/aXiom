import clientPromise from "./mongodb";

export async function setupAbilityRuleIndexes() {
  try {
    const client = await clientPromise;
    const db = client.db("axiom");
    const collection = db.collection("abilityRules");

    console.log("Creating indexes for abilityRules collection...");

    // 1. AbilityId index for querying all rules for a specific ability
    await collection.createIndex(
      { abilityId: 1 },
      { name: "ability_id_index" }
    );
    console.log("✓ AbilityId index created");

    // 2. Priority index for sorting rules during evaluation
    await collection.createIndex(
      { priority: -1 },
      { name: "priority_index" }
    );
    console.log("✓ Priority index created");

    // 3. ExclusiveGroup index for filtering by exclusive group
    await collection.createIndex(
      { exclusiveGroup: 1 },
      { name: "exclusive_group_index" }
    );
    console.log("✓ ExclusiveGroup index created");

    console.log("All abilityRules indexes created successfully!");
  } catch (error) {
    console.error("Error creating abilityRules indexes:", error);
    throw error;
  }
}