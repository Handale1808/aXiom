import { setupFeedbackIndexes } from "../lib/setup-indexes";
import { setupUserIndexes } from "../lib/setup-user-indexes";

async function main() {
  console.log("Setting up database indexes...\n");
  
  await setupFeedbackIndexes();
  console.log("");
  await setupUserIndexes();
  
  console.log("\nDatabase setup complete!");
  process.exit(0);
}

main().catch((error) => {
  console.error("Database setup failed:", error);
  process.exit(1);
});