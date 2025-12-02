import { setupFeedbackIndexes } from '@/lib/setup-indexes';

async function main() {
  console.log('Setting up database indexes...');
  await setupFeedbackIndexes();
  console.log('Done!');
  process.exit(0);
}

main().catch((error) => {
  console.error('Setup failed:', error);
  process.exit(1);
});