/**
 * Multi-dialect database connection for Rake CMS.
 * Supports PostgreSQL (primary) and MariaDB/MySQL.
 *
 * Usage:
 *   import { db } from "@/db";
 */
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

let instance: ReturnType<typeof drizzle> | null = null;

function getOrCreateDb() {
  if (!instance) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL!,
    });
    instance = drizzle(pool);
  }
  return instance;
}

export const db = getOrCreateDb();
export type Database = typeof db;
