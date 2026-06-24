/**
 * Rake CMS — Custom Post Types
 *
 * WordPress-compatible post type registration.
 * Allows plugins to register custom content types.
 *
 * Usage:
 *   import { registerPostType, getPostTypes } from "@/lib/cpt";
 *
 *   registerPostType("product", {
 *     label: "Products",
 *     singularLabel: "Product",
 *     supports: ["title", "editor", "thumbnail"],
 *     menuIcon: "🛒",
 *     menuPosition: 6,
 *     taxonomies: ["category", "product_tag"],
 *   });
 *
 *   // Then initialize at app startup
 *   import { initializePostTypes } from "@/lib/cpt";
 *   initializePostTypes();
 */

export {
  registerPostType,
  initializePostTypes,
  getPostTypes,
  getPostType,
  postTypeExists,
  getPostTypesBySupport,
  getMenuPostTypes,
  getPostTypeLabels,
  getRestBase,
  getAdminUrl,
  getEditUrl,
} from "./registry";

export type { PostTypeArgs, PostTypeSupport } from "./registry";

// Re-export taxonomy helpers
export { getObjectTaxonomies } from "./taxonomies";
