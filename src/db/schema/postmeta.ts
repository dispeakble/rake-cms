import { pgTable, serial, text, integer, varchar } from "drizzle-orm/pg-core";
import { posts } from "./posts";

/**
 * wp_postmeta — key/value metadata for posts.
 * Values use text type for cross-dialect compatibility.
 * PHP serialized strings are decoded to JSON during migration.
 */
export const postmeta = pgTable("wp_postmeta", {
  id: serial("meta_id").primaryKey(),
  postId: integer("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  metaKey: varchar("meta_key", { length: 255 }),
  metaValue: text("meta_value"),
});

export type PostMeta = typeof postmeta.$inferSelect;
export type NewPostMeta = typeof postmeta.$inferInsert;
