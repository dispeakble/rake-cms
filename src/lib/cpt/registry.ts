/**
 * Rake CMS — Custom Post Types Registry
 *
 * WordPress-compatible post type registration API.
 * Uses the hooks system (addFilter/applyFilters) to allow
 * plugins and themes to register custom content types.
 *
 * Usage:
 *   import { registerPostType, getPostTypes, getPostType } from "@/lib/cpt";
 *
 *   // Register a "portfolio" post type (call at app startup)
 *   registerPostType("portfolio", {
 *     label: "Portfolio",
 *     singularLabel: "Project",
 *     description: "Portfolio projects",
 *     public: true,
 *     supports: ["title", "editor", "thumbnail", "excerpt"],
 *     menuIcon: "🎨",
 *     menuPosition: 5,
 *   });
 *
 *   // List all registered post types
 *   const types = getPostTypes();
 *   // => { post: {...}, page: {...}, portfolio: {...} }
 */

import { addFilter, applyFilters } from "@/lib/hooks";

export interface PostTypeArgs {
  /** Plural display name (e.g., "Portfolio Projects") */
  label: string;
  /** Singular display name (e.g., "Project") */
  singularLabel: string;
  /** Description of the post type */
  description?: string;
  /** Whether the post type is publicly viewable */
  public?: boolean;
  /** Whether it's hierarchical (like pages) */
  hierarchical?: boolean;
  /** Supported features */
  supports?: PostTypeSupport[];
  /** Admin menu icon (emoji or path) */
  menuIcon?: string;
  /** Position in admin sidebar menu */
  menuPosition?: number;
  /** Custom labels */
  labels?: Record<string, string>;
  /** Whether the post type is available in the REST API */
  showInRest?: boolean;
  /** REST API base slug */
  restBase?: string;
  /** Whether to show in the admin menu */
  showInMenu?: boolean;
  /** Whether to show in the admin bar */
  showInAdminBar?: boolean;
  /** Whether results can be paginated */
  publiclyQueryable?: boolean;
  /** Capability type or object */
  capabilityType?: string | Record<string, string>;
  /** Array of taxonomy keys to associate */
  taxonomies?: string[];
}

export type PostTypeSupport =
  | "title"
  | "editor"
  | "thumbnail"
  | "excerpt"
  | "trackbacks"
  | "custom-fields"
  | "comments"
  | "revisions"
  | "author"
  | "page-attributes"
  | "post-formats";

interface RegisteredPostType {
  name: string;
  args: PostTypeArgs;
}

/** Internal registry of post types */
const postTypes = new Map<string, RegisteredPostType>();

/** Built-in post types */
const BUILT_IN_TYPES: Record<string, PostTypeArgs> = {
  post: {
    label: "Posts",
    singularLabel: "Post",
    description: "Blog posts and articles",
    public: true,
    hierarchical: false,
    supports: ["title", "editor", "thumbnail", "excerpt", "comments", "revisions", "author"],
    menuIcon: "📝",
    menuPosition: 5,
    showInRest: true,
    restBase: "posts",
    showInMenu: true,
    showInAdminBar: true,
    publiclyQueryable: true,
    capabilityType: "post",
    taxonomies: ["category", "post_tag"],
  },
  page: {
    label: "Pages",
    singularLabel: "Page",
    description: "Static pages",
    public: true,
    hierarchical: true,
    supports: ["title", "editor", "thumbnail", "revisions", "page-attributes"],
    menuIcon: "📄",
    menuPosition: 10,
    showInRest: true,
    restBase: "pages",
    showInMenu: true,
    showInAdminBar: true,
    publiclyQueryable: true,
    capabilityType: "page",
    taxonomies: [],
  },
};

/**
 * Register a custom post type.
 *
 * @param name - Post type key (e.g., "portfolio", "product") — max 20 chars, lowercase
 * @param args - Post type configuration
 */
