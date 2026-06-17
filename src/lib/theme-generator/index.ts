/**
 * Theme Generator — creates business-specific Tailwind themes.
 *
 * Takes scraped site data and generates:
 *  - Color palette based on industry + extracted colors
 *  - Tailwind CSS configuration
 *  - Theme components (Hero, About, Services, Contact, Footer)
 *  - Layout pages
 */

import fs from "fs/promises";
import path from "path";
import type { ScrapedSite, BusinessType } from "@/lib/scraper/web-scraper";
import type { BusinessData } from "@/lib/scraper/maps-scraper";

export interface ThemeConfig {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  layout: "centered" | "full-width";
  businessType: BusinessType;
}

/**
 * Industry-specific color palettes.
 */
const INDUSTRY_PALETTES: Record<BusinessType, { primary: string; secondary: string; accent: string }> = {
  restaurant: { primary: "#dc2626", secondary: "#f97316", accent: "#fef3c7" },
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

/**
 * Industry-specific font recommendations.
 */
const INDUSTRY_FONTS: Record<BusinessType, string> = {
  restaurant: "Inter",
  retail: "Inter",
  service: "Inter",
  professional: "Merriweather",
  healthcare: "Inter",
  education: "Lora",
  technology: "Inter",
  "real-estate": "Inter",
  construction: "Inter",
  creative: "Poppins",
  other: "Inter",
};

/**
 * Determine the best color palette for a business.
 */
function determinePalette(site: ScrapedSite | null, businessType: BusinessType): { primary: string; secondary: string; accent: string } {
  // Use extracted colors if available
  if (site && site.colorPalette.length >= 3) {
    return {
      primary: site.colorPalette[0],
      secondary: site.colorPalette[1] || site.colorPalette[0],
      accent: site.colorPalette[2] || "#f9fafb",
    };
  }

  // Fall back to industry palette
  return INDUSTRY_PALETTES[businessType] || INDUSTRY_PALETTES.other;
}

/**
 * Format a hex color for the output CSS.
 */
function hexToRgb(hex: string): string {
  const clean = hex.replace("#", "");
  if (clean.length === 3) {
    return `${parseInt(clean[0] + clean[0], 16)}, ${parseInt(clean[1] + clean[1], 16)}, ${parseInt(clean[2] + clean[2], 16)}`;
  }
  return `${parseInt(clean.substring(0, 2), 16)}, ${parseInt(clean.substring(2, 4), 16)}, ${parseInt(clean.substring(4, 6), 16)}`;
}

/**
 * Generate theme CSS overrides.
 */
function generateCss(config: ThemeConfig): string {
  const rgb = hexToRgb(config.primaryColor);
  return `/* Rake CMS — Generated Theme: ${config.name} */
:root {
  --theme-primary: ${config.primaryColor};
  --theme-primary-rgb: ${rgb};
  --theme-secondary: ${config.secondaryColor};
  --theme-accent: ${config.accentColor};
}

/* Custom theme overrides */
.bg-theme-primary { background-color: var(--theme-primary); }
.text-theme-primary { color: var(--theme-primary); }
.border-theme-primary { border-color: var(--theme-primary); }
`;
}

/**
 * Generate the Hero section component.
 */
function generateHero(site: ScrapedSite | null, business: BusinessData | null, config: ThemeConfig): string {
  const name = business?.name || site?.businessName || config.name;
  const tagline = site?.pages[0]?.metaDescription || business?.description || `Welcome to ${name}`;

  return `// Auto-generated Hero component for ${name}
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[${config.primaryColor}] to-[${config.secondaryColor}] px-4 py-24 text-white">
      <div className="container mx-auto max-w-5xl text-center">
        <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-6xl">
          ${escapeJsx(name)}
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-white/80">
          ${escapeJsx(tagline)}
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/contact"
            className="rounded-lg bg-white px-8 py-3 font-semibold text-[${config.primaryColor}] hover:bg-white/90"
          >
            Get in Touch
          </Link>
          <Link
            href="/about"
            className="rounded-lg border border-white/30 px-8 py-3 font-semibold text-white hover:bg-white/10"
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

/**
 * Generate the About section.
 */
function generateAbout(site: ScrapedSite | null, business: BusinessData | null): string {
  const aboutPage = site?.pages.find((p) => p.url.includes("about"));
  const heading = aboutPage?.headings[0]?.text || "About Us";
  const paragraphs = aboutPage?.paragraphs.slice(0, 3) || [
    business?.description || "We are dedicated to providing exceptional service to our community.",
  ];

  return `// Auto-generated About component
import Image from "next/image";

export default function About() {
  return (
    <section id="about" className="px-4 py-20">
      <div className="container mx-auto max-w-5xl">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <h2 className="mb-6 text-3xl font-bold">${escapeJsx(heading)}</h2>
            ${paragraphs.map((p) => `<p className="mb-4 text-muted-foreground">${escapeJsx(p)}</p>`).join("\n            ")}
          </div>
          <div className="aspect-square rounded-2xl bg-muted" />
        </div>
      </div>
    </section>
  );
}
`;
}

/**
 * Generate the Services section.
 */
function generateServices(site: ScrapedSite | null, config: ThemeConfig): string {
  const servicePage = site?.pages.find((p) => p.url.includes("service"));
  const headings = servicePage?.headings.filter((h) => h.level >= 2).slice(0, 6) || [
    { level: 2, text: "Service 1" },
    { level: 2, text: "Service 2" },
    { level: 2, text: "Service 3" },
  ];

  return `// Auto-generated Services component

export default function Services() {
  const services = ${JSON.stringify(headings.map((h) => h.text), null, 2)};

  return (
    <section id="services" className="bg-muted/50 px-4 py-20">
      <div className="container mx-auto max-w-5xl">
        <h2 className="mb-12 text-center text-3xl font-bold">Our Services</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {services.map((service: string, i: number) => (
            <div key={i} className="rounded-xl border bg-card p-6 transition-shadow hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[${config.primaryColor}]/10 text-xl font-bold text-[${config.primaryColor}]">
                {i + 1}
              </div>
              <h3 className="mb-2 text-lg font-semibold">{service}</h3>
              <p className="text-sm text-muted-foreground">
                Learn more about our {service.toLowerCase()} offerings.
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`;
}

/**
 * Generate the Contact section.
 */
function generateContact(site: ScrapedSite | null, business: BusinessData | null): string {
  const contact = site?.pages[0]?.contactInfo;
  const phone = business?.phone || contact?.phone[0] || "";
  const email = business?.website || contact?.email[0] || "";
  const address = business?.address || contact?.address[0] || "";
  const hours = business?.hours || [];

  return `// Auto-generated Contact component

export default function Contact() {
  return (
    <section id="contact" className="px-4 py-20">
      <div className="container mx-auto max-w-5xl">
        <h2 className="mb-12 text-center text-3xl font-bold">Contact Us</h2>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="mt-1">📍</div>
              <div>
                <h3 className="font-semibold">Address</h3>
                <p className="text-muted-foreground">${escapeJsx(address || "Visit us")}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="mt-1">📞</div>
              <div>
                <h3 className="font-semibold">Phone</h3>
                <p className="text-muted-foreground">${escapeJsx(phone || "Call us")}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="mt-1">✉️</div>
              <div>
                <h3 className="font-semibold">Email</h3>
                <p className="text-muted-foreground">${escapeJsx(email || "Email us")}</p>
              </div>
            </div>
            ${hours.length > 0 ? `
            <div className="flex items-start gap-4">
              <div className="mt-1">🕐</div>
              <div>
                <h3 className="font-semibold">Hours</h3>
                <div className="text-sm text-muted-foreground">
                  ${hours.map((h) => `<p>${escapeJsx(h)}</p>`).join("\n                  ")}
                </div>
              </div>
            </div>` : ""}
          </div>
          <div className="rounded-xl border bg-card p-6">
            <form className="space-y-4">
              <input type="text" placeholder="Your Name" className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm" />
              <input type="email" placeholder="Your Email" className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm" />
              <textarea placeholder="Your Message" rows={4} className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm" />
              <button type="submit" className="w-full rounded-lg bg-[${INDUSTRY_PALETTES.other.primary}] px-4 py-2 text-sm font-medium text-white hover:opacity-90">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
`;
}

/**
 * Generate the Footer component.
 */
function generateFooter(business: BusinessData | null, name: string): string {
  const socialLinks = business ? [] : []; // Could populate from scraped social
  const year = new Date().getFullYear();

  return `// Auto-generated Footer component
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t bg-card px-4 py-12">
      <div className="container mx-auto max-w-5xl">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h4 className="mb-3 font-semibold">${escapeJsx(name)}</h4>
            <p className="text-sm text-muted-foreground">
              Serving our community with excellence.
            </p>
          </div>
          <div>
            <h4 className="mb-3 font-semibold">Quick Links</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <Link href="/" className="block hover:text-foreground">Home</Link>
              <Link href="/about" className="block hover:text-foreground">About</Link>
              <Link href="/services" className="block hover:text-foreground">Services</Link>
              <Link href="/contact" className="block hover:text-foreground">Contact</Link>
            </div>
          </div>
          <div>
            <h4 className="mb-3 font-semibold">Contact</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              ${business?.phone ? `<p>📞 ${escapeJsx(business.phone)}</p>` : ""}
              ${business?.address ? `<p>📍 ${escapeJsx(business.address)}</p>` : ""}
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; ${year} ${escapeJsx(name)}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
`;
}

/**
 * Generate the main layout that imports all components.
 */
function generateLayout(name: string): string {
  return `// Auto-generated Layout for ${name}
import Header from "@/components/theme/Header";
import Footer from "@/components/theme/Footer";
import Hero from "@/components/theme/Hero";
import About from "@/components/theme/About";
import Services from "@/components/theme/Services";
import Contact from "@/components/theme/Contact";

export default function GeneratedPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <About />
        <Services />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
`;
}

/**
 * Escape strings for safe embedding in JSX.
 */
function escapeJsx(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\n/g, "\\n")
    .trim();
}

/**
 * Main function: generate all theme files for a given business.
 */
export async function generateTheme(
  site: ScrapedSite | null,
  business: BusinessData | null,
  outputDir: string
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

  const themeDir = path.join(outputDir, "components", "theme");
  await fs.mkdir(themeDir, { recursive: true });

  // Write each component
  const files: Array<{ name: string; content: string }> = [
    { name: "theme.css", content: generateCss(config) },
    { name: "Hero.tsx", content: generateHero(site, business, config) },
    { name: "About.tsx", content: generateAbout(site, business) },
    { name: "Services.tsx", content: generateServices(site, config) },
    { name: "Contact.tsx", content: generateContact(site, business) },
    { name: "Footer.tsx", content: generateFooter(business, name) },
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

  return config;
}
