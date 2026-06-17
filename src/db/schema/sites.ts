import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  jsonb,
  boolean,
} from "drizzle-orm/pg-core";

/**
 * wp_sites — multi-tenant site registry.
 * Each subdomain (e.g., la-tajea.alexawebservers.com) maps to one site
 * with its own theme configuration, content, and settings.
 */
export const sites = pgTable("wp_sites", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  name: text("name").notNull().default(""),
  subdomain: varchar("subdomain", { length: 200 }).notNull().unique(),
  domain: varchar("domain", { length: 255 }).notNull().default(""),
  description: text("description").notNull().default(""),
  businessType: varchar("business_type", { length: 50 }).notNull().default("other"),
  themeConfig: jsonb("theme_config").notNull().default({
    primaryColor: "#3b82f6",
    secondaryColor: "#6b7280",
    accentColor: "#f9fafb",
    fontFamily: "Inter",
    layout: "centered",
  }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
});

export type Site = typeof sites.$inferSelect;
export type NewSite = typeof sites.$inferInsert;
