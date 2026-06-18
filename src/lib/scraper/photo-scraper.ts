/**
 * Photo Scraper — downloads images from websites / Maps / fallback sources.
 *
 * Integrates with the rapid-deploy pipeline to populate the CMS media library
 * with business-appropriate photos for the generated theme.
 */
import fs from "fs/promises";
import path from "path";
import { fetchWithRetry } from "@/lib/reliability/retry";
import type { ScrapedSite, BusinessType } from "@/lib/scraper/web-scraper";
import type { BusinessData } from "@/lib/scraper/maps-scraper";
import { searchBraveImages } from "@/lib/scraper/brave-scraper";

export interface ScrapedPhoto {
  url: string;
  localPath: string;
  alt: string;
  source: "website" | "maps" | "unsplash";
}

const OUTPUT_DIR = path.join(process.cwd(), "public", "media", "scraped");

/**
 * Business-type-specific search queries for Unsplash fallback photos.
 */
const UNSPLASH_QUERIES: Record<BusinessType, string[]> = {
  restaurant: ["restaurant food", "chef cooking", "dining table", "interior restaurant"],
  retail: ["shop interior", "retail store", "products display", "storefront"],
  service: ["service professional", "workshop", "repair tools", "consultation"],
  professional: ["office desk", "meeting room", "professional team", "business handshake"],
  healthcare: ["medical clinic", "doctor patient", "health wellness", "hospital corridor"],
  education: ["classroom", "students learning", "library books", "teacher teaching"],
  technology: ["tech office", "computer lab", "code screen", "modern workspace"],
  "real-estate": ["modern house", "apartment interior", "real estate agent", "property keys"],
  construction: ["construction site", "building architecture", "renovation tools", "blueprint"],
  creative: ["art studio", "design workspace", "photography", "creative tools"],
  travel: ["canary islands travel", "tenerife beach", "vacation travel", "island tourism"],
  other: ["small business", "office space", "team work", "modern building"],
};

/**
 * Main entry: scrape photos for a given business.
 * Priority: Website images > Maps photos > Unsplash fallback
 */
