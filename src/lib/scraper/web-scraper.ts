/**
 * Web Scraper — extracts content from an existing website.
 *
 * Fetches the homepage, discovers linked pages (about, services, contact),
 * and extracts: title, meta, headings, paragraphs, images, contact info,
 * color palette from CSS, and business information.
 */

import * as cheerio from "cheerio";

export interface ScrapedPage {
  url: string;
  title: string;
  metaDescription: string;
  headings: { level: number; text: string }[];
  paragraphs: string[];
  images: { src: string; alt: string }[];
  links: { href: string; text: string }[];
  contactInfo: ContactInfo;
}

export interface ScrapedSite {
  homepageUrl: string;
  businessName: string;
  pages: ScrapedPage[];
  colorPalette: string[];
  logoUrl: string | null;
  businessType: BusinessType;
  allText: string;
}

export type BusinessType =
  | "restaurant"
  | "retail"
  | "service"
  | "professional"
  | "healthcare"
  | "education"
  | "technology"
  | "real-estate"
  | "construction"
  | "creative"
  | "other";

export interface ContactInfo {
  phone: string[];
  email: string[];
  address: string[];
  socialLinks: string[];
}

const EMPTY_CONTACT: ContactInfo = {
  phone: [],
  email: [],
  address: [],
  socialLinks: [],
};

/**
 * Extract the likely business name from a website's title tag.
 */
function extractBusinessName(title: string, url: string): string {
  // Try to get the site name from common patterns
  const clean = title
    .replace(/\s*[|–—-]\s*.*$/, "") // "Name | Tagline" → "Name"
    .replace(/\s*«.*$/, "") // "Name « Tagline"
    .replace(/\s*:.*$/, "") // "Name: Page"
    .trim();

  if (clean.length > 2) return clean;

  // Fall back to domain name
  try {
    const hostname = new URL(url).hostname;
    return hostname
      .replace(/^www\./, "")
      .split(".")[0]
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  } catch {
    return "My Business";
  }
}

/**
 * Detect business type from page content.
 */
function detectBusinessType(text: string, url: string): BusinessType {
  const lower = text.toLowerCase();
  const urlLower = url.toLowerCase();

  const signals: Record<BusinessType, string[]> = {
    restaurant: ["restaurant", "menu", "cafe", "bistro", "cuisine", "food", "dining", "eat", "chef", "order online", "reservation", "breakfast", "lunch", "dinner"],
    retail: ["shop", "store", "products", "buy", "shopping", "retail", "ecommerce", "cart", "checkout", "sale", "discount"],
    service: ["service", "repair", "cleaning", "plumbing", "electrical", "maintenance", "support", "help"],
    professional: ["consulting", "consultant", "lawyer", "attorney", "accounting", "tax", "financial", "insurance", "broker", "agency"],
    healthcare: ["clinic", "doctor", "dentist", "medical", "health", "wellness", "hospital", "therapy", "care", "patient"],
    education: ["school", "academy", "course", "training", "learning", "education", "college", "university", "tutor", "class"],
    technology: ["software", "app", "development", "tech", "digital", "it ", "computer", "web", "saas", "platform"],
    "real-estate": ["real estate", "property", "home", "house", "apartment", "rent", "lease", "mortgage", "agent", "realtor"],
    construction: ["construction", "builder", "contractor", "renovation", "remodeling", "roofing", "flooring", "paving"],
    creative: ["design", "photography", "studio", "creative", "art", "portfolio", "graphic", "branding", "media"],
    other: [],
  };

  let bestMatch: BusinessType = "other";
  let maxScore = 0;

  for (const [type, keywords] of Object.entries(signals)) {
    const score = keywords.filter((k) => lower.includes(k)).length;
    if (score > maxScore) {
      maxScore = score;
      bestMatch = type as BusinessType;
    }
  }

  return bestMatch;
}

/**
 * Extract colors from inline styles and common CSS patterns in HTML.
 */
