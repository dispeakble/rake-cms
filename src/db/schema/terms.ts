import { pgTable, serial, varchar } from "drizzle-orm/pg-core";

/**
 * wp_terms — individual terms (categories, tags, custom taxonomies).
 */
export const terms = pgTable("wp_terms", {
  id: serial("term_id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull().default(""),
  slug: varchar("slug", { length: 200 }).notNull().default(""),
  termGroup: varchar("term_group", { length: 10 }).notNull().default("0"),
});

export type Term = typeof terms.$inferSelect;
export type NewTerm = typeof terms.$inferInsert;
