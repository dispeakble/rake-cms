import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  boolean,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * wp_posts — core content table.
 * Replicates WordPress posts with cross-dialect compatible types.
 * LONGTEXT → text, DATETIME → timestamp
 */
export const posts = pgTable("wp_posts", {
  id: serial("ID").primaryKey(),
  postAuthor: integer("post_author").notNull().default(0),
  postDate: timestamp("post_date", { mode: "string" })
    .notNull()
    .defaultNow(),
  postDateGmt: timestamp("post_date_gmt", { mode: "string" })
    .notNull()
    .defaultNow(),
  postContent: text("post_content").notNull().default(""),
  postTitle: text("post_title").notNull().default(""),
  postExcerpt: text("post_excerpt").notNull().default(""),
  postStatus: varchar("post_status", { length: 20 }).notNull().default("draft"),
  commentStatus: varchar("comment_status", { length: 20 })
    .notNull()
    .default("open"),
  pingStatus: varchar("ping_status", { length: 20 }).notNull().default("open"),
  postPassword: varchar("post_password", { length: 255 })
    .notNull()
    .default(""),
  postName: varchar("post_name", { length: 200 }).notNull().default(""),
  toPing: text("to_ping").notNull().default(""),
  pinged: text("pinged").notNull().default(""),
  postModified: timestamp("post_modified", { mode: "string" })
    .notNull()
    .defaultNow(),
  postModifiedGmt: timestamp("post_modified_gmt", { mode: "string" })
    .notNull()
    .defaultNow(),
  postContentFiltered: text("post_content_filtered").notNull().default(""),
  postParent: integer("post_parent").notNull().default(0),
  guid: varchar("guid", { length: 255 }).notNull().default(""),
  menuOrder: integer("menu_order").notNull().default(0),
  postType: varchar("post_type", { length: 20 }).notNull().default("post"),
  postMimeType: varchar("post_mime_type", { length: 100 })
    .notNull()
    .default(""),
  commentCount: integer("comment_count").notNull().default(0),
});

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
