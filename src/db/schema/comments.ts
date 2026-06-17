import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { posts } from "./posts";

/**
 * wp_comments — comments on posts with approval status.
 */
export const comments = pgTable("wp_comments", {
  id: serial("comment_ID").primaryKey(),
  commentPostId: integer("comment_post_ID")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  commentAuthor: text("comment_author").notNull().default(""),
  commentAuthorEmail: varchar("comment_author_email", { length: 100 })
    .notNull()
    .default(""),
  commentAuthorUrl: varchar("comment_author_url", { length: 200 })
    .notNull()
    .default(""),
  commentAuthorIp: varchar("comment_author_IP", { length: 100 })
    .notNull()
    .default(""),
  commentDate: timestamp("comment_date", { mode: "string" })
    .notNull()
    .defaultNow(),
  commentDateGmt: timestamp("comment_date_gmt", { mode: "string" })
    .notNull()
    .defaultNow(),
  commentContent: text("comment_content").notNull().default(""),
  commentKarma: integer("comment_karma").notNull().default(0),
  commentApproved: varchar("comment_approved", { length: 20 })
    .notNull()
    .default("1"),
  commentAgent: varchar("comment_agent", { length: 255 })
    .notNull()
    .default(""),
  commentType: varchar("comment_type", { length: 20 })
    .notNull()
    .default("comment"),
  commentParent: integer("comment_parent").notNull().default(0),
  userId: integer("user_id").notNull().default(0),
});

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
