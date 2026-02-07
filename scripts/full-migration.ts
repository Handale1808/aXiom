import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function main() {
  const { default: clientPromise } = await import("../lib/mongodb.ts");

  const client = await clientPromise;
  const db = client.db("axiom");

  // Step 1: Drop all indexes on collections you're renaming
  console.log("Step 1: Dropping old indexes...");

  try {
    await db.collection("cats").dropIndexes();
    console.log("Dropped indexes on 'cats'");
  } catch (error: any) {
    console.log("Note:", error.message);
  }

  try {
    await db.collection("catAbilities").dropIndexes();
    console.log("Dropped indexes on 'catAbilities'");
  } catch (error: any) {
    console.log("Note:", error.message);
  }

  try {
    await db.collection("stock").dropIndexes();
    console.log("Dropped indexes on 'stock'");
  } catch (error: any) {
    console.log("Note:", error.message);
  }

  // Step 2: Rename collections
  console.log("\nStep 2: Renaming collections...");

  const renames = [
    { from: "cats", to: "catAliens" },
    // Add others as needed
  ];

  for (const { from, to } of renames) {
    try {
      const collections = await db.listCollections({ name: from }).toArray();

      if (collections.length > 0) {
        await db.renameCollection(from, to);
        console.log(`Renamed "${from}" to "${to}"`);
      } else {
        console.log(`Collection "${from}" does not exist`);
      }
    } catch (error) {
      console.error(`Error renaming "${from}":`, error);
    }
  }

  // Step 3: Recreate indexes
  console.log("\nStep 3: Recreating indexes...");

  const { setupCatAlienIndexes } =
    await import("../lib/indexes/setup-cat-alien-indexes.ts");
  const { setupStockIndexes } =
    await import("../lib/indexes/setup-stock-indexes.ts");
  // Import other setup functions as needed

  await setupCatAlienIndexes();
  await setupStockIndexes();
  // Call other setup functions

  console.log("\nMigration complete!");
  process.exit(0);
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
