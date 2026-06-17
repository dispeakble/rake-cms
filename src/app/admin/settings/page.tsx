import { db } from "@/db";
import { options } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminSettings() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const siteTitle = await db.select().from(options).where(eq(options.optionName, "blogname")).limit(1).then(r => r[0]);
  const siteDesc = await db.select().from(options).where(eq(options.optionName, "blogdescription")).limit(1).then(r => r[0]);
  const postsPerPage = await db.select().from(options).where(eq(options.optionName, "posts_per_page")).limit(1).then(r => r[0]);
  const defaultCategory = await db.select().from(options).where(eq(options.optionName, "default_category")).limit(1).then(r => r[0]);

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <form action="/api/settings" method="POST" className="space-y-6">
        <div className="space-y-4 rounded-lg border p-6">
          <h2 className="text-lg font-semibold">General Settings</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Site Title</label>
            <input
              type="text"
              defaultValue={siteTitle?.optionValue || "My Site"}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              name="blogname"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tagline</label>
            <input
              type="text"
              defaultValue={siteDesc?.optionValue || ""}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              name="blogdescription"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Posts per page</label>
            <input
              type="number"
              defaultValue={postsPerPage?.optionValue || "10"}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              name="posts_per_page"
              min={1}
              max={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Site URL</label>
            <input
              type="text"
              defaultValue={process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              name="siteurl"
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Default Category</label>
            <input
              type="text"
              defaultValue={defaultCategory?.optionValue || "1"}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              name="default_category"
              placeholder="Category ID"
            />
          </div>
        </div>

        <button className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Save Settings
        </button>
      </form>
    </div>
  );
}
