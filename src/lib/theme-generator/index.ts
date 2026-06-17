import fs from "fs/promises";
import path from "path";
import type { ScrapedSite, BusinessType } from "@/lib/scraper/web-scraper";
import type { BusinessData } from "@/lib/scraper/maps-scraper";
import type { ScrapedPhoto } from "@/lib/scraper/photo-scraper";
import { generateContent, type GeneratedContent } from "@/lib/theme-generator/content-generator";
import { getReviews, type Review } from "@/lib/theme-generator/reviews";

// ─── Types ───────────────────────────────────────────────────────

export interface ThemeConfig {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  layout: "centered" | "full-width";
  businessType: BusinessType;
}

/** A page the site will have — only these get linked in nav/footer */
interface SitePage {
  slug: string;
  label: string;
}

// ─── Industry palettes ────────────────────────────────────────────

const INDUSTRY_PALETTES: Record<BusinessType, { primary: string; secondary: string; accent: string }> = {
  restaurant: { primary: "#8B1A1A", secondary: "#D4A017", accent: "#1a1a2e" },
  retail: { primary: "#2563eb", secondary: "#7c3aed", accent: "#f0f9ff" },
  service: { primary: "#0891b2", secondary: "#059669", accent: "#ecfdf5" },
  professional: { primary: "#1e40af", secondary: "#475569", accent: "#f8fafc" },
  healthcare: { primary: "#0d9488", secondary: "#0284c7", accent: "#f0fdfa" },
  education: { primary: "#7c3aed", secondary: "#2563eb", accent: "#f5f3ff" },
  technology: { primary: "#3b82f6", secondary: "#8b5cf6", accent: "#eff6ff" },
  "real-estate": { primary: "#0f766e", secondary: "#d97706", accent: "#fefce8" },
  construction: { primary: "#d97706", secondary: "#dc2626", accent: "#fffbeb" },
  creative: { primary: "#ec4899", secondary: "#8b5cf6", accent: "#fdf2f8" },
  other: { primary: "#3b82f6", secondary: "#6b7280", accent: "#f9fafb" },
};

const INDUSTRY_FONTS: Record<BusinessType, string> = {
  restaurant: "Inter", retail: "Inter", service: "Inter", professional: "Merriweather",
  healthcare: "Inter", education: "Lora", technology: "Inter",
  "real-estate": "Inter", construction: "Inter", creative: "Poppins", other: "Inter",
};

// ─── Palette helper ───────────────────────────────────────────────

function determinePalette(site: ScrapedSite | null, businessType: BusinessType): { primary: string; secondary: string; accent: string } {
  if (site && site.colorPalette.length >= 3) {
    return { primary: site.colorPalette[0], secondary: site.colorPalette[1] || site.colorPalette[0], accent: site.colorPalette[2] || "#f9fafb" };
  }
  return INDUSTRY_PALETTES[businessType] || INDUSTRY_PALETTES.other;
}

function hexToRgb(hex: string): string {
  const clean = hex.replace("#", "");
  if (clean.length === 3) return `${parseInt(clean[0] + clean[0], 16)}, ${parseInt(clean[1] + clean[1], 16)}, ${parseInt(clean[2] + clean[2], 16)}`;
  return `${parseInt(clean.substring(0, 2), 16)}, ${parseInt(clean.substring(2, 4), 16)}, ${parseInt(clean.substring(4, 6), 16)}`;
}

function escapeJsx(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;").replace(/\\n/g, "\\\\n").trim();
}

// ─── CSS ──────────────────────────────────────────────────────────

function generateCss(config: ThemeConfig): string {
  const rgb = hexToRgb(config.primaryColor);
  return `/* Rake CMS — Theme: ${config.name} */
:root { --theme-primary: ${config.primaryColor}; --theme-primary-rgb: ${rgb}; --theme-secondary: ${config.secondaryColor}; --theme-accent: ${config.accentColor}; }
.bg-theme-primary { background-color: var(--theme-primary); }
.text-theme-primary { color: var(--theme-primary); }
.border-theme-primary { border-color: var(--theme-primary); }
`;
}

// ─── Nav link helpers — ONLY links to pages that definitely exist ─

