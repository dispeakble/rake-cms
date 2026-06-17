/**
 * Multi-dialect database connection for Rake CMS.
 * Supports PostgreSQL (primary) and MariaDB/MySQL.
 *
 * Usage:
 *   import { db } from "@/db";
 *   const posts = await db.query.posts.findMany();
 */
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

let instance: ReturnType<typeof drizzle<typeof schema>> | null = null;

function getOrCreateDb() {
  if (!instance) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL!,
    });
    instance = drizzle(pool, { schema });
  }
  return instance;
}

export const db = getOrCreateDb();
export type Database = typeof db;
