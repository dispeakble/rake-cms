/**
 * Rake CMS — Menu Items API
 *
 * GET /api/menus/items?menuSlug=xxx — List items for a menu
 * PUT /api/menus/items — Add/remove/reorder items
 */

import { NextResponse } from "next/server";
import { eq, and, asc, inArray, count } from "drizzle-orm";
import { db } from "@/db";
import { posts, terms, termTaxonomy, termRelationships, postmeta } from "@/db/schema";
import { auth } from "@/auth";

/**
 * GET /api/menus/items?menuSlug=xxx — List items for a menu
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const menuSlug = url.searchParams.get("menuSlug");

  if (!menuSlug) {
    return NextResponse.json({ error: "menuSlug required" }, { status: 400 });
  }

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
  const metaMap = new Map<number, Record<string, string>>();

  if (itemIds.length > 0) {
    const allMeta = await db
      .select()
      .from(postmeta)
      .where(inArray(postmeta.postId, itemIds));

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
      title: meta["_menu_item_title"] || item.title || "Untitled",
      url: meta["_menu_item_url"] || "",
      parentId: parseInt(meta["_menu_item_menu_item_parent"] || "0"),
      order: item.order || 0,
    };
  });

  return NextResponse.json({ items });
}

/**
 * PUT /api/menus/items — Add/remove/reorder menu items
 * body: { action: "add_item" | "remove_item" | "reorder", ... }
 */
export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "add_item":
        return addItem(body);
      case "remove_item":
        return removeItem(body);
      case "reorder":
        return reorderItems(body);
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("[Menu Items API] Error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}

async function addItem(body: Record<string, unknown>) {
  const {
    menuSlug,
    title,
    url = "",
    type = "custom",
    parentId = 0,
    target = "",
    objectId = 0,
    objectType = "",
  } = body as {
    menuSlug: string;
    title: string;
    url?: string;
    type?: string;
    parentId?: number;
    target?: string;
    objectId?: number;
    objectType?: string;
  };

  if (!menuSlug || !title) {
    return NextResponse.json({ error: "menuSlug and title are required" }, { status: 400 });
  }

  const menuTax = await db
    .select({ id: termTaxonomy.id })
    .from(termTaxonomy)
    .innerJoin(terms, eq(terms.id, termTaxonomy.termId))
    .where(and(eq(terms.slug, menuSlug), eq(termTaxonomy.taxonomy, "nav_menu")))
    .limit(1)
    .then((r) => r[0]);

  if (!menuTax) {
    return NextResponse.json({ error: "Menu not found" }, { status: 404 });
  }

  // Get max menu_order
  const [maxResult] = await db
    .select({ max: posts.menuOrder })
    .from(posts)
    .where(eq(posts.postType, "nav_menu_item"))
    .orderBy(asc(posts.menuOrder))
    .limit(1);

  const now = new Date().toISOString();
  const [item] = await db
    .insert(posts)
    .values({
      postTitle: title,
      postContent: "",
      postStatus: "publish",
      postType: "nav_menu_item",
      postName: title.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
      menuOrder: (maxResult?.max || 0) + 1,
      postDate: now,
      postDateGmt: now,
      postModified: now,
      postModifiedGmt: now,
      postAuthor: 0,
    })
    .returning();

  // Link item to menu
  await db.insert(termRelationships).values({
    objectId: item.id,
    termTaxonomyId: menuTax.id,
  });

  // Insert meta data
  const metaEntries = [
    { metaKey: "_menu_item_type", metaValue: type },
    { metaKey: "_menu_item_menu_item_parent", metaValue: String(parentId) },
    { metaKey: "_menu_item_target", metaValue: target },
    { metaKey: "_menu_item_classes", metaValue: "" },
    { metaKey: "_menu_item_title", metaValue: title },
    { metaKey: "_menu_item_url", metaValue: url },
    { metaKey: "_menu_item_object_id", metaValue: String(objectId) },
    { metaKey: "_menu_item_object", metaValue: objectType || type },
    { metaKey: "_menu_item_description", metaValue: "" },
  ];

  for (const entry of metaEntries) {
    await db.insert(postmeta).values({
      postId: item.id,
      metaKey: entry.metaKey,
      metaValue: entry.metaValue,
    });
  }

  // Update count
  const [countResult] = await db
    .select({ value: count() })
    .from(termRelationships)
    .where(eq(termRelationships.termTaxonomyId, menuTax.id));

  await db
    .update(termTaxonomy)
    .set({ count: Number(countResult?.value || 0) })
    .where(eq(termTaxonomy.id, menuTax.id));

  return NextResponse.json({ item: { id: item.id, title, url } });
}

async function removeItem(body: Record<string, unknown>) {
  const { itemId } = body as { itemId: number };

  if (!itemId) {
    return NextResponse.json({ error: "itemId is required" }, { status: 400 });
  }

  await db.delete(postmeta).where(eq(postmeta.postId, itemId));
  await db.delete(termRelationships).where(eq(termRelationships.objectId, itemId));
  await db.delete(posts).where(eq(posts.id, itemId));

  return NextResponse.json({ success: true });
}

async function reorderItems(body: Record<string, unknown>) {
  const { items } = body as {
    items: { id: number; order: number; parentId: number }[];
  };

  if (!items) {
    return NextResponse.json({ error: "items array is required" }, { status: 400 });
  }

  for (const item of items) {
    await db
      .update(posts)
      .set({ menuOrder: item.order, postParent: item.parentId })
      .where(eq(posts.id, item.id));
  }

  return NextResponse.json({ success: true });
}
