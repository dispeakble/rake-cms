import type { Metadata } from "next";
import { db } from "@/db";
import { sites } from "@/db/schema/sites";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import GeneratedPage from "@/components/theme/GeneratedPage";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const h = await headers();
    // Try to detect site from hostname
    const host = h.get("host") || "";
    const slug = h.get("x-site-slug") || host.split(".")[0] || "";
    if (slug) {
      // Filter out www, admin, mail, webmail — those aren't CMS sites
      const knownPrefixes = ["www", "admin", "mail", "webmail", "localhost"];
      if (!knownPrefixes.includes(slug)) {
        const site = await db.query.sites.findFirst({
          where: eq(sites.slug, slug),
        });
        if (site?.name) {
          return { title: site.name };
        }
      }
    }
  } catch {
    // Fall through to default
  }
  return { title: "Rake CMS" };
}

export default function Home() {
  return <GeneratedPage />;
}
