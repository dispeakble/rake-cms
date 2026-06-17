import {
  pgTable,
  serial,
  text,
  varchar,
  boolean,
  integer,
} from "drizzle-orm/pg-core";

/**
 * wp_options — site-wide settings with autoload support.
 * Option values use text to support both JSON and serialized PHP strings.
 */
export const options = pgTable("wp_options", {
  id: serial("option_id").primaryKey(),
  siteId: integer("site_id").notNull().default(0),
  optionName: varchar("option_name", { length: 191 })
    .notNull()
    .default(""),
  optionValue: text("option_value").notNull().default(""),
  autoload: varchar("autoload", { length: 20 }).notNull().default("yes"),
});

export type Option = typeof options.$inferSelect;
export type NewOption = typeof options.$inferInsert;
