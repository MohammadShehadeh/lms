import { seedRbac } from "./rbac";

/**
 * Runs every seeder in order. Each must be idempotent — safe to run repeatedly.
 * Add new seeders to the list below; they run sequentially since later ones may
 * depend on rows created by earlier ones.
 *
 * Run with: `pnpm -F @nucleus/db seed`
 */
const seeders = [seedRbac];

async function main() {
  for (const seed of seeders) {
    console.info(`Seeding: ${seed.name}...`);
    await seed();
    console.info(`✓ Seeded: ${seed.name}`);
  }
}

main()
  .then(() => {
    console.info("Seeding completed successfully.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
