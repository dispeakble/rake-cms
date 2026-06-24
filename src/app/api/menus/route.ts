/**
 * Rake CMS — Menu Management API
 *
 * POST /api/menus — Create/rename/delete a menu
 */

import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { posts, terms, termTaxonomy, termRelationships, postmeta } from "@/db/schema";
import { auth } from "@/auth";

/**
 * POST /api/menus — Create or update a navigation menu
 * body: { action: "create" | "rename" | "delete", name?, slug?, newName? }
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, name, slug, newName } = body;

    switch (action) {
      case "create": {
        if (!name) {
          return NextResponse.json({ error: "Menu name is required" }, { status: 400 });
        }

        const menuSlug = slug || name.toLowerCase().replace(/[^a-z0-9-]/g, "-").substring(0, 200);

        // Check if menu already exists
        const existing = await db
          .select()
          .from(terms)
          .where(eq(terms.slug, menuSlug))
          .limit(1)
          .then((r) => r[0]);

        if (existing) {
          return NextResponse.json({ error: "A menu with this name already exists" }, { status: 409 });
        }

        // Create term
        const [term] = await db
          .insert(terms)
          .values({
            name: name,
            slug: menuSlug,
            termGroup: "0",
          } as typeof terms.$inferInsert)
          .returning();

        // Create taxonomy entry
        const [tax] = await db
          .insert(termTaxonomy)
          .values({
            termId: term.id,
            taxonomy: "nav_menu",
            description: "",
          })
          .returning();

        return NextResponse.json({ menu: { id: tax.id, name, slug: menuSlug } });
      }

      case "rename": {
        if (!slug || !newName) {
          return NextResponse.json({ error: "slug and newName are required" }, { status: 400 });
        }
        await db.update(terms).set({ name: newName }).where(eq(terms.slug, slug));
        return NextResponse.json({ success: true });
      }

      case "delete": {
        if (!slug) {
          return NextResponse.json({ error: "slug is required" }, { status: 400 });
        }

        const term = await db
          .select({ id: terms.id })
          .from(terms)
          .where(eq(terms.slug, slug))
          .limit(1)
          .then((r) => r[0]);

        if (!term) {
          return NextResponse.json({ error: "Menu not found" }, { status: 404 });
        }

        const tax = await db
          .select()
          .from(termTaxonomy)
          .where(and(eq(termTaxonomy.termId, term.id), eq(termTaxonomy.taxonomy, "nav_menu")))
          .limit(1)
          .then((r) => r[0]);

        if (tax) {
          const menuItems = await db
            .select({ id: posts.id })
            .from(posts)
            .innerJoin(termRelationships, eq(posts.id, termRelationships.objectId))
            .where(
              and(
                eq(posts.postType, "nav_menu_item"),
                eq(termRelationships.termTaxonomyId, tax.id)
              )
            );

          for (const item of menuItems) {
            await db.delete(postmeta).where(eq(postmeta.postId, item.id));
            await db.delete(posts).where(eq(posts.id, item.id));
          }

          await db
            .delete(termRelationships)
            .where(eq(termRelationships.termTaxonomyId, tax.id));

          await db.delete(termTaxonomy).where(eq(termTaxonomy.id, tax.id));
        }

        await db.delete(terms).where(eq(terms.id, term.id));

        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("[Menus API] Error:", error);
    return NextResponse.json({ error: "Failed to process menu request" }, { status: 500 });
  }
}
