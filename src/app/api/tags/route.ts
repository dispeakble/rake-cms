import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { terms, termTaxonomy } from "@/db/schema";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 200);
}

/**
 * POST /api/tags — Create a new tag or category
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, taxonomy } = body;

    if (!name || !taxonomy) {
      return NextResponse.json({ error: "Name and taxonomy are required" }, { status: 400 });
    }

    const slug = slugify(name);

    // Check if term exists
    const existing = await db
      .select()
      .from(terms)
      .where(eq(terms.slug, slug))
      .limit(1)
      .then((r) => r[0]);

    let termId: number;
    if (existing) {
      termId = existing.id;
    } else {
      const [term] = await db
        .insert(terms)
        .values({ name, slug })
        .returning();
      termId = term.id;
    }

    // Check if term_taxonomy exists
    const existingTax = await db
      .select()
      .from(termTaxonomy)
      .where(and(eq(termTaxonomy.termId, termId), eq(termTaxonomy.taxonomy, taxonomy)))
      .limit(1)
      .then((r) => r[0]);

    if (existingTax) {
      return NextResponse.json({ error: "Term already exists in this taxonomy" }, { status: 409 });
    }

    const [tax] = await db
      .insert(termTaxonomy)
      .values({ termId, taxonomy })
      .returning();

    return NextResponse.json({ term: { id: tax.id, name, slug, taxonomy } });
  } catch (error) {
    console.error("Create tag error:", error);
    return NextResponse.json({ error: "Failed to create tag" }, { status: 500 });
  }
}

/**
 * DELETE /api/tags — Delete a tag or category
 */
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id, taxonomy } = body;

    if (!id || !taxonomy) {
      return NextResponse.json({ error: "id and taxonomy are required" }, { status: 400 });
    }

    const tax = await db
      .select()
      .from(termTaxonomy)
      .where(and(eq(termTaxonomy.id, id), eq(termTaxonomy.taxonomy, taxonomy)))
      .limit(1)
      .then((r) => r[0]);

    if (tax) {
      await db.delete(termTaxonomy).where(eq(termTaxonomy.id, id));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete tag error:", error);
    return NextResponse.json({ error: "Failed to delete tag" }, { status: 500 });
  }
}