export async function scrapePhotos(
  site: ScrapedSite | null,
  business: BusinessData | null,
  businessType: BusinessType,
  /** Optional business name override (e.g. for Brave Search) */
  businessName?: string,
  /** Optional location override */
  location?: string
): Promise<ScrapedPhoto[]> {
  const photos: ScrapedPhoto[] = [];
  const seen = new Set<string>();

  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  // Phase 1: Download images from scraped website
  if (site) {
    console.log("\n📸 Scraping photos from website...");
    for (const page of site.pages) {
      for (const img of page.images) {
        if (seen.has(img.src)) continue;
        seen.add(img.src);

        try {
          const downloaded = await downloadImage(img.src, img.alt, "website");
          if (downloaded) {
            photos.push(downloaded);
            console.log(`   ✓ Downloaded: ${path.basename(downloaded.localPath)}`);
          }
        } catch {
          // Skip images that fail to download
        }

        if (photos.length >= 6) break; // Max 6 photos total
      }
      if (photos.length >= 6) break;
    }
  }

  // Phase 2: Download Maps photos (when Places API is available)
  if (business && business.photos.length > 0 && photos.length < 6) {
    console.log("\n📸 Downloading Google Maps photos...");
    for (const photoRef of business.photos) {
      if (seen.has(photoRef)) continue;
      seen.add(photoRef);

      try {
        // Maps photo references are returned as resource names
        const photoUrl = `https://places.googleapis.com/v1/${photoRef}/media?key=${process.env.GOOGLE_PLACES_API_KEY}&maxHeightPx=800&maxWidthPx=1200`;
        const downloaded = await downloadImage(photoUrl, business.name, "maps");
        if (downloaded) {
          photos.push(downloaded);
          console.log(`   ✓ Maps photo: ${path.basename(downloaded.localPath)}`);
        }
      } catch {
        // Skip failed downloads
      }

      if (photos.length >= 6) break;
    }
  }

  // Phase 3: Unsplash fallback — fetch business-type-appropriate stock photos
  if (photos.length < 3) {
    console.log("\n📸 Fetching business-type photos from Unsplash...");
    const queries = UNSPLASH_QUERIES[businessType] || UNSPLASH_QUERIES.other;
    const needed = Math.min(6 - photos.length, queries.length);

    for (let i = 0; i < needed; i++) {
      try {
        const unsplashUrl = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(queries[i])}&orientation=landscape`;
        const response = await fetchWithRetry(unsplashUrl, {
          headers: {
            "Accept-Version": "v1",
            // Unsplash requires a client ID even for public access
            "User-Agent": "RakeCMS-Scraper/1.0",
          },
          timeoutMs: 8000,
          maxAttempts: 2,
        });

        if (response.ok) {
          const data = await response.json();
          const imgUrl = data?.urls?.regular || data?.urls?.raw;
          if (imgUrl) {
            const alt = queries[i];
            const downloaded = await downloadImage(imgUrl, alt, "unsplash");
            if (downloaded) {
              photos.push(downloaded);
              console.log(`   ✓ Unsplash: ${alt}`);
            }
          }
        } else {
          // Unsplash API needs registration — use placehold.co as last resort
          const fallbackUrl = `https://placehold.co/800x600/${getPlaceholderColor(businessType)}/white?text=${encodeURIComponent(queries[i])}`;
          const downloaded = await downloadImage(fallbackUrl, queries[i], "unsplash");
          if (downloaded) {
            photos.push(downloaded);
            console.log(`   ✓ Placeholder: ${queries[i]}`);
          }
        }
      } catch {
        // Skip on failure — continue with what we have
      }
    }
  }

  // Phase 4: Brave Search — find real business images from web
  if (photos.length < 3) {
    const braveName = businessName || business?.name || site?.businessName || "";
    const braveLocation = location || business?.city || "";
    console.log("\n🔍 Searching Brave for business images...");
    try {
      const braveImages = await searchBraveImages(braveName, businessType, braveLocation);
      for (const img of braveImages.slice(0, 6 - photos.length)) {
        if (seen.has(img.url)) continue;
        seen.add(img.url);
        try {
          const downloaded = await downloadImage(img.url, img.title || braveName, "website");
          if (downloaded) {
            photos.push(downloaded);
            console.log(`   ✓ Brave image: ${path.basename(downloaded.localPath)}`);
          }
        } catch {
          // Skip failed downloads
        }
        if (photos.length >= 6) break;
      }
    } catch (error) {
      console.log(`   ⚠️ Brave image search: ${(error as Error).message}`);
    }
  }

  console.log(`\n📊 Photos collected: ${photos.length}`);
  return photos;
}

/**
 * Download a single image from a URL and save to local media storage.
 */
async function downloadImage(
  url: string,
  alt: string,
  source: "website" | "maps" | "unsplash"
): Promise<ScrapedPhoto | null> {
  try {
    const response = await fetchWithRetry(url, {
      timeoutMs: 15000,
      maxAttempts: 2,
    });

    if (!response.ok) return null;

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const extRaw = contentType.split("/").pop() || "jpg";
    const ext = extRaw.split(";")[0].trim(); // Strip charset params like "svg+xml; charset=utf-8"
    const buffer = Buffer.from(await response.arrayBuffer());

    if (buffer.length < 100) return null; // Too small to be useful

    const filename = `${source}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = path.join(OUTPUT_DIR, filename);
    await fs.writeFile(filePath, buffer);

    return {
      url,
      localPath: `/media/scraped/${filename}`,
      alt: alt || "Business photo",
      source,
    };
  } catch {
    return null;
  }
}

/**
 * Get a placeholder background color based on business type.
 */
function getPlaceholderColor(businessType: BusinessType): string {
  const colors: Record<BusinessType, string> = {
    restaurant: "dc2626",
    retail: "2563eb",
    service: "0891b2",
    professional: "1e40af",
    healthcare: "0d9488",
    education: "7c3aed",
    technology: "3b82f6",
    "real-estate": "0f766e",
    construction: "d97706",
    creative: "ec4899",
    travel: "0d9488",
    other: "6b7280",
  };
  return colors[businessType] || "3b82f6";
}

/**
 * Get the first photo URL for theme use, or null.
 */
export function getHeroPhoto(photos: ScrapedPhoto[]): string | null {
  if (photos.length === 0) return null;
  // Prefer website-sourced photos for hero
  const website = photos.find((p) => p.source === "website");
  return website?.localPath || photos[0].localPath;
}