function extractColors($: cheerio.CheerioAPI): string[] {
  const colors = new Set<string>();

  // Look for common Tailwind/Bootstrap color classes and inline styles
  const stylePattern = /(?:background(?:-color)?|color)\s*:\s*(#[a-fA-F0-9]{3,8}|rgba?\([^)]+\))/g;

  $("[style]").each((_, el) => {
    const style = $(el).attr("style") || "";
    const matches = style.matchAll(stylePattern);
    for (const m of matches) {
      colors.add(m[1]);
    }
  });

  // Look for CSS variables
  $("style").each((_, el) => {
    const css = $(el).html() || "";
    const varMatches = css.matchAll(/--[\w-]+\s*:\s*(#[a-fA-F0-9]{3,8})/g);
    for (const m of varMatches) {
      colors.add(m[1]);
    }
  });

  // Look for meta theme-color
  $('meta[name="theme-color"]').each((_, el) => {
    const color = $(el).attr("content");
    if (color) colors.add(color);
  });

  return Array.from(colors).slice(0, 6);
}

/**
 * Extract contact info: phone, email, address, social links.
 */
function extractContactInfo($: cheerio.CheerioAPI): ContactInfo {
  const phone: string[] = [];
  const email: string[] = [];
  const address: string[] = [];
  const socialLinks: string[] = [];

  const phonePattern = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g;
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const socialDomains = ["facebook.com", "instagram.com", "twitter.com", "x.com", "linkedin.com", "youtube.com", "tiktok.com", "pinterest.com"];

  // Phone from text
  const bodyText = $("body").text();
  const phoneMatches = bodyText.match(phonePattern);
  if (phoneMatches) phone.push(...phoneMatches.slice(0, 3));

  // Email from mailto links
  $('a[href^="mailto:"]').each((_, el) => {
    const href = $(el).attr("href") || "";
    email.push(href.replace("mailto:", ""));
  });

  // Email from text
  const emailMatches = bodyText.match(emailPattern);
  if (emailMatches) email.push(...emailMatches.slice(0, 3));

  // Social links
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    const lower = href.toLowerCase();
    for (const domain of socialDomains) {
      if (lower.includes(domain)) {
        socialLinks.push(href);
        break;
      }
    }
  });

  // Address from text patterns
  const addressPatterns = [
    /\d+\s+[A-Za-z\s,]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Court|Ct|Way|Place|Pl)\b/i,
    /(?:P\.?O\.?\s+Box\s+\d+)/i,
  ];
  for (const pattern of addressPatterns) {
    const match = bodyText.match(pattern);
    if (match) address.push(match[0]);
  }

  return {
    phone: [...new Set(phone)],
    email: [...new Set(email)],
    address: [...new Set(address)],
    socialLinks: [...new Set(socialLinks)],
  };
}

/**
 * Determine relevant pages to scrape based on nav links.
 */
function discoverPages($: cheerio.CheerioAPI, baseUrl: string): string[] {
  const keywords = ["about", "service", "contact", "product", "portfolio", "gallery", "menu", "team", "faq", "pricing", "blog", "review", "testimonial"];
  const urls = new Set<string>();
  urls.add(baseUrl); // Always scrape homepage

  $("nav a, header a, .menu a, .nav a, ul a").each((_, el) => {
    const href = $(el).attr("href") || "";
    try {
      const fullUrl = new URL(href, baseUrl).href;
      const path = fullUrl.replace(baseUrl, "").toLowerCase();

      // Only include same-domain, meaningful paths
      if (
        fullUrl.startsWith(baseUrl) &&
        keywords.some((k) => path.includes(k)) &&
        !path.includes("#") &&
        !path.match(/\.(pdf|zip|jpg|png|gif)$/)
      ) {
        urls.add(fullUrl);
      }
    } catch {
      // Invalid URL, skip
    }
  });

  return Array.from(urls).slice(0, 8); // Max 8 pages
}

/**
 * Scrape a single page URL.
 */
