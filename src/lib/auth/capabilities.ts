/**
 * WordPress-compatible role and capability system.
 *
 * Maps WordPress user roles to their capabilities.
 * Roles: Administrator, Editor, Author, Contributor, Subscriber
 */

export type Capability =
  | "read"
  | "write"
  | "edit_posts"
  | "edit_others_posts"
  | "edit_published_posts"
  | "publish_posts"
  | "delete_posts"
  | "delete_others_posts"
  | "delete_published_posts"
  | "read_private_posts"
  | "edit_pages"
  | "edit_others_pages"
  | "edit_published_pages"
  | "publish_pages"
  | "delete_pages"
  | "delete_others_pages"
  | "delete_published_pages"
  | "edit_theme_options"
  | "install_themes"
  | "activate_themes"
  | "edit_themes"
  | "install_plugins"
  | "activate_plugins"
  | "edit_plugins"
  | "manage_options"
  | "moderate_comments"
  | "manage_categories"
  | "manage_links"
  | "upload_files"
  | "edit_files"
  | "import"
  | "export"
  | "list_users"
  | "create_users"
  | "edit_users"
  | "delete_users"
  | "promote_users"
  | "add_users"
  | "remove_users"
  | "switch_themes"
  | "customize"
  | "edit_dashboard";

export type Role = "administrator" | "editor" | "author" | "contributor" | "subscriber";

/**
 * Capability map per WordPress role.
 * Administrator has all capabilities (implied by * pattern).
 */
const roleCapabilities: Record<Role, Capability[]> = {
  administrator: [] as Capability[], // All caps (checked via isAdministrator)
  editor: [
    "read",
    "edit_posts",
    "edit_others_posts",
    "edit_published_posts",
    "publish_posts",
    "delete_posts",
    "delete_others_posts",
    "delete_published_posts",
    "read_private_posts",
    "edit_pages",
    "edit_others_pages",
    "edit_published_pages",
    "publish_pages",
    "delete_pages",
    "delete_others_pages",
    "delete_published_pages",
    "moderate_comments",
    "manage_categories",
    "manage_links",
    "upload_files",
    "import",
    "export",
    "unfiltered_html",
  ] as Capability[],
  author: [
    "read",
    "edit_posts",
    "edit_published_posts",
    "publish_posts",
    "delete_posts",
    "delete_published_posts",
    "upload_files",
    "unfiltered_html",
  ] as Capability[],
  contributor: [
    "read",
    "edit_posts",
    "delete_posts",
  ] as Capability[],
  subscriber: [
    "read",
  ] as Capability[],
};

export function getRoleCapabilities(role: Role): Capability[] {
  return roleCapabilities[role] || roleCapabilities.subscriber;
}

export function hasCapability(
  role: Role | null | undefined,
  capability: Capability
): boolean {
  if (!role) return false;
  if (role === "administrator") return true;
  return getRoleCapabilities(role).includes(capability);
}

export function hasAnyCapability(
  role: Role | null | undefined,
  capabilities: Capability[]
): boolean {
  return capabilities.some((cap) => hasCapability(role, cap));
}

export function hasAllCapabilities(
  role: Role | null | undefined,
  capabilities: Capability[]
): boolean {
  return capabilities.every((cap) => hasCapability(role, cap));
}

export function isAdministrator(role: Role | null | undefined): boolean {
  return role === "administrator";
}

/**
 * Higher-level permission checks used throughout the app.
 */
export function canEditPost(
  role: Role | null | undefined,
  isAuthor: boolean
): boolean {
  if (!role) return false;
  if (role === "administrator") return true;
  if (isAuthor && hasCapability(role, "edit_published_posts")) return true;
  return hasCapability(role, "edit_others_posts");
}

export function canDeletePost(
  role: Role | null | undefined,
  isAuthor: boolean
): boolean {
  if (!role) return false;
  if (role === "administrator") return true;
  if (isAuthor && hasCapability(role, "delete_published_posts")) return true;
  return hasCapability(role, "delete_others_posts");
}

export function canPublish(role: Role | null | undefined): boolean {
  if (!role) return false;
  if (role === "administrator") return true;
  return hasCapability(role, "publish_posts");
}

export function canManageOptions(role: Role | null | undefined): boolean {
  return hasCapability(role, "manage_options");
}
