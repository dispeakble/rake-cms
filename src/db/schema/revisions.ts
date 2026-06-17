import { pgTable, serial, text, integer, timestamp, varchar } from "drizzle-orm/pg-core";
import { posts } from "./posts";

/**
 * wp_revisions — tracks post content changes over time.
 * Created automatically when a post is updated.
 */
export const revisions = pgTable("wp_revisions", {
  id: serial("rev_id").primaryKey(),
  postId: integer("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  postTitle: text("post_title").notNull().default(""),
  postContent: text("post_content").notNull().default(""),
  postExcerpt: text("post_excerpt").notNull().default(""),
  postStatus: varchar("post_status", { length: 20 }).notNull().default("inherit"),
  postAuthor: integer("post_author").notNull().default(0),
  postDate: timestamp("post_date", { mode: "string" }).notNull().defaultNow(),
  postDateGmt: timestamp("post_date_gmt", { mode: "string" }).notNull().defaultNow(),
});

export type Revision = typeof revisions.$inferSelect;
export type NewRevision = typeof revisions.$inferInsert;
