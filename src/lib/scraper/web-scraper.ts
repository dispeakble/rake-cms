/**
 * Web Scraper — extracts content from an existing website.
 *
 * Fetches the homepage, discovers linked pages (about, services, contact),
 * and extracts: title, meta, headings, paragraphs, images, contact info,
 * color palette from CSS, business information, carousel slides,
 * nav links (including external), footer text, language versions,
 * and all images with type classification.
 */

import * as cheerio from "cheerio";
import type { Element } from "domhandler";
import { fetchWithRetry } from "@/lib/reliability/retry";
import { scrapeUrlSchema, sanitizeScrapedContent } from "@/lib/security/validation";
import { scraperLimiter } from "@/lib/security/rate-limiter";

export interface ScrapedPage {
  url: string;
  title: string;
  metaDescription: string;
  headings: { level: number; text: string }[];
  paragraphs: string[];
  images: { src: string; alt: string }[];
  links: { href: string; text: string }[];
  contactInfo: ContactInfo;
  /** Carousel/slider slides — images (from background-image or <img>) plus caption text */
  carousel: { src: string; caption: string }[];
  /** Concatenated text content from <footer> element */
  footerText: string;
  /** Anchor links found inside nav, header, and footer elements */
  externalLinks: { href: string; text: string }[];
  /** Language-switcher links (from lang dropdowns or hreflang attributes) */
  languageLinks: { href: string; lang: string; label: string }[];
}

export interface ScrapedSite {
  homepageUrl: string;
  businessName: string;
  pages: ScrapedPage[];
  colorPalette: string[];
  logoUrl: string | null;
  businessType: BusinessType;
  allText: string;
  /** Language codes detected across pages (e.g. ["en", "es", "fr"]) */
  languages: string[];
  /** Every image found across all pages, classified by role/type */
  allImages: { src: string; alt: string; type: string }[];
  /** Per-language scraped text content keyed by language code */
  languageContent?: Record<string, {
    paragraphs: string[];
    headings: { level: number; text: string }[];
    heroTagline?: string;
    heroSubtitle?: string;
    aboutHeading?: string;
    services: { title: string; description: string }[];
    tagline?: string;
    footerText?: string;
    contactTagline?: string;
  }>;
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
  | "travel"
  | "fitness"
  | "beauty"
  | "automotive"
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
    restaurant: ["restaurant", "menu", "cafe", "bistro", "cuisine", "food", "dining", "eat", "chef", "order online", "reservation", "breakfast", "lunch", "dinner", "churrascaria", "churrasco", "rodizio", "grill", "steakhouse", "bbq", "barbecue", "tapas", "pizza", "pasta", "sushi", "brunch"],
    retail: ["shop", "store", "products", "buy", "shopping", "retail", "ecommerce", "cart", "checkout", "sale", "discount"],
    service: ["service", "repair", "cleaning", "plumbing", "electrical", "maintenance", "support", "help"],
    professional: ["consulting", "consultant", "lawyer", "attorney", "accounting", "tax", "financial", "insurance", "broker", "agency"],
    healthcare: ["clinic", "doctor", "dentist", "medical", "health", "wellness", "hospital", "therapy", "care", "patient"],
    education: ["school", "academy", "course", "training", "learning", "education", "college", "university", "tutor", "class"],
    technology: ["software", "app", "development", "tech", "digital", "it ", "computer", "web", "saas", "platform"],
    "real-estate": ["real estate", "property", "home", "house", "apartment", "rent", "lease", "mortgage", "agent", "realtor"],
    construction: ["construction", "builder", "contractor", "renovation", "remodeling", "roofing", "flooring", "paving"],
    creative: ["design", "photography", "studio", "creative", "art", "portfolio", "graphic", "branding", "media"],
    travel: ["travel", "viajes", "viaje", "turismo", "tour", "excursion", "vacation", "holiday", "cruise", "trips", "b2b", "canary islands", "canarias", "tenerife", "gran canaria"],
    fitness: ["gym", "fitness", "workout", "training", "exercise", "personal trainer", "crossfit", "yoga", "pilates", "bodybuilding", "cardio", "strength"],
    beauty: ["salon", "beauty", "hair", "nails", "spa", "cosmetic", "makeup", "skincare", "barber", "stylist", "lash", "massage"],
    automotive: ["auto", "car", "vehicle", "mechanic", "garage", "repair", "tire", "dealership", "automotive", "service center", "body shop", "motors"],
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

