/**
 * Brave Search Scraper — enriches business data via Brave Search API.
 *
 * Uses Brave Search to discover:
 *  - Images of the business (from TripAdvisor, Google, Yelp, social media, etc.)
 *  - Reviews and ratings from multiple sources
 *  - Business descriptions and content when no website is available
 *
 * This is especially useful for businesses with no website but lots of
 * online presence — restaurants, hotels, shops, etc.
 *
 * Requires BRAVE_SEARCH_API_KEY in environment.
 * Free tier: https://brave.com/search/api/
 */

import { fetchWithRetry } from "@/lib/reliability/retry";

// ─── Types ───────────────────────────────────────────────────────

export interface BraveReviewResult {
  source: string;           // e.g. "TripAdvisor", "Yelp", "Google Reviews"
  sourceUrl: string;
  rating: number | null;
  snippet: string;
}

export interface BraveImageResult {
  url: string;
  title: string;
  source: string;           // e.g. "google", "tripadvisor", "yelp", "instagram"
}

export interface BraveSearchResult {
  description: string;          // Best-effort business description
  snippets: string[];           // Content snippets from various sources
  images: BraveImageResult[];   // Up to 10 candidate images
  reviews: BraveReviewResult[]; // Up to 10 review snippets
  socialLinks: string[];        // Discovered social profiles
  businessTypeHints: string[];  // Keywords suggesting business type
}

// ─── API callers ─────────────────────────────────────────────────

const BRAVE_API_BASE = "https://api.search.brave.com/res/v1";

/**
 * Get the Brave Search API key from environment.
 */
function getApiKey(): string | null {
  return process.env.BRAVE_SEARCH_API_KEY || null;
}

/**
 * Search the web via Brave Search API.
 */
