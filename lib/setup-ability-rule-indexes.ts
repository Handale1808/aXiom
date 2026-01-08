import clientPromise from "./mongodb";

export async function setupAbilityRuleIndexes() {
  try {
    const client = await clientPromise;
    const db = client.db("axiom");
    const collection = db.collection("abilityRules");

    // 1. AbilityId index for querying all rules for a specific ability
    await collection.createIndex(
      { abilityId: 1 },
      { name: "ability_id_index" }
    );

    // 2. Priority index for sorting rules during evaluation
    await collection.createIndex({ priority: -1 }, { name: "priority_index" });

    // 3. ExclusiveGroup index for filtering by exclusive group
    await collection.createIndex(
      { exclusiveGroup: 1 },
      { name: "exclusive_group_index" }
    );
  } catch (error) {
    console.error("Error creating abilityRules indexes:", error);
    throw error;
  }
}
