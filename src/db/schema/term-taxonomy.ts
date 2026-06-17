import { pgTable, serial, integer, varchar, text } from "drizzle-orm/pg-core";
import { terms } from "./terms";

/**
 * wp_term_taxonomy — taxonomy assignments for terms.
 * Maps terms to taxonomies like 'category', 'post_tag', 'nav_menu', etc.
 */
export const termTaxonomy = pgTable("wp_term_taxonomy", {
  id: serial("term_taxonomy_id").primaryKey(),
  termId: integer("term_id")
    .notNull()
    .references(() => terms.id, { onDelete: "cascade" }),
  taxonomy: varchar("taxonomy", { length: 32 }).notNull().default(""),
  description: text("description").notNull().default(""),
  parent: integer("parent").notNull().default(0),
  count: integer("count").notNull().default(0),
});

export type TermTaxonomy = typeof termTaxonomy.$inferSelect;
export type NewTermTaxonomy = typeof termTaxonomy.$inferInsert;