async function braveWebSearch(
  query: string,
  count: number = 10
): Promise<any[]> {
  const apiKey = getApiKey();
  if (!apiKey) return [];

  const url = `${BRAVE_API_BASE}/web/search?q=${encodeURIComponent(query)}&count=${count}&safesearch=off`;

  try {
    const response = await fetchWithRetry(url, {
      headers: {
        "Accept": "application/json",
        "Accept-Encoding": "gzip",
        "X-Subscription-Token": apiKey,
      },
      timeoutMs: 10000,
      maxAttempts: 2,
    });

    if (!response.ok) {
      console.log(`   ⚠️  Brave Web Search returned ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data.web?.results || [];
  } catch (error) {
    console.log(`   ⚠️  Brave Web Search error: ${(error as Error).message}`);
    return [];
  }
}

/**
 * Search images via Brave Image Search API.
 */
async function braveImageSearch(
  query: string,
  count: number = 10
): Promise<any[]> {
  const apiKey = getApiKey();
  if (!apiKey) return [];

  const url = `${BRAVE_API_BASE}/images/search?q=${encodeURIComponent(query)}&count=${count}&safesearch=off`;

  try {
    const response = await fetchWithRetry(url, {
      headers: {
        "Accept": "application/json",
        "Accept-Encoding": "gzip",
        "X-Subscription-Token": apiKey,
      },
      timeoutMs: 10000,
      maxAttempts: 2,
    });

    if (!response.ok) {
      console.log(`   ⚠️  Brave Image Search returned ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data.images?.results || [];
  } catch (error) {
    console.log(`   ⚠️  Brave Image Search error: ${(error as Error).message}`);
    return [];
  }
}

/**
 * Categorise a URL's source for attribution.
 */
function categoriseSource(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes("tripadvisor") || lower.includes("tripadvisor")) return "TripAdvisor";
  if (lower.includes("yelp")) return "Yelp";
  if (lower.includes("google") && (lower.includes("maps") || lower.includes("reviews") || lower.includes("business"))) return "Google";
  if (lower.includes("facebook.com")) return "Facebook";
  if (lower.includes("instagram.com")) return "Instagram";
  if (lower.includes("twitter.com") || lower.includes("x.com")) return "X/Twitter";
  if (lower.includes("linkedin.com")) return "LinkedIn";
  if (lower.includes("booking.com") || lower.includes("booking")) return "Booking.com";
  if (lower.includes("justeat") || lower.includes("ubereats") || lower.includes("deliveroo")) return "Food Delivery";
  if (lower.includes("thefork") || lower.includes("tripadvisor")) return "TripAdvisor";
  if (lower.includes("pinterest")) return "Pinterest";
  if (lower.includes("tiktok")) return "TikTok";
  return "Web";
}

/**
 * Extract a rating from a search result snippet or title.
 */
function extractRating(text: string): number | null {
  if (!text) return null;
  // Match patterns like "4.5/5", "4.2 stars", "Rating: 4.5"
  const starMatch = text.match(/(\d+(?:\.\d+)?)\s*[\/★☆]\s*5/);
  if (starMatch) {
    const val = parseFloat(starMatch[1]);
    if (val >= 1 && val <= 5) return val;
  }
  const wordMatch = text.match(/(\d+(?:\.\d+)?)\s*star/i);
  if (wordMatch) {
    const val = parseFloat(wordMatch[1]);
    if (val >= 1 && val <= 5) return val;
  }
  return null;
}

/**
 * Check if a result looks like a review page.
 */
function isReviewSource(url: string, title: string, snippet: string): boolean {
  const lower = `${url} ${title} ${snippet}`.toLowerCase();
  const reviewKeywords = [
    "review", "reviews", "rating", "ranked", "opiniones", "reseñas",
    "valoración", "testimonials", "testimonios",
  ];
  const sourceKeywords = [
    "tripadvisor", "yelp", "google.com/maps", "google.com/travel",
    "booking.com", "thefork", "justeat", "trustpilot",
  ];
  return (
    reviewKeywords.some((kw) => lower.includes(kw)) ||
    sourceKeywords.some((kw) => lower.includes(kw))
  );
}

// ─── Search multiple queries in parallel ─────────────────────────

const REVIEW_SOURCES = [
  "TripAdvisor", "Yelp", "Google Reviews", "Booking.com",
  "TheFork", "Trustpilot",
];

/**
 * Run multiple Brave searches in parallel for a given business.
 * Queries are designed to capture different angles:
 *  1. General business info
 *  2. Images (via image search)
 *  3. Reviews (via targeted queries)
 */
export async function searchBusinessWithBrave(
  businessName: string,
  location?: string,
  businessType?: string
): Promise<BraveSearchResult> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.log("\n🔍 Brave Search API key not set — skipping Brave enrichment.");
    console.log("   Set BRAVE_SEARCH_API_KEY in .env for richer results.");
    return emptyResult();
  }

  const loc = location ? ` ${location}` : "";
  const typeHint = businessType ? ` ${businessType}` : "";

  console.log(`\n🔍 Searching Brave for: "${businessName}"${loc}`);

  // Run searches in parallel
  const [
    infoResults,
    imageResults,
    reviewResults,
    specificImageResults,
  ] = await Promise.all([
    // 1. General business info query
    braveWebSearch(`${businessName}${loc}${typeHint} business`),

    // 2. Images: search the business name directly
    braveImageSearch(`${businessName}${loc}`),

    // 3. Reviews: search explicitly for reviews
    braveWebSearch(`${businessName}${loc} reviews ratings`),

    // 4. More specific image search for food/menu/venue photos
    braveImageSearch(`${businessName}${loc} photos`),
  ]);

  // Process info results for description and snippets
  const allResults = [...infoResults, ...reviewResults];
  const snippets: string[] = [];
  let description = "";

  for (const result of allResults.slice(0, 15)) {
    const snippet = result.description || result.snippet || "";
    if (snippet && snippet.length > 40) {
      snippets.push(snippet);
    }
    // Use the first substantial description
    if (!description && snippet.length > 100) {
      description = snippet;
    }
  }

  // Process reviews
  const reviews: BraveReviewResult[] = [];
  const seenUrls = new Set<string>();
  const reviewSourceDomains = [
    "tripadvisor", "yelp", "google.com/maps", "booking.com",
    "thefork", "trustpilot", "justeat", "doordash", "opentable",
  ];

  for (const result of allResults) {
    const url = result.url || "";
    const title = result.title || "";
    const snippet = result.description || result.snippet || "";

    if (seenUrls.has(url)) continue;
    seenUrls.add(url);

    const source = categoriseSource(url);
    const rating = extractRating(`${title} ${snippet}`);

    // Check if this is review-related
    if (isReviewSource(url, title, snippet) || reviewSourceDomains.some((d) => url.includes(d))) {
      reviews.push({
        source,
        sourceUrl: url,
        rating,
        snippet: snippet.substring(0, 300),
      });
    } else if (rating !== null) {
      // Has a rating but not explicitly a review page — still include
      reviews.push({
        source,
        sourceUrl: url,
        rating,
        snippet: snippet.substring(0, 300),
      });
    }
  }

  // Process images
  const images: BraveImageResult[] = [];
  const seenImageUrls = new Set<string>();
  const allImages = [...imageResults, ...specificImageResults];

  for (const img of allImages) {
    const url = img.url || img.thumbnail?.src || "";
    if (!url || seenImageUrls.has(url)) continue;
    seenImageUrls.add(url);

    images.push({
      url,
      title: img.title || "",
      source: categoriseSource(url),
    });

    if (images.length >= 10) break; // Max 10 images
  }

  // Extract social links
  const socialLinks: string[] = [];
  const socialDomains = [
    "facebook.com", "instagram.com", "twitter.com", "x.com",
    "linkedin.com", "tiktok.com", "youtube.com", "pinterest.com",
  ];
  for (const result of allResults) {
    const url = result.url || "";
    if (socialDomains.some((d) => url.includes(d))) {
      socialLinks.push(url);
    }
  }

  // Extract business type hints
  const businessTypeHints: string[] = [];
  const typeKeywords: Record<string, string[]> = {
    restaurant: ["restaurant", "menu", "bistro", "cafe", "cuisine", "dining", "food"],
    retail: ["shop", "store", "boutique", "retail"],
    travel: ["travel", "hotel", "tour", "excursion", "holiday"],
    healthcare: ["clinic", "doctor", "dental", "medical"],
    service: ["salon", "spa", "repair", "cleaning", "service"],
    education: ["school", "academy", "course", "training"],
    creative: ["studio", "photography", "design", "art"],
    professional: ["consulting", "lawyer", "accounting", "insurance"],
    construction: ["construction", "contractor", "renovation"],
    technology: ["software", "tech", "digital", "it "],
  };

  const combinedText = snippets.join(" ").toLowerCase();
  for (const [type, keywords] of Object.entries(typeKeywords)) {
    if (keywords.some((kw) => combinedText.includes(kw))) {
      businessTypeHints.push(type);
    }
  }

  // Deduplicate reviews by source
  const dedupedReviews: BraveReviewResult[] = [];
  const seenSource = new Set<string>();
  for (const r of reviews) {
    const key = r.source.toLowerCase();
    if (seenSource.has(key)) continue;
    seenSource.add(key);
    dedupedReviews.push(r);
  }

  const result: BraveSearchResult = {
    description,
    snippets: [...new Set(snippets)].slice(0, 20),
    images: images.slice(0, 10),
    reviews: dedupedReviews.slice(0, 10),
    socialLinks: [...new Set(socialLinks)],
    businessTypeHints: [...new Set(businessTypeHints)].slice(0, 5),
  };

  // Log summary
  console.log(`   📝 ${result.snippets.length} text snippets found`);
  console.log(`   🖼️  ${result.images.length} images found`);
  console.log(`   ⭐ ${result.reviews.length} review sources found`);
  if (result.socialLinks.length > 0) {
    console.log(`   🔗 Social media: ${result.socialLinks.map((l) => categoriseSource(l)).filter(Boolean).join(", ")}`);
  }

  return result;
}

