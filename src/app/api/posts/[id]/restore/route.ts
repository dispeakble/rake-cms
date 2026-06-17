import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { posts } from "@/db/schema";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db
    .update(posts)
    .set({ postStatus: "draft" })
    .where(eq(posts.id, parseInt(id)));

  return NextResponse.redirect(new URL("/admin/posts", request.url));
}
