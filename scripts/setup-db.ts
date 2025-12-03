import { setupFeedbackIndexes } from "@/lib/setup-indexes";

async function main() {
  await setupFeedbackIndexes();
  process.exit(0);
}

main().catch((error) => {
  console.error("Setup failed:", error);
  process.exit(1);
});
