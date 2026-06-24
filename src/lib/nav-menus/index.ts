/**
 * Rake CMS — Navigation Menus
 *
 * WordPress-compatible navigation menu system.
 * Menus are stored as a taxonomy ("nav_menu") with menu items
 * stored as posts (post_type = "nav_menu_item") linked via
 * the term_relationships table.
 *
 * Usage:
 *   import { getMenu, renderMenu } from "@/lib/nav-menus";
 *
 *   // Get menu items
 *   const items = await getMenu("primary");
 *   // => [{ id, title, url, parentId, order, target, classes }, ...]
 *
 *   // In a theme component
 *   <nav>{items.map(item => <a href={item.url}>{item.title}</a>)}</nav>
 */

import { eq, and, asc, inArray } from "drizzle-orm";
import { db } from "@/db";
import { posts, terms, termTaxonomy, termRelationships, postmeta } from "@/db/schema";

export interface NavMenuItem {
  id: number;
  menuItemId: number;
  title: string;
  url: string;
  parentId: number;
  order: number;
  target: string;
  classes: string[];
  description: string;
  objectType: string;
  objectId: number;
  type: "custom" | "post_type" | "taxonomy";
  children: NavMenuItem[];
}

export interface NavMenu {
  id: number;
  name: string;
  slug: string;
  description: string;
  items: NavMenuItem[];
}

/**
 * Get the database taxonomy ID for a menu slug.
 */
async function getMenuTermId(slug: string): Promise<number | null> {
  const term = await db
    .select({ id: terms.id })
    .from(terms)
    .innerJoin(termTaxonomy, eq(terms.id, termTaxonomy.termId))
    .where(
      and(eq(terms.slug, slug), eq(termTaxonomy.taxonomy, "nav_menu"))
    )
    .limit(1)
    .then((r) => r[0]);

  return term?.id || null;
}

/**
 * Get all registered navigation menus.
 */
export async function getMenus(): Promise<NavMenu[]> {
  const menuTaxonomies = await db
    .select({
      termId: termTaxonomy.termId,
      termTaxonomyId: termTaxonomy.id,
      name: terms.name,
      slug: terms.slug,
      description: termTaxonomy.description,
      count: termTaxonomy.count,
    })
    .from(termTaxonomy)
    .innerJoin(terms, eq(terms.id, termTaxonomy.termId))
    .where(eq(termTaxonomy.taxonomy, "nav_menu"))
    .orderBy(asc(terms.name));

  const menus: NavMenu[] = [];

  for (const menu of menuTaxonomies) {
    const items = await getMenuItems(menu.slug);
    menus.push({
      id: menu.termTaxonomyId,
      name: menu.name,
      slug: menu.slug,
      description: menu.description || "",
      items,
    });
  }

  return menus;
}

/**
 * Get all items for a menu, organized as a tree.
 */
export async function getMenuItems(slug: string): Promise<NavMenuItem[]> {
  // Find the menu term
  const menuTerm = await db
    .select({ termTaxonomyId: termTaxonomy.id })
    .from(termTaxonomy)
    .innerJoin(terms, eq(terms.id, termTaxonomy.termId))
    .where(
      and(eq(terms.slug, slug), eq(termTaxonomy.taxonomy, "nav_menu"))
    )
    .limit(1)
    .then((r) => r[0]);

  if (!menuTerm) return [];

  // Get all nav_menu_item posts linked to this menu
  const menuItems = await db
    .select({
      id: posts.id,
      postTitle: posts.postTitle,
      postContent: posts.postContent,
      menuOrder: posts.menuOrder,
      postParent: posts.postParent,
    })
    .from(posts)
    .innerJoin(termRelationships, eq(posts.id, termRelationships.objectId))
    .where(
      and(
        eq(posts.postType, "nav_menu_item"),
        eq(termRelationships.termTaxonomyId, menuTerm.termTaxonomyId),
        eq(posts.postStatus, "publish")
      )
    )
    .orderBy(asc(posts.menuOrder));

  if (menuItems.length === 0) return [];

  const itemIds = menuItems.map((item) => item.id);

  // Fetch all meta for these items
  const allMeta = await db
    .select()
    .from(postmeta)
    .where(inArray(postmeta.postId, itemIds));

  // Build meta lookup
  const metaMap = new Map<number, Record<string, string>>();
  for (const meta of allMeta) {
    if (!meta.postId || !meta.metaKey) continue;
    if (!metaMap.has(meta.postId)) {
      metaMap.set(meta.postId, {});
    }
    metaMap.get(meta.postId)![meta.metaKey] = meta.metaValue || "";
  }

  // Build item list
  const items: NavMenuItem[] = menuItems.map((item) => {
    const meta = metaMap.get(item.id) || {};
    return {
      id: item.id,
      menuItemId: item.id,
      title: meta["_menu_item_title"] || item.postTitle || "Untitled",
      url: computeMenuItemUrl(meta, item),
      parentId: parseInt(meta["_menu_item_menu_item_parent"] || "0"),
      order: item.menuOrder || 0,
      target: meta["_menu_item_target"] || "",
      classes: (meta["_menu_item_classes"] || "").split(" ").filter(Boolean),
      description: meta["_menu_item_description"] || item.postContent || "",
      objectType: meta["_menu_item_object"] || "custom",
      objectId: parseInt(meta["_menu_item_object_id"] || "0"),
      type: (meta["_menu_item_type"] as "custom" | "post_type" | "taxonomy") || "custom",
      children: [],
    };
  });

  // Build tree
  return buildMenuTree(items);
}