/** Build the nav-link list from the pages that will be seeded. Never adds a link for a page not in the list. */
function buildNavLinks(pageSlugs: SitePage[]): SitePage[] {
  const defaults: SitePage[] = [{ slug: "/", label: "Home" }];
  for (const p of pageSlugs) {
    if (p.slug !== "home" && p.slug !== "/") {
      defaults.push({ slug: `/${p.slug}`, label: p.label });
    }
  }
  // Always add blog if it's not in the list
  if (!pageSlugs.find((p) => p.slug === "blog")) {
    defaults.push({ slug: "/blog", label: "Blog" });
  }
  return defaults;
}

function renderNavLinks(links: SitePage[], className: string, isMobile = false): string {
  return links
    .map(
      (link) =>
        `<Link href="${escapeJsx(link.slug)}" className="${escapeJsx(className)}"${isMobile ? ` onClick={() => setOpen(false)}` : ""}>${escapeJsx(link.label)}</Link>`
    )
    .join("\n          ");
}

// ─── Header (no hardcoded links) ─────────────────────────────────

function generateHeader(name: string, pageSlugs: SitePage[]): string {
  const navLinks = buildNavLinks(pageSlugs);
  const desktopLinks = renderNavLinks(
    navLinks,
    "block text-sm font-medium text-muted-foreground transition hover:text-foreground"
  );
  const mobileLinks = renderNavLinks(
    navLinks,
    "text-sm font-medium",
    true
  );

  return `// Auto-generated Header — links derived from seeded pages only
"use client";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          ${escapeJsx(name)}
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          ${desktopLinks}
        </nav>
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          <span className="text-2xl">{open ? "✕" : "☰"}</span>
        </button>
      </div>
      {open && (
        <div className="border-t px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            ${mobileLinks}
          </div>
        </div>
      )}
    </header>
  );
}
`;
}

// ─── Footer (no hardcoded links) ─────────────────────────────────

function generateFooter(business: BusinessData | null, name: string, pageSlugs: SitePage[]): string {
  const year = new Date().getFullYear();
  const navLinks = buildNavLinks(pageSlugs);
  const quickLinks = renderNavLinks(
    navLinks,
    "block text-muted-foreground transition hover:text-foreground"
  );
  const phone = business?.phone || "";
  const address = business?.address || "";

  return `// Auto-generated Footer — links derived from seeded pages only
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t bg-muted/30 px-4 py-16">
      <div className="container mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <h4 className="mb-4 text-lg font-semibold">${escapeJsx(name)}</h4>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Serving our community with dedication and excellence.
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Quick Links</h4>
            <div className="space-y-3 text-sm">
              ${quickLinks}
            </div>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Contact</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              ${phone ? `<p>📞 ${escapeJsx(phone)}</p>` : ""}
              ${address ? `<p>📍 ${escapeJsx(address)}</p>` : ""}
            </div>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>Made with ❤️ by{" "}
            <Link href="https://alexawebservers.com" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
              alexawebservers.com
            </Link>
          </p>
          <p className="mt-1">&copy; ${year} ${escapeJsx(name)}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
`;
}

// ─── Reviews section ──────────────────────────────────────────────

function generateReviews(reviews: Review[]): string {
  const reviewsJson = JSON.stringify(reviews);

  return `// Auto-generated Reviews component
"use client";
import { motion } from "framer-motion";

const REVIEWS: Array<{ author: string; text: string; rating: number; source: string }> = ${reviewsJson};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={\`text-sm \${star <= rating ? "text-amber-400" : "text-gray-300"}\`}>★</span>
      ))}
    </div>
  );
}

export default function Reviews() {
  return (
    <section id="reviews" className="px-4 py-20">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <span className="mb-4 block text-xs uppercase tracking-[0.3em] text-muted-foreground/60">Testimonials</span>
          <h2 className="text-3xl font-bold md:text-4xl">What Our Customers Say</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {REVIEWS.map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <StarRating rating={review.rating} />
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">"{review.text}"</p>
              <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                <span className="font-medium">— {review.author}</span>
                <span>{review.source}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
`;
}

// ─── Hero ─────────────────────────────────────────────────────────

