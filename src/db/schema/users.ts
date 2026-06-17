import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * wp_users — user accounts.
 */
export const users = pgTable("wp_users", {
  id: serial("ID").primaryKey(),
  userLogin: varchar("user_login", { length: 60 }).notNull().default(""),
  userPass: varchar("user_pass", { length: 255 }).notNull().default(""),
  userNicename: varchar("user_nicename", { length: 50 }).notNull().default(""),
  userEmail: varchar("user_email", { length: 100 }).notNull().default(""),
  userUrl: varchar("user_url", { length: 100 }).notNull().default(""),
  userRegistered: timestamp("user_registered", { mode: "string" })
    .notNull()
    .defaultNow(),
  userActivationKey: varchar("user_activation_key", { length: 255 })
    .notNull()
    .default(""),
  userStatus: integer("user_status").notNull().default(0),
  displayName: varchar("display_name", { length: 250 }).notNull().default(""),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
