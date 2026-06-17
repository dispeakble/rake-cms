import { NextResponse } from "next/server";
import { db } from "@/db";
import { options } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const entries: { name: string; value: string }[] = [];

    for (const [key, value] of formData.entries()) {
      if (typeof value === "string") {
        entries.push({ name: key, value });
      }
    }

    for (const entry of entries) {
      const existing = await db
        .select()
        .from(options)
        .where(eq(options.optionName, entry.name))
        .limit(1)
        .then((r) => r[0]);

      if (existing) {
        await db
          .update(options)
          .set({ optionValue: entry.value })
          .where(eq(options.optionName, entry.name));
      } else {
        await db
          .insert(options)
          .values({ optionName: entry.name, optionValue: entry.value });
      }
    }

    return NextResponse.redirect(new URL("/admin/settings", request.url));
  } catch (error) {
    console.error("Settings save error:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