  const phonePattern = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,6}/g;
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const socialDomains = ["facebook.com", "instagram.com", "twitter.com", "x.com", "linkedin.com", "youtube.com", "tiktok.com", "pinterest.com"];

  // Phone from text
  const bodyText = $("body").text();
  const phoneMatches = bodyText.match(phonePattern);
  if (phoneMatches) {
    // Filter out non-phone numbers (CIF, bank numbers, dates, etc.)
    const cleanPhones = phoneMatches.filter(n => {
      const digits = n.replace(/[^\d]/g, "");
      // Must be 7-15 digits
      if (digits.length < 7 || digits.length > 15) return false;
      // Exclude bare 8-digit numbers (CIF/bank account numbers)
      if (digits.length === 8 && !n.includes("+") && !n.includes("(") && !n.includes("-")) return false;
      // Must start with area/country code or have formatting (+, -, parens)
      if (digits.length >= 7 && digits.length <= 9 && !n.match(/[+(\-]/)) return false;
      return true;
    });
    phone.push(...cleanPhones.slice(0, 3));
  }

  // Email from mailto links — clean http:// prefix if present
  const mailtoEmails: string[] = [];
  $('a[href^="mailto:"]').each((_, el) => {
    const href = $(el).attr("href") || "";
    let extracted = href.replace("mailto:", "");
    // Some sites accidentally include http:// in mailto hrefs
    extracted = extracted.replace(/^https?:\/\//i, "");
    mailtoEmails.push(extracted);
  });

  // Email from text — prefer these over mailto (cleaner)
  const textEmails = bodyText.match(emailPattern);
  if (textEmails) {
    // Remove http:// prefix from any text email too
    const cleanTextEmails = textEmails.map(e => e.replace(/^https?:\/\//i, ""));
    email.push(...cleanTextEmails.slice(0, 3));
  }
  // Append mailto emails only if not already found via body text
  for (const m of mailtoEmails) {
    if (!email.includes(m)) email.push(m);
  }

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

  // Address from text patterns — supports Spanish, English, and EU formats
  // PRIORITY 1: Look for explicit "Dirección:" labels in the HTML for exact match
  $("*").each((_, el) => {
    const html = $(el).html() || "";
    const dirMatch = html.match(/Dirección:\s*<\/[^>]+>\s*([^<]+)/i);
    if (dirMatch) {
      const fullAddr = dirMatch[1].trim();
      if (fullAddr.length > 10 && !address.some(a => fullAddr.includes(a))) {
        address.push(fullAddr);
      }
    }
  });

  // PRIORITY 2: English-style address patterns
  if (address.length === 0) {
    const addressPatterns = [
      /\d+\s+[A-Za-zÀ-ÿ\s,]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Court|Ct|Way|Place|Pl)\b/i,
      /(?:P\.?O\.?\s+Box\s+\d+)/i,
    ];
    for (const pattern of addressPatterns) {
      const match = bodyText.match(pattern);
      if (match) address.push(match[0]);
    }
  }

  // PRIORITY 3: Spanish address patterns on body text
  if (address.length === 0) {
    const spanishPatterns = [
      /Calle\s+[A-Za-zÀ-ÿ\s,.]+(?:\d{1,5})?/i,
      /C\.\s*C\.\s+[A-Za-zÀ-ÿ\s,.]+/i,
      /(?:Avenida|Avda|Av\.)\s+[A-Za-zÀ-ÿ\s,.]+/i,
    ];
    for (const pattern of spanishPatterns) {
      const match = bodyText.match(pattern);
      if (match) address.push(match[0]);
    }
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
 * Determine the role/type of an image based on its attributes and context.
 */
function classifyImage($el: cheerio.Cheerio<Element>, $: cheerio.CheerioAPI): string {
  const src = $el.attr("src") || "";
  const alt = $el.attr("alt") || "";
  const srcLower = src.toLowerCase();
  const altLower = alt.toLowerCase();
  const classes = ($el.attr("class") || "").toLowerCase();
  const parentClasses = ($el.parent().attr("class") || "").toLowerCase();

  // Carousel / slider images
  if (
    classes.includes("carousel") ||
    classes.includes("slide") ||
    parentClasses.includes("carousel") ||
    parentClasses.includes("slide") ||
    classes.includes("slick") ||
    parentClasses.includes("slick")
  ) {
    return "carousel";
  }

  // Logo images
  if (
    srcLower.includes("logo") ||
    altLower.includes("logo") ||
    classes.includes("logo") ||
    classes.includes("brand") ||
    parentClasses.includes("logo") ||
    parentClasses.includes("brand")
  ) {
    return "logo";
  }

  // Icon images (small decorative)
  if (
    srcLower.includes("icon") ||
    classes.includes("icon") ||
    parentClasses.includes("icon") ||
    classes.includes("glyphicon") ||
    parentClasses.includes("glyphicon")
  ) {
    return "icon";
  }

  // Hero / banner images
  if (
    classes.includes("hero") ||
    classes.includes("banner") ||
    parentClasses.includes("hero") ||
    parentClasses.includes("banner")
  ) {
    return "hero";
  }

  // Social / sharing icons
  if (
    srcLower.includes("social") ||
    altLower.includes("social") ||
    classes.includes("social") ||
    parentClasses.includes("social")
  ) {
    return "social";
  }

  // Thumbnail images
  if (
    classes.includes("thumb") ||
    classes.includes("thumbnail") ||
    parentClasses.includes("thumb") ||
    parentClasses.includes("thumbnail")
  ) {
    return "thumbnail";
  }

  // Background / decorative
  if (classes.includes("bg") || classes.includes("background") || parentClasses.includes("bg")) {
    return "background";
  }

  return "content";
}

/**
 * Extract carousel/slider slides from a page.
 * Looks for common carousel frameworks (Bootstrap, Slick, Swiper, custom).
 */
function extractCarousel($: cheerio.CheerioAPI, baseUrl: string): { src: string; caption: string }[] {
  const slides: { src: string; caption: string }[] = [];

  // 1. Try Bootstrap carousel items
  $(".carousel-item, .carousel .item, [class*=\"carousel-item\"], [class*=\"slide-item\"]").each((_, el) => {
    const $el = $(el);
    let src = "";

    // Check for background-image style
    const style = $el.attr("style") || "";
    const bgMatch = style.match(/background(?:-image)?\s*:\s*url\(['"]?([^'")\s]+)['"]?\)/i);
    if (bgMatch) {
      src = bgMatch[1];
    }

    // Fall back to <img> child
    if (!src) {
      const img = $el.find("img").first();
      src = img.attr("src") || img.attr("data-src") || img.attr("data-lazy-src") || "";
    }

    // Get caption from h1/h2/p within the item, or alt text on img
    let caption = "";
    const heading = $el.find("h1, h2, h3, .carousel-caption h1, .carousel-caption h2, .carousel-caption h3, .slider-caption, .slide-title, [class*=\"caption\"]").first();
    caption = heading.text().trim();
    if (!caption) {
      const img = $el.find("img").first();
      caption = img.attr("alt") || "";
    }

    if (src) {
      try {
        src = new URL(src, baseUrl).href;
      } catch { /* keep as-is */ }
      slides.push({ src, caption });
    }
  });

	  // 4. Rake CMS / Next.js carousel with AnimatePresence (framer-motion)
	  //    Looks for elements with background-image in hero sections that have slide nav buttons
	  if (slides.length === 0) {
	    const $sections = $("section, div[class*=hero], div[class*=slider]");
	    $sections.each((_, section) => {
	      const $section = $(section);
	      const hasPrevBtn = $section.find('button[aria-label*="Previous" i], button[aria-label*="prev" i]').length > 0;
	      const hasNextBtn = $section.find('button[aria-label*="Next" i], button[aria-label*="next" i]').length > 0;
	      const hasDots = $section.find('button[aria-label*="slide" i]').length > 0;
	      if (!hasPrevBtn && !hasNextBtn && !hasDots) return;

	      $section.children().each((_, el) => {
	        const $el = $(el);
	        const style = $el.attr("style") || "";
	        const bgMatch = style.match(/background(?:-image)?\s*:\s*url\(['"]?([^'")\s]+)['"]?\)/i);
	        if (bgMatch) {
	          let src = bgMatch[1];
	          try { src = new URL(src, baseUrl).href; } catch { /* keep as-is */ }
	          let caption = "";
	          const heading = $section.find("h1, h2, h3, .badge, [class*=badge], [class*=caption]").first();
	          caption = heading.text().trim();
	          slides.push({ src, caption });
	        }
	      });
	    });
	  }
  // 2. Try generic slider patterns (Slick, Swiper, Owl, custom)
  if (slides.length === 0) {
    $(".slick-slide, .swiper-slide, .owl-item, .slide, [class*=\"slideshow\"] > *, [class*=\"slider\"] > *").each((_, el) => {
      const $el = $(el);
      // Skip clones/clones used by Slick for infinite loop
      if ($el.hasClass("slick-cloned")) return;

      let src = "";
      const style = $el.attr("style") || "";
      const bgMatch = style.match(/background(?:-image)?\s*:\s*url\(['"]?([^'")\s]+)['"]?\)/i);
      if (bgMatch) {
        src = bgMatch[1];
      }

      if (!src) {
        const img = $el.find("img").first();
        src = img.attr("src") || img.attr("data-src") || img.attr("data-lazy-src") || "";
      }

      let caption = "";
      const heading = $el.find("h1, h2, h3, h4, .caption, [class*=\"title\"]").first();
      caption = heading.text().trim();
      if (!caption) {
        const img = $el.find("img").first();
        caption = img.attr("alt") || "";
      }

      if (src) {
        try {
          src = new URL(src, baseUrl).href;
        } catch { /* keep as-is */ }
        slides.push({ src, caption });
      }
    });
  }

  // 3. As a last resort, look for elements with background-image inside known slider wrappers
  if (slides.length === 0) {
    $(".hero, .banner, [class*=\"hero\"], [class*=\"banner\"]").each((_, el) => {
      const $el = $(el);
      const style = $el.attr("style") || "";
      const bgMatch = style.match(/background(?:-image)?\s*:\s*url\(['"]?([^'")\s]+)['"]?\)/i);
      if (bgMatch) {
        let src = bgMatch[1];
        try {
          src = new URL(src, baseUrl).href;
        } catch { /* keep as-is */ }
        let caption = $el.find("h1, h2, .hero-title, .banner-title").first().text().trim();
        slides.push({ src, caption });
      }
    });
  }

  return slides.slice(0, 15);
}

/**
 * Extract ALL anchor links from nav, header, and footer elements.
 */
function extractExternalLinks($: cheerio.CheerioAPI, baseUrl: string): { href: string; text: string }[] {
  const links: { href: string; text: string }[] = [];
  const seen = new Set<string>();

  // Look inside nav, header, footer, and any element with nav-related classes
  $("nav a[href], header a[href], footer a[href], .navbar a[href], .nav-menu a[href], .navigation a[href], [role=\"navigation\"] a[href], .header a[href], .top-bar a[href]").each((_, el) => {
    const href = ($(el).attr("href") || "").trim();
    const text = $(el).text().trim();

    if (!href || href === "#" || href.startsWith("javascript:")) return;
    if (!text) return;

    // Resolve relative URLs
    let resolvedHref = href;
    try {
      resolvedHref = new URL(href, baseUrl).href;
    } catch {
      // Keep original if resolution fails
    }

    const key = resolvedHref + "|" + text;
    if (seen.has(key)) return;
    seen.add(key);

    links.push({ href: resolvedHref, text });
  });

  return links;
}

/**
 * Extract language-switcher links from the page.
 * Looks for hreflang attributes, lang dropdowns, and language selector patterns.
 */
function extractLanguageLinks($: cheerio.CheerioAPI, baseUrl: string): { href: string; lang: string; label: string }[] {
  const links: { href: string; lang: string; label: string }[] = [];
  const seen = new Set<string>();

  // 1. Look for <link> tags with hreflang (alternate language versions)
  $('link[rel="alternate"][hreflang]').each((_, el) => {
    const href = $(el).attr("href") || "";
    const lang = $(el).attr("hreflang") || "";
    if (!href || !lang || lang === "x-default") return;

    let resolvedHref = href;
    try {
      resolvedHref = new URL(href, baseUrl).href;
    } catch { /* keep as-is */ }

    const key = resolvedHref + "|" + lang;
    if (seen.has(key)) return;
    seen.add(key);

    links.push({ href: resolvedHref, lang, label: lang });
  });

  // 2. Look for language switcher dropdown menus and links
  $(
    '[class*="language"] a[href], [class*="lang"] a[href], ' +
    '[class*="language"] [class*="dropdown-item"], [class*="lang"] [class*="dropdown-item"], ' +
    '[class*="language"] li a, [class*="lang"] li a, ' +
    '#language a, #lang-selector a, .language-selector a, .lang-selector a, ' +
    '[hreflang] a, a[hreflang]'
  ).each((_, el) => {
    const $el = $(el);
    const href = $el.attr("href") || "";
    const text = $el.text().trim();
    const hreflang = $el.attr("hreflang") || "";
    const dataLang = $el.attr("data-lang") || $el.attr("data-language") || "";

    if (!href || href === "#") return;

    // Determine language code
    const lang = hreflang || dataLang || text.toLowerCase().slice(0, 2);

    let resolvedHref = href;
    try {
      resolvedHref = new URL(href, baseUrl).href;
    } catch { /* keep as-is */ }

    const key = resolvedHref + "|" + lang;
    if (seen.has(key)) return;
    seen.add(key);

    links.push({ href: resolvedHref, lang, label: text || lang });
  });

  // 3. As a fallback, look for common language codes in URL paths
  // (e.g., /en/, /es/, /fr/) inside nav elements
  if (links.length === 0) {
    const langCodes = ["en", "es", "fr", "de", "it", "pt", "nl", "ja", "zh", "ko", "ru", "ar", "pl", "sv", "da", "fi", "no", "cs", "hu", "ro", "uk", "el", "tr", "th", "vi", "he", "hi"];
    $("nav a[href], header a[href]").each((_, el) => {
      const href = $(el).attr("href") || "";
      const text = $(el).text().trim();

      for (const code of langCodes) {
        if (href.includes(`/${code}/`) || href === `/${code}` || href.endsWith(`/${code}`)) {
          let resolvedHref = href;
          try {
            resolvedHref = new URL(href, baseUrl).href;
          } catch { /* keep as-is */ }

          const key = resolvedHref + "|" + code;
          if (seen.has(key)) return;
          seen.add(key);

          links.push({ href: resolvedHref, lang: code, label: text || code });
          break;
        }
      }
    });
  }

  // 4. Rake CMS pattern: look for data-lang attributes on sections + language toggle buttons in nav
  if (links.length === 0) {
    const langCodes = ["en", "es", "fr", "de", "it", "pt", "nl", "ja", "zh", "ko", "ru", "ar", "pl", "sv", "da", "fi", "no", "cs", "hu", "ro", "uk", "el", "tr", "th", "vi", "he", "hi"];
    // Find all data-lang values used in the page
    const dataLangs = new Set<string>();
    $("[data-lang]").each((_, el) => {
      const lang = $(el).attr("data-lang") || "";
      if (lang && langCodes.includes(lang)) dataLangs.add(lang);
    });
    // Look for language toggle buttons in nav that match known language codes
    $("nav button, header button, [class*=lang] button, .language-selector button").each((_, el) => {
      const text = $(el).text().trim().toLowerCase();
      const code = langCodes.find(c => text === c || text === c.toUpperCase());
      if (code && !seen.has(code)) {
        seen.add(code);
        links.push({ href: `/${code}`, lang: code, label: code.toUpperCase() });
      }
    });
    // If buttons found with data-lang, also collect from data-lang attributes
    if (links.length === 0) {
      for (const code of dataLangs) {
        if (!seen.has(code)) {
          seen.add(code);
          links.push({ href: `/${code}`, lang: code, label: code.toUpperCase() });
        }
      }
    }
  }

  // 5. Look for dropdown-item links with known language names or indexXX.html URLs
  //    (common pattern on sites like marioviajes.com)
  if (links.length === 0) {
    const langPatterns: Record<string, string[]> = {
      en: ["english", "inglés", "ingles", "angielski", "englanti"],
      es: ["español", "spanish", "espagnol", "spanisch", "hiszpański"],
      ro: ["română", "romanian", "rumano", "roumain", "rumänisch"],
      hu: ["magyar", "hungarian", "húngaro", "hongrois", "ungarisch"],
      fr: ["français", "french", "francés", "französisch"],
      de: ["deutsch", "german", "alemán", "allemand"],
      it: ["italiano", "italian", "italien", "italienisch"],
      pt: ["português", "portuguese", "portugués"],
    };

    // Look for links in dropdown menus with matching language names
    $(".dropdown-menu a, .dropdown-item, [class*=dropdown] a, [class*=drop-down] a").each((_, el) => {
      const href = $(el).attr("href") || "";
      const text = $(el).text().trim().toLowerCase();

      // Check if text matches a known language name
      for (const [code, names] of Object.entries(langPatterns)) {
        if (names.includes(text)) {
          let resolvedHref = href;
          try { resolvedHref = new URL(href, baseUrl).href; } catch { /* keep as-is */ }
          const key = resolvedHref + "|" + code;
          if (seen.has(key)) return;
          seen.add(key);
          links.push({ href: resolvedHref, lang: code, label: code.toUpperCase() });
          break;
        }
      }
    });

    // Also look for indexXX.html patterns in ANY link (e.g. indexEN.html, indexRO.html)
    if (links.length === 0) {
      const codePatterns: Record<string, RegExp> = {
        en: /indexEN\.html/i,
        es: /indexES\.html/i,
        ro: /indexRO\.html/i,
        hu: /indexHU\.html/i,
        fr: /indexFR\.html/i,
        de: /indexDE\.html/i,
        it: /indexIT\.html/i,
        pt: /indexPT\.html/i,
      };
      $("a[href]").each((_, el) => {
        const href = $(el).attr("href") || "";
        for (const [code, pattern] of Object.entries(codePatterns)) {
          if (pattern.test(href)) {
            let resolvedHref = href;
            try { resolvedHref = new URL(href, baseUrl).href; } catch { /* keep as-is */ }
            const key = resolvedHref + "|" + code;
            if (seen.has(key)) return;
            seen.add(key);
            const text = $(el).text().trim();
            links.push({ href: resolvedHref, lang: code, label: text || code.toUpperCase() });
            break;
          }
        }
      });
    }
  }

  return links;
}

/**
 * Scrape a single page URL.
 */
async function scrapePage(url: string): Promise<ScrapedPage> {
  const response = await fetchWithRetry(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; RakeCMS-Scraper/1.0)",
      Accept: "text/html",
    },
    timeoutMs: 15000,
    maxAttempts: 3,
    logger: (msg) => console.log(`   ⚠️  ${msg}`),
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
    if (text.length > 20) paragraphs.push(sanitizeScrapedContent(text));
  });
  // Also capture text from divs and sections that might not use <p> tags
  if (paragraphs.length < 3) {
    $("div.paragraph, div.content, div.text, section.content, article").each((_, el) => {
      const text = $(el).text().trim();
      if (text.length > 50 && !paragraphs.some(p => text.includes(p) || p.includes(text))) {
        paragraphs.push(sanitizeScrapedContent(text));
      }
    });
  }

  // --- Images (content-only — excluding logos, icons, SVGs) ---
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

  // --- All links (any <a> with href and text) ---
  const links: { href: string; text: string }[] = [];
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    const text = $(el).text().trim();
    if (href && text) links.push({ href, text });
  });

  // --- Carousel slides ---
  const carousel = extractCarousel($, url);

  // --- Footer text ---
  let footerText = "";
  const $footer = $("footer");
  if ($footer.length > 0) {
    footerText = $footer.text().trim();
    // Collapse excessive whitespace
    footerText = footerText.replace(/\s+/g, " ").trim();
  }

  // --- External links from nav/header/footer ---
  const externalLinks = extractExternalLinks($, url);

  // --- Language links ---
  const languageLinks = extractLanguageLinks($, url);

  return {
    url,
    title,
    metaDescription,
    headings,
    paragraphs,
    images: images.slice(0, 20),
    links,
    contactInfo: extractContactInfo($),
    carousel,
    footerText,
    externalLinks,
    languageLinks,
  };
}