function generateHero(content: GeneratedContent, config: ThemeConfig, heroPhoto: string | null): string {
  const bgStyle = heroPhoto
    ? `backgroundImage: 'url(${heroPhoto})', backgroundSize: 'cover', backgroundPosition: 'center'`
    : `background: 'linear-gradient(135deg, ${config.primaryColor}, ${config.secondaryColor})'`;

  return `// Auto-generated Hero
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-4"
      style={{ ${bgStyle} }}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 mx-auto max-w-4xl text-center text-white">
        <h1 className="mb-4 text-5xl font-bold tracking-tight md:text-7xl">
          ${escapeJsx(content.tagline)}
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-lg text-white/80 md:text-xl">
          ${escapeJsx(content.heroSubtitle)}
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/contact"
            className="inline-flex items-center rounded-xl bg-white px-8 py-3.5 font-semibold text-[${config.primaryColor}] shadow-lg transition hover:bg-white/90 hover:shadow-xl"
          >
            Get in Touch
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center rounded-xl border-2 border-white/40 px-8 py-3.5 font-semibold text-white transition hover:border-white/70 hover:bg-white/10"
          >
            Learn More
          </Link>
        </div>
      </div>
    </section>
  );
}
`;
}

// ─── About ────────────────────────────────────────────────────────

function generateAbout(content: GeneratedContent, photo: string | null): string {
  const imgHtml = photo
    ? `<div className="overflow-hidden rounded-2xl"><img src="${photo}" alt="${escapeJsx(content.aboutHeading)}" className="h-full w-full object-cover transition duration-500 hover:scale-105" /></div>`
    : `<div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5" />`;
  const paras = content.aboutParagraphs
    .map((p) => `<p className="mb-4 leading-relaxed text-muted-foreground">${escapeJsx(p)}</p>`)
    .join("\n            ");

  return `// Auto-generated About
export default function About() {
  return (
    <section id="about" className="px-4 py-20">
      <div className="container mx-auto max-w-6xl">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <h2 className="mb-6 text-3xl font-bold md:text-4xl">${escapeJsx(content.aboutHeading)}</h2>
            ${paras}
          </div>
          <div>${imgHtml}</div>
        </div>
      </div>
    </section>
  );
}
`;
}

// ─── Services ─────────────────────────────────────────────────────

function generateServices(content: GeneratedContent, config: ThemeConfig): string {
  const servicesJson = JSON.stringify(content.services);
  return `// Auto-generated Services
export default function Services() {
  const services = ${servicesJson};
  return (
    <section id="services" className="bg-muted/50 px-4 py-20">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Our Services</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">Discover what we offer.</p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service: { title: string; description: string }, i: number) => (
            <div key={i} className="group rounded-xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[${config.primaryColor}]/10 text-xl font-bold text-[${config.primaryColor}] transition group-hover:bg-[${config.primaryColor}] group-hover:text-white">{i + 1}</div>
              <h3 className="mb-2 text-lg font-semibold">{service.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`;
}

// ─── Contact ──────────────────────────────────────────────────────

function generateContact(site: ScrapedSite | null, business: BusinessData | null, config: ThemeConfig): string {
  const contact = site?.pages[0]?.contactInfo;
  const phone = business?.phone || contact?.phone[0] || "";
  const email = business?.website || contact?.email[0] || "";
  const address = business?.address || contact?.address[0] || "";
  const hours = business?.hours || [];

  return `// Auto-generated Contact
export default function Contact() {
  return (
    <section id="contact" className="px-4 py-20">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Contact Us</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">We'd love to hear from you.</p>
        </div>
        <div className="grid gap-12 md:grid-cols-2">
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-lg bg-[${config.primaryColor}]/10 text-lg">📍</div>
              <div><h3 className="font-semibold">Address</h3><p className="text-muted-foreground">${escapeJsx(address || "Visit us")}</p></div>
            </div>
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-lg bg-[${config.primaryColor}]/10 text-lg">📞</div>
              <div><h3 className="font-semibold">Phone</h3><p className="text-muted-foreground">${escapeJsx(phone || "Call us")}</p></div>
            </div>
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-lg bg-[${config.primaryColor}]/10 text-lg">✉️</div>
              <div><h3 className="font-semibold">Email</h3><p className="text-muted-foreground">${escapeJsx(email || "Email us")}</p></div>
            </div>
            ${hours.length > 0 ? `<div className="flex items-start gap-4"><div className="mt-1 flex h-10 w-10 items-center justify-center rounded-lg bg-[${config.primaryColor}]/10 text-lg">🕐</div><div><h3 className="font-semibold">Hours</h3><div className="space-y-1 text-sm text-muted-foreground">${hours.map((h) => `<p>${escapeJsx(h)}</p>`).join("\n                  ")}</div></div></div>` : ""}
          </div>
          <div className="rounded-xl border bg-card p-8 shadow-sm">
            <form className="space-y-5">
              <div><label className="mb-1 block text-sm font-medium">Your Name</label><input type="text" placeholder="John Doe" className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm transition focus:border-[${config.primaryColor}] focus:outline-none focus:ring-2 focus:ring-[${config.primaryColor}]/20" /></div>
              <div><label className="mb-1 block text-sm font-medium">Your Email</label><input type="email" placeholder="john@example.com" className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm transition focus:border-[${config.primaryColor}] focus:outline-none focus:ring-2 focus:ring-[${config.primaryColor}]/20" /></div>
              <div><label className="mb-1 block text-sm font-medium">Your Message</label><textarea placeholder="Tell us about your needs..." rows={4} className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm transition focus:border-[${config.primaryColor}] focus:outline-none focus:ring-2 focus:ring-[${config.primaryColor}]/20" /></div>
              <button type="submit" className="w-full rounded-lg bg-[${config.primaryColor}] px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:opacity-90 hover:shadow-md">Send Message</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
`;
}

