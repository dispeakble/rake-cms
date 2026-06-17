import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { comments } from "@/db/schema";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db
    .update(comments)
    .set({ commentApproved: "1" })
    .where(eq(comments.id, parseInt(id)));

  return NextResponse.redirect(new URL("/admin/comments", request.url));
}