async function scrapePage(url: string): Promise<ScrapedPage> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; RakeCMS-Scraper/1.0)",
      Accept: "text/html",
    },
    signal: AbortSignal.timeout(10000),
  });

  const html = await response.text();
  const $ = cheerio.load(html);

  const title = $("title").text().trim();
  const metaDescription = $('meta[name="description"]').attr("content") || "";
  const headings: { level: number; text: string }[] = [];

  for (let level = 1; level <= 6; level++) {
    $(`h${level}`).each((_, el) => {
      const text = $(el).text().trim();
      if (text) headings.push({ level, text });
    });
  }

  const paragraphs: string[] = [];
  $("p").each((_, el) => {
    const text = $(el).text().trim();
    if (text.length > 20) paragraphs.push(text);
  });

  const images: { src: string; alt: string }[] = [];
  $("img[src]").each((_, el) => {
    const src = $(el).attr("src") || "";
    const alt = $(el).attr("alt") || "";
    if (src && !src.includes("logo") && !src.includes("icon") && !src.includes("svg")) {
      try {
        images.push({ src: new URL(src, url).href, alt });
      } catch {
        // Skip invalid URLs
      }
    }
  });

  const links: { href: string; text: string }[] = [];
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    const text = $(el).text().trim();
    if (href && text) links.push({ href, text });
  });

  return {
    url,
    title,
    metaDescription,
    headings,
    paragraphs,
    images: images.slice(0, 20),
    links,
    contactInfo: extractContactInfo($),
  };
}

/**
 * Main scrape function — crawls a website and returns structured data.
 */
export async function scrapeWebsite(url: string): Promise<ScrapedSite> {
  // Normalize URL
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }
  const baseUrl = url.replace(/\/$/, "");

  console.log(`\n🌐 Scraping website: ${baseUrl}`);

  // Fetch homepage first to discover other pages
  const homepage = await scrapePage(baseUrl);
  console.log(`   Homepage: "${homepage.title}"`);

  // Discover linked pages
  const $ = cheerio.load(await fetch(baseUrl, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; RakeCMS-Scraper/1.0)" },
    signal: AbortSignal.timeout(10000),
  }).then((r) => r.text()));

  const pageUrls = discoverPages($, baseUrl).filter((u) => u !== baseUrl);
  console.log(`   Discovered ${pageUrls.length} additional pages`);

  // Scrape discovered pages
  const pageResults = await Promise.allSettled(
    pageUrls.map((u) => scrapePage(u))
  );

  const pages = [homepage];
  for (const result of pageResults) {
    if (result.status === "fulfilled") {
      pages.push(result.value);
      console.log(`   ✓ ${new URL(result.value.url).pathname}`);
    }
  }

  const allText = pages.map((p) => p.paragraphs.join(" ")).join(" ");

  const scraped: ScrapedSite = {
    homepageUrl: baseUrl,
    businessName: extractBusinessName(homepage.title, baseUrl),
    pages,
    colorPalette: extractColors($),
    logoUrl: extractLogo($, baseUrl),
    businessType: detectBusinessType(allText, baseUrl),
    allText,
  };

  console.log(`\n📊 Summary:`);
  console.log(`   Business: ${scraped.businessName}`);
  console.log(`   Type: ${scraped.businessType}`);
  console.log(`   Pages: ${scraped.pages.length}`);
  console.log(`   Colors: ${scraped.colorPalette.length > 0 ? scraped.colorPalette.join(", ") : "auto"}`);
  console.log(`   Contact: ${scraped.pages[0].contactInfo.email.length > 0 ? "✓" : "—"}`);
  console.log(`   Social: ${scraped.pages[0].contactInfo.socialLinks.length > 0 ? "✓" : "—"}`);

  return scraped;
}

/**
 * Extract logo URL from a page.
 */
function extractLogo($: cheerio.CheerioAPI, baseUrl: string): string | null {
  // Check for logo images in common locations
  const logoSelectors = [
    'img[alt*="logo" i]',
    '.logo img',
    '#logo img',
    '.site-logo img',
    '.navbar-brand img',
    'header img[src*="logo"]',
  ];

  for (const selector of logoSelectors) {
    const img = $(selector).first().attr("src");
    if (img) {
      try {
        return new URL(img, baseUrl).href;
      } catch {
        return img;
      }
    }
  }

  return null;
}
