import { setupFeedbackIndexes } from "../lib/setup-indexes.ts";
import { setupUserIndexes } from "../lib/setup-user-indexes.ts";
import { setupCatIndexes } from "../lib/setup-cat-indexes.ts";
import { setupAbilityIndexes } from "../lib/setup-ability-indexes.ts";
import { setupAbilityRuleIndexes } from "../lib/setup-ability-rule-indexes.ts";
import { setupCatAbilityIndexes } from "../lib/setup-cat-ability-indexes.ts";
import { setupStockIndexes } from "../lib/setup-stock-indexes.ts";
import { setupSettingsIndexes } from "../lib/setup-settings-indexes.ts";
import { setupCartIndexes } from "../lib/setup-cart-indexes.ts";
import { setupPurchaseIndexes } from "../lib/setup-purchase-indexes.ts";
import clientPromise from "../lib/mongodb.ts";

async function main() {
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
      console.log("✓ Seeded default cat price setting (R500)");
    } else {
      console.log("✓ Cat price setting already exists");
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