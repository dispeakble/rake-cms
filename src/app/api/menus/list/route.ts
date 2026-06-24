/**
 * GET /api/menus/list — List all menus
 * GET /api/menus/items?menuSlug=xxx — List menu items
 */

import { NextResponse } from "next/server";
import { eq, and, asc } from "drizzle-orm";
import { db } from "@/db";
import { posts, terms, termTaxonomy, termRelationships, postmeta } from "@/db/schema";

/**
 * GET /api/menus/list — List all navigation menus with item counts
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path.endsWith("/list")) {
    return listMenus();
  }

  if (path.endsWith("/items")) {
    const menuSlug = url.searchParams.get("menuSlug");
    if (!menuSlug) {
      return NextResponse.json({ error: "menuSlug required" }, { status: 400 });
    }
    return listMenuItems(menuSlug);
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

async function listMenus() {
  const menuTaxonomies = await db
    .select({
      id: termTaxonomy.id,
      name: terms.name,
      slug: terms.slug,
      description: termTaxonomy.description,
      count: termTaxonomy.count,
    })
    .from(termTaxonomy)
    .innerJoin(terms, eq(terms.id, termTaxonomy.termId))
    .where(eq(termTaxonomy.taxonomy, "nav_menu"))
    .orderBy(asc(terms.name));

  const menus = menuTaxonomies.map((m) => ({
    id: m.id,
    name: m.name,
    slug: m.slug,
    description: m.description || "",
    items: m.count || 0,
  }));

  return NextResponse.json({ menus });
}

async function listMenuItems(menuSlug: string) {
  const menuTax = await db
    .select({ id: termTaxonomy.id })
    .from(termTaxonomy)
    .innerJoin(terms, eq(terms.id, termTaxonomy.termId))
    .where(and(eq(terms.slug, menuSlug), eq(termTaxonomy.taxonomy, "nav_menu")))
    .limit(1)
    .then((r) => r[0]);

  if (!menuTax) {
    return NextResponse.json({ items: [] });
  }

  const menuItems = await db
    .select({
      id: posts.id,
      title: posts.postTitle,
      order: posts.menuOrder,
      parent: posts.postParent,
    })
    .from(posts)
    .innerJoin(termRelationships, eq(posts.id, termRelationships.objectId))
    .where(
      and(
        eq(posts.postType, "nav_menu_item"),
        eq(termRelationships.termTaxonomyId, menuTax.id)
      )
    )
    .orderBy(asc(posts.menuOrder));

  // Fetch meta for URLs
  const itemIds = menuItems.map((i) => i.id);
  let metaMap = new Map<number, Record<string, string>>();

  if (itemIds.length > 0) {
    const allMeta = await db
      .select()
      .from(postmeta)
      .where(
        eq(postmeta.postId, itemIds[0])
      );

    for (const meta of allMeta) {
      if (!meta.postId || !meta.metaKey) continue;
      if (!metaMap.has(meta.postId)) {
        metaMap.set(meta.postId, {});
      }
      metaMap.get(meta.postId)![meta.metaKey] = meta.metaValue || "";
    }
  }

  const items = menuItems.map((item) => {
    const meta = metaMap.get(item.id) || {};
    return {
      id: item.id,
      title: meta["_menu_item_title"] || item.title,
      url: meta["_menu_item_url"] || "",
      parentId: parseInt(meta["_menu_item_menu_item_parent"] || "0"),
      order: item.order || 0,
    };
  });

  return NextResponse.json({ items });
}