export function registerPostType(name: string, args: PostTypeArgs): void {
  const sanitizedName = name.toLowerCase().replace(/[^a-z0-9_-]/g, "").substring(0, 20);

  if (!sanitizedName) {
    console.error(`[CPT] Invalid post type name: "${name}"`);
    return;
  }

  if (postTypes.has(sanitizedName)) {
    console.warn(`[CPT] Post type "${sanitizedName}" is already registered. Overriding.`);
  }

  // Apply filters so plugins can modify registration
  const filteredArgs = applyFilters("register_post_type_args", args, sanitizedName);

  // Resolve promise synchronously for registration (values are known at init time)
  if (filteredArgs instanceof Promise) {
    filteredArgs.then((resolved) => {
      postTypes.set(sanitizedName, { name: sanitizedName, args: resolved });
      doActionPostTypeRegistered(sanitizedName, resolved);
    });
    return;
  }

  postTypes.set(sanitizedName, { name: sanitizedName, args: filteredArgs as PostTypeArgs });

  // Fire action hook
  doActionPostTypeRegistered(sanitizedName, args);
}

/**
 * Fire the registered_post_type action hook asynchronously.
 */
async function doActionPostTypeRegistered(
  name: string,
  args: PostTypeArgs
): Promise<void> {
  const { doAction } = await import("@/lib/hooks");
  await doAction("registered_post_type", name, args);
}

/**
 * Initialize built-in post types (called at app startup).
 */
export function initializePostTypes(): void {
  for (const [name, args] of Object.entries(BUILT_IN_TYPES)) {
    if (!postTypes.has(name)) {
      postTypes.set(name, { name, args });
    }
  }
}

/**
 * Get all registered post types.
 */
export function getPostTypes(): Record<string, PostTypeArgs> {
  initializePostTypes();
  const result: Record<string, PostTypeArgs> = {};
  for (const [name, registered] of postTypes) {
    result[name] = registered.args;
  }
  return result;
}

/**
 * Get a single registered post type by name.
 */
export function getPostType(name: string): PostTypeArgs | null {
  initializePostTypes();
  return postTypes.get(name)?.args || null;
}

/**
 * Check if a post type is registered.
 */
export function postTypeExists(name: string): boolean {
  initializePostTypes();
  return postTypes.has(name);
}

/**
 * Get post types that support a specific feature.
 */
export function getPostTypesBySupport(feature: PostTypeSupport): string[] {
  initializePostTypes();
  const result: string[] = [];
  for (const [name, registered] of postTypes) {
    if (registered.args.supports?.includes(feature)) {
      result.push(name);
    }
  }
  return result;
}

/**
 * Get post types visible in the admin menu.
 */
export function getMenuPostTypes(): [string, PostTypeArgs][] {
  initializePostTypes();
  const result: [string, PostTypeArgs][] = [];

  for (const [name, registered] of postTypes) {
    if (registered.args.showInMenu !== false) {
      result.push([name, registered.args]);
    }
  }

  // Sort by menu position
  result.sort((a, b) => (a[1].menuPosition || 99) - (b[1].menuPosition || 99));

  return result;
}

/**
 * Generate admin labels for a post type.
 */
export function getPostTypeLabels(
  postType: string,
  args: PostTypeArgs
): Record<string, string> {
  const singular = args.singularLabel;
  const plural = args.label;

  return {
    name: plural,
    singularName: singular,
    addNew: `Add New ${singular}`,
    addNewItem: `Add New ${singular}`,
    editItem: `Edit ${singular}`,
    newItem: `New ${singular}`,
    viewItem: `View ${singular}`,
    searchItems: `Search ${plural}`,
    notFound: `No ${plural.toLowerCase()} found`,
    notFoundInTrash: `No ${plural.toLowerCase()} found in Trash`,
    allItems: `All ${plural}`,
    menuName: plural,
    ...args.labels,
  };
}

/**
 * Get the REST API base for a post type.
 */
export function getRestBase(postType: string): string {
  const pt = getPostType(postType);
  return pt?.restBase || `${postType}s`;
}

/**
 * Get the admin URL for listing posts of a type.
 */
export function getAdminUrl(postType: string): string {
  if (postType === "post") return "/admin/posts";
  return `/admin/${postType}`;
}

export function getEditUrl(postType: string, id: number): string {
  if (postType === "post") return `/admin/posts/${id}/edit`;
  return `/admin/${postType}/${id}/edit`;
}