/**
 * Scrape structured content from a specific language version of a website.
 * Extracts paragraphs, headings, hero elements, about section, services, footer, and contact tagline.
 */
async function scrapeLanguageContent(
  languageUrl: string,
  baseUrl: string,
): Promise<{
  paragraphs: string[];
  headings: { level: number; text: string }[];
  heroTagline?: string;
  heroSubtitle?: string;
  aboutHeading?: string;
  services: { title: string; description: string }[];
  tagline?: string;
  footerText?: string;
  contactTagline?: string;
}> {
  const response = await fetchWithRetry(languageUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; RakeCMS-Scraper/1.0)",
      Accept: "text/html",
    },
    timeoutMs: 15000,
    maxAttempts: 3,
    logger: (msg) => console.log(`   ⚠️  ${msg}`),
  });

  const html = await response.text();
  const $ = cheerio.load(html);

  // --- Paragraphs ---
  const paragraphs: string[] = [];
  $("p").each((_, el) => {
    const text = $(el).text().trim();
    if (text.length > 20) paragraphs.push(sanitizeScrapedContent(text));
  });
  if (paragraphs.length < 3) {
    $("div.paragraph, div.content, div.text, section.content, article").each((_, el) => {
      const text = $(el).text().trim();
      if (text.length > 50 && !paragraphs.some(p => text.includes(p) || p.includes(text))) {
        paragraphs.push(sanitizeScrapedContent(text));
      }
    });
  }

  // --- Headings ---
  const headings: { level: number; text: string }[] = [];
  for (let level = 1; level <= 6; level++) {
    $(`h${level}`).each((_, el) => {
      const text = $(el).text().trim();
      if (text) headings.push({ level, text });
    });
  }

  // --- Hero tagline: first <h1> on the page ---
  const heroTagline = $("h1").first().text().trim() || undefined;

  // --- Hero subtitle: first significant paragraph near the hero section ---
  const $heroSection = $("section.hero, div.hero, [class*=hero], header").first();
  let heroSubtitle: string | undefined;
  if ($heroSection.length > 0) {
    const heroPara = $heroSection.find("p").first().text().trim();
    if (heroPara && heroPara.length > 10) heroSubtitle = sanitizeScrapedContent(heroPara);
  }
  if (!heroSubtitle) {
    const firstPara = $("p").first().text().trim();
    if (firstPara && firstPara.length > 10) heroSubtitle = sanitizeScrapedContent(firstPara);
  }

  // --- About heading: look for an h2/h3 that mentions "about", "sobre", etc. ---
  let aboutHeading: string | undefined;
  const aboutKeywords = ["about", "sobre", "nosotros", "quienes", "quiénes", "über", "despre", "noi", "rólunk", "about us", "about me"];
  $("h2, h3").each((_, el) => {
    const text = $(el).text().trim().toLowerCase();
    if (aboutKeywords.some(k => text.includes(k))) {
      aboutHeading = $(el).text().trim();
      return false;
    }
  });

  // --- Services ---
  const services: { title: string; description: string }[] = [];
  const serviceKeywords = ["service", "servicio", "servici", "ofrecemos", "offer", "what we do", "nuestros", "our"];

  const serviceSection = $("section, div, main").filter((_, el) => {
    const text = $(el).text().trim().toLowerCase();
    return serviceKeywords.some(k => text.includes(k));
  }).first();

  if (serviceSection.length > 0) {
    serviceSection.find("h3, h4, h5, .service-title, [class*=service] h3, [class*=service] h4").each((_, el) => {
      const title = $(el).text().trim();
      const descEl = $(el).next("p").length > 0
        ? $(el).next("p")
        : $(el).closest("li").find("p").first();
      const description = descEl.length > 0 ? descEl.text().trim() : "";
      if (title && title.length > 2) {
        services.push({ title, description: sanitizeScrapedContent(description || "") });
      }
    });
  }

  if (services.length === 0) {
    $("ul li, ol li, .service-item, [class*=service]").each((_, el) => {
      const $el = $(el);
      const text = $el.text().trim();
      if (text.length > 10 && text.length < 200) {
        services.push({ title: text.slice(0, 60), description: sanitizeScrapedContent(text) });
      }
    });
  }

  // --- Tagline ---
  let tagline: string | undefined;
  const taglineEl = $(".tagline, .subtitle, .site-tagline, header p, .header p").first().text().trim();
  if (taglineEl && taglineEl.length > 5) tagline = sanitizeScrapedContent(taglineEl);

  // --- Footer text ---
  let footerText = "";
  const $footer = $("footer");
  if ($footer.length > 0) {
    footerText = $footer.text().trim().replace(/\s+/g, " ").trim();
  }

  // --- Contact tagline ---
  let contactTagline: string | undefined;
  const contactKeywords = ["contact", "contacto", "kontakt", "contactează", "kapcsolat", "get in touch"];
  const $contactSection = $("section, div").filter((_, el) => {
    const text = $(el).text().trim().toLowerCase();
    return contactKeywords.some(k => text.includes(k));
  }).first();
  if ($contactSection.length > 0) {
    const contactPara = $contactSection.find("p").first().text().trim();
    if (contactPara && contactPara.length > 10) contactTagline = sanitizeScrapedContent(contactPara);
  }

  return {
    paragraphs,
    headings,
    heroTagline,
    heroSubtitle,
    aboutHeading,
    services: services.slice(0, 20),
    tagline,
    footerText,
    contactTagline,
  };
}

