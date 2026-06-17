import { pgTable, integer, primaryKey } from "drizzle-orm/pg-core";
import { posts } from "./posts";
import { termTaxonomy } from "./term-taxonomy";

/**
 * wp_term_relationships — many-to-many between posts and term_taxonomy.
 */
export const termRelationships = pgTable(
  "wp_term_relationships",
  {
    objectId: integer("object_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    termTaxonomyId: integer("term_taxonomy_id")
      .notNull()
      .references(() => termTaxonomy.id, { onDelete: "cascade" }),
    termOrder: integer("term_order").notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.objectId, table.termTaxonomyId] })]
);

export type TermRelationship = typeof termRelationships.$inferSelect;
export type NewTermRelationship = typeof termRelationships.$inferInsert;