/**
 * Generate targeted search queries for images based on business type.
 */
function getImageSearchQueries(
  businessName: string,
  businessType: string,
  location?: string
): string[] {
  const loc = location ? ` ${location}` : "";
  const base = `${businessName}${loc}`;

  const industryQueries: Record<string, string[]> = {
    restaurant: [
      base,
      `${businessName}${loc} food dishes`,
      `${businessName}${loc} interior dining`,
      `${businessName}${loc} menu`,
    ],
    travel: [
      base,
      `${businessName}${loc} tourist attraction`,
      `${businessName}${loc} excursions`,
    ],
    retail: [
      base,
      `${businessName}${loc} products`,
      `${businessName}${loc} store`,
    ],
    healthcare: [
      base,
      `${businessName}${loc} clinic`,
    ],
    service: [
      base,
      `${businessName}${loc} workspace`,
    ],
    creative: [
      base,
      `${businessName}${loc} portfolio`,
    ],
  };

  return industryQueries[businessType] || [base, `${businessName}${loc} photos`];
}

/**
 * Run targeted image searches specifically for the business type.
 */
export async function searchBraveImages(
  businessName: string,
  businessType: string,
  location?: string
): Promise<BraveImageResult[]> {
  const apiKey = getApiKey();
  if (!apiKey) return [];

  const queries = getImageSearchQueries(businessName, businessType, location);
  const allImages: BraveImageResult[] = [];
  const seen = new Set<string>();

  for (const query of queries) {
    const results = await braveImageSearch(query, 5);
    for (const img of results) {
      const url = img.url || img.thumbnail?.src || "";
      if (!url || seen.has(url)) continue;
      seen.add(url);
      allImages.push({
        url,
        title: img.title || "",
        source: categoriseSource(url),
      });
      if (allImages.length >= 6) break;
    }
    if (allImages.length >= 6) break;
  }

  return allImages;
}

function emptyResult(): BraveSearchResult {
  return {
    description: "",
    snippets: [],
    images: [],
    reviews: [],
    socialLinks: [],
    businessTypeHints: [],
  };
}