/**
 * Compute a menu item's URL from its meta data.
 */
function computeMenuItemUrl(
  meta: Record<string, string>,
  item: { id: number }
): string {
  const type = meta["_menu_item_type"];

  if (type === "custom") {
    return meta["_menu_item_url"] || "#";
  }

  if (type === "post_type") {
    // Link to the front-end URL
    const slug = meta["_menu_item_object_slug"] || "";
    return slug ? `/${slug}` : "#";
  }

  if (type === "taxonomy") {
    const slug = meta["_menu_item_object_slug"] || "";
    return slug ? `/category/${slug}` : "#";
  }

  return "#";
}

/**
 * Build a tree from flat menu items.
 */
function buildMenuTree(items: NavMenuItem[]): NavMenuItem[] {
  const itemMap = new Map<number, NavMenuItem>();
  const roots: NavMenuItem[] = [];

  for (const item of items) {
    itemMap.set(item.id, { ...item, children: [] });
  }

  for (const item of itemMap.values()) {
    if (item.parentId && itemMap.has(item.parentId)) {
      itemMap.get(item.parentId)!.children.push(item);
    } else {
      roots.push(item);
    }
  }

  return roots;
}

/**
 * Get a single menu by slug, with tree-structured items.
 */
export async function getMenu(slug: string): Promise<NavMenu | null> {
  const menuTerm = await db
    .select({
      termTaxonomyId: termTaxonomy.id,
      name: terms.name,
      slug: terms.slug,
      description: termTaxonomy.description,
    })
    .from(termTaxonomy)
    .innerJoin(terms, eq(terms.id, termTaxonomy.termId))
    .where(
      and(eq(terms.slug, slug), eq(termTaxonomy.taxonomy, "nav_menu"))
    )
    .limit(1)
    .then((r) => r[0]);

  if (!menuTerm) return null;

  const items = await getMenuItems(slug);

  return {
    id: menuTerm.termTaxonomyId,
    name: menuTerm.name,
    slug: menuTerm.slug,
    description: menuTerm.description || "",
    items,
  };
}

/**
 * Render a menu as HTML <ul>/<li>.
 * For use in theme components or the block editor.
 */
export function renderMenuHtml(
  items: NavMenuItem[],
  options: {
    depth?: number;
    containerClass?: string;
    menuClass?: string;
    subMenuClass?: string;
    currentUrl?: string;
  } = {}
): string {
  const {
    depth = 0,
    containerClass = "menu-container",
    menuClass = "menu",
    subMenuClass = "sub-menu",
    currentUrl = "",
  } = options;

  if (items.length === 0) return "";

  const tag = depth === 0 ? "ul" : "ul";
  const className = depth === 0 ? menuClass : subMenuClass;

  let html = `<${tag} class="${className}">`;

  for (const item of items) {
    const isCurrent = currentUrl && item.url === currentUrl;
    const classes = [
      "menu-item",
      `menu-item-${item.id}`,
      ...item.classes,
      isCurrent ? "current-menu-item" : "",
      item.children.length > 0 ? "menu-item-has-children" : "",
    ]
      .filter(Boolean)
      .join(" ");

    html += `<li class="${classes}">`;
    html += `<a href="${item.url}" target="${item.target || "_self"}" class="menu-link">${item.title}</a>`;

    if (item.children.length > 0 && depth < 10) {
      html += renderMenuHtml(item.children, {
        ...options,
        depth: depth + 1,
      });
    }

    html += `</li>`;
  }

  html += `</${tag}>`;

  return html;
}
