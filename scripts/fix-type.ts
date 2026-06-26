#!/usr/bin/env tsx
import { db } from "../src/db";
import { sites } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const slug = process.argv[2] || "karting-las-americas";
  const newType = process.argv[3] || "service";

  await db.update(sites)
    .set({ businessType: newType })
    .where(eq(sites.slug, slug));

  console.log(`✅ Updated ${slug} businessType → ${newType}`);
  process.exit(0);
}
main();