/**
 * Main scrape function — crawls a website and returns structured data.
 */
export async function scrapeWebsite(url: string): Promise<ScrapedSite> {
  // SSRF protection: validate URL before scraping
  const validatedUrl = scrapeUrlSchema.safeParse(url);
  if (!validatedUrl.success) {
    throw new Error(`Invalid or blocked URL: ${validatedUrl.error.issues[0]?.message || "URL validation failed"}`);
  }
  url = validatedUrl.data;

  // Rate limiting for external scrapes
  const scraperCheck = scraperLimiter.check("scrape");
  if (scraperCheck.blocked) {
    const waitMinutes = Math.ceil(scraperCheck.resetInMs / 60000);
    throw new Error(`Scrape limit reached. Try again in ${waitMinutes} minute(s).`);
  }

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
  const $ = cheerio.load(await fetchWithRetry(baseUrl, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; RakeCMS-Scraper/1.0)" },
    timeoutMs: 15000,
    maxAttempts: 2,
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

  // --- Collect all images across all pages with type classification ---
  const allImages: { src: string; alt: string; type: string }[] = [];
  const seenImages = new Set<string>();

  for (const page of pages) {
    // Re-fetch page HTML to classify images (we need the DOM for context)
    try {
      const resp = await fetchWithRetry(page.url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; RakeCMS-Scraper/1.0)" },
        timeoutMs: 10000,
        maxAttempts: 1,
      });
      const html = await resp.text();
      const page$ = cheerio.load(html);

      page$("img[src]").each((_, el) => {
        const src = page$(el).attr("src") || "";
        const alt = page$(el).attr("alt") || "";
        if (!src) return;

        let resolvedSrc = src;
        try {
          resolvedSrc = new URL(src, page.url).href;
        } catch {
          return; // Skip invalid URLs
        }

        const key = resolvedSrc + "|" + alt;
        if (seenImages.has(key)) return;
        seenImages.add(key);

        const type = classifyImage(page$(el), page$);
        allImages.push({ src: resolvedSrc, alt, type });
      });
    } catch {
      // If re-fetching fails, use the images already extracted for this page
      for (const img of page.images) {
        const key = img.src + "|" + img.alt;
        if (seenImages.has(key)) continue;
        seenImages.add(key);
        allImages.push({ ...img, type: "content" });
      }
    }
  }

  // --- Collect unique language codes from all pages ---
  const languageSet = new Set<string>();
  const languageUrlMap = new Map<string, string>(); // lang -> full URL
  for (const page of pages) {
    for (const langLink of page.languageLinks) {
      if (langLink.lang) languageSet.add(langLink.lang);
      // Use the first non-default homepage link for each language
      if (langLink.href && langLink.lang && !languageUrlMap.has(langLink.lang)) {
        languageUrlMap.set(langLink.lang, langLink.href);
      }
    }
  }
  const languages = Array.from(languageSet).sort();

  // --- Scrape per-language content for non-default languages ---
  let languageContent: Record<string, {
    paragraphs: string[];
    headings: { level: number; text: string }[];
    heroTagline?: string;
    heroSubtitle?: string;
    aboutHeading?: string;
    services: { title: string; description: string }[];
    tagline?: string;
    footerText?: string;
    contactTagline?: string;
  }> | undefined;

  if (languages.length > 0) {
    languageContent = {};
    // baseUrl is already defined above

    // Detect the base page's language from content
    const baseText = homepage.paragraphs.join(" ").toLowerCase();
    const hasSpanishIndicators = /[ñáéíóúü]/.test(baseText) ||
      baseText.includes(" sobre ") || baseText.includes(" nosotros ") ||
      baseText.includes(" contacto ") || baseText.includes(" excursiones ");
    const baseLang = hasSpanishIndicators ? "es" : (languages.includes("en") ? "en" : languages[0]);

    // Add the base (default) language content from the already-scraped homepage
    const baseServices: { title: string; description: string }[] = [];
    homepage.paragraphs.slice(0, 10).forEach((p, i) => {
      if (p.length < 100) {
        baseServices.push({ title: `Service ${i + 1}`, description: p });
      }
    });
    languageContent[baseLang] = {
      paragraphs: homepage.paragraphs,
      headings: homepage.headings,
      heroTagline: homepage.headings.find(h => h.level === 1)?.text || "",
      heroSubtitle: homepage.paragraphs[0] || "",
      aboutHeading: homepage.headings.find(h => h.text.toLowerCase().includes("sobre") || h.text.toLowerCase().includes("about"))?.text || "About",
      services: baseServices.slice(0, 6),
      tagline: homepage.title,
      footerText: homepage.footerText,
      contactTagline: homepage.paragraphs.find(p => p.toLowerCase().includes("formulario") || p.toLowerCase().includes("information")) || "",
    };
    console.log(`   📍 Base language ${baseLang}: ${homepage.paragraphs.length} paragraphs`);

    for (const lang of languages) {
      if (lang === baseLang) continue; // Skip base language (already scraped)
      const langUrl = languageUrlMap.get(lang);
      if (!langUrl) {
        console.log(`   ⚠️  No URL found for language: ${lang}`);
        continue;
      }
      // Resolve relative URLs
      let fullUrl: string;
      try {
        fullUrl = new URL(langUrl, baseUrl).href;
      } catch {
        console.log(`   ⚠️  Invalid language URL for ${lang}: ${langUrl}`);
        continue;
      }
      // Skip if it's the same as the already-scraped homepage
      if (fullUrl === baseUrl) continue;

      console.log(`   🌍 Scraping language: ${lang} at ${fullUrl}`);
      try {
        const langContent = await scrapeLanguageContent(fullUrl, baseUrl);
        languageContent![lang] = langContent;
        console.log(`   ✓ Language ${lang}: ${langContent.paragraphs.length} paragraphs, ${langContent.headings.length} headings`);
      } catch (err) {
        console.log(`   ⚠️  Failed to scrape language ${lang}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    if (Object.keys(languageContent).length === 0) {
      languageContent = undefined;
    }
  }

  const scraped: ScrapedSite = {
    homepageUrl: baseUrl,
    businessName: extractBusinessName(homepage.title, baseUrl),
    pages,
    colorPalette: extractColors($),
    logoUrl: extractLogo($, baseUrl),
    businessType: detectBusinessType(allText, baseUrl),
    allText,
    languages,
    allImages,
    languageContent,
  };

  console.log(`\n📊 Summary:`);
  console.log(`   Business: ${scraped.businessName}`);
  console.log(`   Type: ${scraped.businessType}`);
  console.log(`   Pages: ${scraped.pages.length}`);
  console.log(`   Colors: ${scraped.colorPalette.length > 0 ? scraped.colorPalette.join(", ") : "auto"}`);
  console.log(`   Contact: ${scraped.pages[0].contactInfo.email.length > 0 ? "✓" : "—"}`);
  console.log(`   Social: ${scraped.pages[0].contactInfo.socialLinks.length > 0 ? "✓" : "—"}`);
  console.log(`   Languages: ${languages.length > 0 ? languages.join(", ") : "—"}`);
  if (scraped.languageContent) {
    for (const [lang, content] of Object.entries(scraped.languageContent)) {
      console.log(`   🌐 ${lang}: ${content.paragraphs.length} paragraphs, ${content.headings.length} headings${content.services.length > 0 ? `, ${content.services.length} services` : ""}`);
    }
  }
  console.log(`   Images: ${allImages.length} total (${allImages.filter(i => i.type === "content").length} content, ${allImages.filter(i => i.type === "carousel").length} carousel, ${allImages.filter(i => i.type === "logo").length} logo, ${allImages.filter(i => i.type === "icon").length} icon)`);

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
