import { setupFeedbackIndexes } from "../lib/setup-indexes";
import { setupUserIndexes } from "../lib/setup-user-indexes";
import { setupCatIndexes } from "../lib/setup-cat-indexes";
import { setupAbilityIndexes } from "../lib/setup-ability-indexes";
import { setupAbilityRuleIndexes } from "../lib/setup-ability-rule-indexes";
import { setupCatAbilityIndexes } from "../lib/setup-cat-ability-indexes";

async function main() {
  await setupFeedbackIndexes();
  await setupUserIndexes();
  await setupCatIndexes();
  await setupAbilityIndexes();
  await setupAbilityRuleIndexes();
  await setupCatAbilityIndexes();

  process.exit(0);
}

main().catch((error) => {
  console.error("Database setup failed:", error);
  process.exit(1);
});
