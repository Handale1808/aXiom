import dotenv from 'dotenv';
import path from 'path';

// Load .env.local FIRST
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Use dynamic imports to ensure env is loaded first
async function main() {
  const { setupFeedbackIndexes } = await import("../lib/indexes/setup-indexes.ts");
  const { setupUserIndexes } = await import("../lib/indexes/setup-user-indexes.ts");
  const { setupCatIndexes } = await import("../lib/indexes/setup-cat-indexes.ts");
  const { setupAbilityIndexes } = await import("../lib/indexes/setup-ability-indexes.ts");
  const { setupAbilityRuleIndexes } = await import("../lib/indexes/setup-ability-rule-indexes.ts");
  const { setupCatAbilityIndexes } = await import("../lib/indexes/setup-cat-ability-indexes.ts");
  const { setupStockIndexes } = await import("../lib/indexes/setup-stock-indexes.ts");
  const { setupSettingsIndexes } = await import("../lib/indexes/setup-settings-indexes.ts");
  const { setupCartIndexes } = await import("../lib/indexes/setup-cart-indexes.ts");
  const { setupPurchaseIndexes } = await import("../lib/indexes/setup-purchase-indexes.ts");
  const { default: clientPromise } = await import("../lib/mongodb.ts");

  await setupFeedbackIndexes();
  await setupUserIndexes();
  await setupCatIndexes();
  await setupAbilityIndexes();
  await setupAbilityRuleIndexes();
  await setupCatAbilityIndexes();
  await setupStockIndexes();
  await setupSettingsIndexes();
  await setupCartIndexes();
  await setupPurchaseIndexes();

  // Seed settings collection with default cat price
  try {
    const client = await clientPromise;
    const db = client.db("axiom");

    const existingSetting = await db
      .collection("settings")
      .findOne({ key: "cat_price" });

    if (!existingSetting) {
      await db.collection("settings").insertOne({
        key: "cat_price",
        value: 500,
        updatedAt: new Date(),
        updatedBy: null,
      });
      console.log("Seeded default cat price setting (R500)");
    } else {
      console.log("Cat price setting already exists");
    }
  } catch (error) {
    console.error("Failed to seed settings:", error);
  }

  process.exit(0);
}

main().catch((error) => {
  console.error("Database setup failed:", error);
  process.exit(1);
});