// ─── GeneratedPage layout ─────────────────────────────────────────

function generateLayout(name: string): string {
  return `// Auto-generated landing page for ${escapeJsx(name)}
import Header from "@/components/theme/Header";
import Footer from "@/components/theme/Footer";
import Hero from "@/components/theme/Hero";
import About from "@/components/theme/About";
import Services from "@/components/theme/Services";
import Reviews from "@/components/theme/Reviews";
import Contact from "@/components/theme/Contact";

export default function GeneratedPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <About />
        <Services />
        <Reviews />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
`;
}

// ─── Main generator function ─────────────────────────────────────

export async function generateTheme(
  site: ScrapedSite | null,
  business: BusinessData | null,
  outputDir: string,
  photos: ScrapedPhoto[] = [],
  /** Optional: page slugs that will be seeded. Determines nav links. */
  pageSlugs: SitePage[] = []
): Promise<ThemeConfig> {
  const name = business?.name || site?.businessName || "My Business";
  const businessType = site?.businessType || "other";
  const palette = determinePalette(site, businessType);

  const config: ThemeConfig = {
    name,
    primaryColor: palette.primary,
    secondaryColor: palette.secondary,
    accentColor: palette.accent,
    fontFamily: INDUSTRY_FONTS[businessType],
    layout: "centered",
    businessType,
  };

  const content = generateContent(site, business, businessType);
  const heroPhoto = photos.length > 0 ? photos[0].localPath : null;
  const aboutPhoto = photos.length > 1 ? photos[1].localPath : null;

  // Build review data
  const reviews = getReviews(name);

  const themeDir = path.join(outputDir, "src", "components", "theme");
  await fs.mkdir(themeDir, { recursive: true });

  const files: Array<{ name: string; content: string }> = [
    { name: "theme.css", content: generateCss(config) },
    { name: "Header.tsx", content: generateHeader(name, pageSlugs) },
    { name: "Hero.tsx", content: generateHero(content, config, heroPhoto) },
    { name: "About.tsx", content: generateAbout(content, aboutPhoto) },
    { name: "Services.tsx", content: generateServices(content, config) },
    { name: "Reviews.tsx", content: generateReviews(reviews) },
    { name: "Contact.tsx", content: generateContact(site, business, config) },
    { name: "Footer.tsx", content: generateFooter(business, name, pageSlugs) },
    { name: "GeneratedPage.tsx", content: generateLayout(name) },
  ];

  for (const file of files) {
    const filePath = path.join(themeDir, file.name);
    await fs.writeFile(filePath, file.content, "utf-8");
    console.log(`   ✓ Generated: ${file.name}`);
  }

  console.log(`\n🎨 Theme generated for "${name}":`);
  console.log(`   Type: ${businessType}`);
  console.log(`   Primary: ${config.primaryColor}`);
  console.log(`   Font: ${config.fontFamily}`);
  console.log(`   Components: ${files.length}`);
  console.log(`   Photos: ${photos.length}`);
  console.log(`   Reviews: ${reviews.length}`);
  console.log(`   Nav links: ${buildNavLinks(pageSlugs).length} (validated)`);

  return config;
}

export { buildNavLinks, type SitePage };
