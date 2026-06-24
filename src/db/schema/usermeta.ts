import { pgTable, serial, text, integer, varchar } from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * wp_usermeta — key/value metadata for users.
 * Maps directly to the WordPress usermeta table schema.
 */
export const usermeta = pgTable("wp_usermeta", {
  id: serial("umeta_id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  metaKey: varchar("meta_key", { length: 255 }),
  metaValue: text("meta_value"),
});

export type UserMeta = typeof usermeta.$inferSelect;
export type NewUserMeta = typeof usermeta.$inferInsert;

/**
 * Common user meta keys used throughout the CMS.
 */
export const USER_META_KEYS = {
  FIRST_NAME: "first_name",
  LAST_NAME: "last_name",
  NICKNAME: "nickname",
  DESCRIPTION: "description",
  PROFILE_PICTURE: "profile_picture",
  PHONE: "phone",
  LOCATION: "location",
  WEBSITE: "website",
  SOCIAL_GITHUB: "social_github",
  SOCIAL_TWITTER: "social_twitter",
  SHOW_ADMIN_TOOLBAR: "show_admin_toolbar",
  LAST_LOGIN: "last_login",
  TWO_FACTOR_ENABLED: "2fa_enabled",
} as const;

/**
 * Get a single user meta value.
 */
export function getUserMetaKey(key: string): string {
  return key;
}
