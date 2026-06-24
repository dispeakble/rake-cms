import { db } from "@/db";
import { sites } from "@/db/schema/sites";
import { eq } from "drizzle-orm";

async function main() {
  const rows = await db.select().from(sites);
  rows.forEach((r) => console.log(`ID:${r.id} slug:${r.slug} type:${r.businessType} name:${r.name}`));
}

main().catch((e) => console.error("ERR:", e.message));
