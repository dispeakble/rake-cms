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
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;").replace(/\\\\n/g, "\\\\\\\\n").trim();
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

// ─── Section-anchor nav links ─────────────────────────────────────

/**
 * Builds section-anchor nav links for the homepage.
 * Main sections: about, services, locations, menu, reviews, contact.
 * Also includes blog if it's in the pageSlugs list, but as a section anchor.
 */
function buildNavLinks(_pageSlugs: SitePage[]): SitePage[] {
  // Default section-anchor links for restaurant homepage sections
  const sectionLinks: SitePage[] = [
    { slug: "/#about", label: "About" },
    { slug: "/#services", label: "Services" },
    { slug: "/#locations", label: "Locations" },
    { slug: "/#menu", label: "Menu" },
    { slug: "/#reviews", label: "Reviews" },
    { slug: "/#contact", label: "Contact" },
  ];
  // If a blog page exists in the slugs, add it as a section anchor too
  if (_pageSlugs.find((p) => p.slug === "blog")) {
    sectionLinks.push({ slug: "/blog", label: "Blog" });
  }
  return sectionLinks;
}

function renderNavLinks(links: SitePage[], className: string, isMobile = false): string {
  return links
    .map(
      (link) =>
        `<Link href="${escapeJsx(link.slug)}" className="${escapeJsx(className)}"${isMobile ? ` onClick={() => setOpen(false)}` : ""}>${escapeJsx(link.label)}</Link>`
    )
    .join("\n          ");
}

// ─── Header (framer-motion, section anchors, scroll-aware) ────────

function generateHeader(name: string, pageSlugs: SitePage[]): string {
  const navLinks = buildNavLinks(pageSlugs);
  const desktopLinks = renderNavLinks(
    navLinks,
    "block text-sm font-medium text-white/80 transition hover:text-white"
  );
  const mobileLinks = renderNavLinks(
    navLinks,
    "text-base font-medium text-white/90",
    true
  );

  return `// Auto-generated Header — framer-motion, section-anchor nav, scroll-aware
"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.2 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl supports-[backdrop-filter]:bg-black/50"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold tracking-tight text-white">
          ${escapeJsx(name)}
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          ${desktopLinks}
        </nav>
        <button
          className="text-white md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <span className="text-2xl">{open ? "✕" : "☰"}</span>
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-white/10 bg-black/90 backdrop-blur-xl"
          >
            <div className="flex flex-col gap-4 px-4 py-6">
              ${mobileLinks}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
`;
}

// ─── Footer (section-anchor links, watermark) ─────────────────────

function generateFooter(business: BusinessData | null, name: string, pageSlugs: SitePage[]): string {
  const year = new Date().getFullYear();
  const navLinks = buildNavLinks(pageSlugs);
  const quickLinks = renderNavLinks(
    navLinks,
    "block text-sm text-gray-400 transition hover:text-white"
  );

  return `// Auto-generated Footer — section-anchor links, watermark
"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black px-4 py-16">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid gap-10 md:grid-cols-4"
        >
          <div className="md:col-span-2">
            <h4 className="mb-4 text-lg font-semibold text-white">${escapeJsx(name)}</h4>
            <p className="max-w-sm text-sm leading-relaxed text-gray-400">
              Authentic Brazilian rodizio. Endless meat, bold flavors, unforgettable moments.
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">Quick Links</h4>
            <div className="space-y-3 text-sm">
              ${quickLinks}
            </div>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">Follow Us</h4>
            <div className="space-y-3 text-sm text-gray-400">
              <p>Facebook</p>
              <p>Instagram</p>
              <p>Tripadvisor</p>
            </div>
          </div>
        </motion.div>
        <div className="mt-12 border-t border-white/10 pt-8 text-center text-sm text-gray-400">
          <p>
            Made with ❤️ by{" "}
            <Link href="https://alexawebservers.com" className="text-[${business?.name ? "#D4A017" : "#8B1A1A"}] hover:underline" target="_blank" rel="noopener noreferrer">
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

// ─── Hero (framer-motion parallax, floating circles, staggered entrance) ─

function generateHero(content: GeneratedContent, config: ThemeConfig, heroPhoto: string | null): string {
  const bgStyle = heroPhoto
    ? `backgroundImage: 'url(${heroPhoto})', backgroundSize: 'cover', backgroundPosition: 'center'`
    : `background: 'linear-gradient(135deg, ${config.primaryColor}, ${config.secondaryColor})'`;

  return `// Auto-generated Hero — framer-motion parallax, floating decorations, staggered entrance
"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0.3]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.3 },
    },
  };

  const childVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
  };

  return (
    <section
      ref={ref}
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4"
      style={{ ${bgStyle} }}
    >
      {/* Parallax background layer */}
      <motion.div
        className="absolute inset-0 bg-black/55"
        style={{ y, opacity }}
      />

      {/* Floating decorative circles */}
      <motion.div
        className="absolute top-20 left-10 h-40 w-40 rounded-full border border-white/10"
        animate={{ y: ["-10px", "10px", "-10px"] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 right-10 h-32 w-32 rounded-full border border-white/10"
        animate={{ y: ["10px", "-10px", "10px"] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute top-1/3 right-1/4 h-24 w-24 rounded-full border border-white/5"
        animate={{ y: ["-8px", "8px", "-8px"] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 0.5 }}
      />

      {/* Content */}
      <motion.div
        className="relative z-10 mx-auto max-w-4xl text-center text-white"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.span
          variants={childVariants}
          className="mb-6 inline-block text-xs uppercase tracking-[0.4em] text-white/60"
        >
          Brazilian Rodizio
        </motion.span>

        <motion.h1
          variants={childVariants}
          className="mb-6 text-5xl font-black tracking-tight md:text-7xl lg:text-8xl"
        >
          CARNE SIN FIN,<br />
          <span className="text-[${config.secondaryColor}]">SABOR SIN LÍMITE</span>
        </motion.h1>

        <motion.p
          variants={childVariants}
          className="mx-auto mb-12 max-w-2xl text-lg text-white/70 md:text-xl"
        >
          ${escapeJsx(content.heroSubtitle || "Discover the authentic Brazilian rodizio experience — an endless parade of premium grilled meats, carved tableside by our expert passadores.")}
        </motion.p>

        <motion.div
          variants={childVariants}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            href="/#menu"
            className="inline-flex items-center rounded-xl bg-white px-10 py-4 font-semibold text-[${config.primaryColor}] shadow-lg transition hover:bg-white/90 hover:shadow-xl"
          >
            See Menu &amp; Prices
          </Link>
          <Link
            href="/#contact"
            className="inline-flex items-center rounded-xl border-2 border-white/40 px-10 py-4 font-semibold text-white transition hover:border-white/70 hover:bg-white/10"
          >
            Reserve Your Table
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
`;
}

// ─── About (framer-motion scroll-triggered, rodizio content) ──────

function generateAbout(content: GeneratedContent, photo: string | null): string {
  const imgHtml = photo
    ? `<motion.div className="overflow-hidden rounded-2xl" whileHover={{ scale: 1.02 }} transition={{ duration: 0.4 }}><img src="${photo}" alt="${escapeJsx(content.aboutHeading)}" className="h-full w-full object-cover" /></motion.div>`
    : `<div className="aspect-square rounded-2xl bg-gradient-to-br from-amber-900/30 via-red-900/20 to-black" />`;

  return `// Auto-generated About — framer-motion fade-in, rodizio experience
"use client";

import { motion } from "framer-motion";

export default function About() {
  return (
    <section id="about" className="relative px-4 py-24">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#1a0a0a] to-black opacity-80" />
      <div className="relative z-10 container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid items-center gap-12 md:grid-cols-2"
        >
          <div>
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="mb-4 block text-xs uppercase tracking-[0.3em] text-amber-500/80"
            >
              Our Story
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-6 text-3xl font-bold text-white md:text-4xl"
            >
              ${escapeJsx(content.aboutHeading || "The Rodizio Experience")}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mb-4 leading-relaxed text-gray-300"
            >
              Step into ${escapeJsx(content.aboutHeading?.split(" in ")[0] || "our restaurant")} and experience the centuries-old gaucho tradition of rodizio — a continuous service of fire-grilled meats, carved directly onto your plate by our skilled passadores. Each cut is seasoned with coarse sea salt and grilled over open flames to perfection.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mb-4 leading-relaxed text-gray-300"
            >
              From the coveted picanha (prime rump cap) to succulent costela (beef ribs) and tender alcatra (top sirloin), our rotating selection features 12+ premium cuts brought to your table on skewers. Use the color-coded card — green means "keep them coming," red means "I need a moment."
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="leading-relaxed text-gray-300"
            >
              Complement your feast with our hot and cold buffet of traditional Brazilian sides — garlic bread, black beans, rice, farofa, fried bananas, and fresh salads. Save room for dessert and finish with a caipirinha, Brazil's national cocktail.
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            ${imgHtml}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
`;
}

// ─── Services — TWO locations, Menu section, meat types, starters, desserts ─

function generateServices(content: GeneratedContent, config: ThemeConfig): string {
  // Restaurant-specific hardcoded data
  const meats = [
    { name: "Picanha", desc: "Prime rump cap — the crown jewel of churrasco" },
    { name: "Alcatra", desc: "Tender top sirloin, grilled to juicy perfection" },
    { name: "Costela", desc: "Succulent beef ribs, slow-roasted until fall-off-the-bone" },
    { name: "Maminha", desc: "Flavorful bottom sirloin, beautifully marbled" },
    { name: "Lomo", desc: "Premium pork tenderloin, seasoned and fire-grilled" },
    { name: "Frango", desc: "Chicken thighs and drumsticks, marinated in citrus and herbs" },
    { name: "Cordeiro", desc: "Herb-crusted lamb chops, smoky and tender" },
    { name: "Linguica", desc: "Spicy Portuguese sausage with a perfect char" },
  ];
  const starters = [
    { name: "Pão de Queijo", desc: "Cheese bread — warm, chewy, and addictive" },
    { name: "Polenta Frita", desc: "Crispy fried polenta sticks with garlic aioli" },
    { name: "Azeitonas", desc: "Mixed marinated olives with herbs and olive oil" },
    { name: "Salada Tropical", desc: "Fresh garden salad with hearts of palm" },
  ];
  const desserts = [
    { name: "Tres Leches", desc: "Three-milk sponge cake with vanilla whipped cream" },
    { name: "Pudim", desc: "Classic Brazilian flan with caramel sauce" },
    { name: "Mousse de Chocolate", desc: "Rich Belgian chocolate mousse" },
    { name: "Tarta de Limón", desc: "Zesty lemon meringue pie with toasted meringue" },
    { name: "Helado Artesanal", desc: "Artisan ice cream — vanilla, dulce de leche, or coconut" },
    { name: "Fruta Fresca", desc: "Seasonal fresh fruit platter with honey-lime drizzle" },
  ];

  const meatsJson = JSON.stringify(meats);
  const startersJson = JSON.stringify(starters);
  const dessertsJson = JSON.stringify(desserts);

  return `// Auto-generated Services — locations, menu, meat types, starters, desserts
"use client";

import { motion } from "framer-motion";

const MEATS = ${meatsJson};
const STARTERS = ${startersJson};
const DESSERTS = ${dessertsJson};

export default function Services() {
  return (
    <section id="services" className="relative px-4 py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0d] via-[#1a0808] to-[#0d0d0d]" />
      <div className="relative z-10 container mx-auto max-w-6xl">

        {/* ── Locations ── */}
        <motion.div
          id="locations"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <div className="mb-12 text-center">
            <span className="mb-4 block text-xs uppercase tracking-[0.3em] text-amber-500/60">Our Locations</span>
            <h2 className="text-3xl font-bold text-white md:text-4xl">Find Your Nearest Rodeo Grill</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            {/* SUR */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="group rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition hover:border-amber-600/40 hover:bg-white/10"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20 text-lg">📍</span>
                <h3 className="text-xl font-bold text-white">Rodeo Grill <span className="text-amber-400">SUR</span></h3>
              </div>
              <div className="space-y-3 text-sm text-gray-300">
                <p className="font-medium text-white">Costa Adeje</p>
                <p>C. Dublin 1, 38660 Costa Adeje</p>
                <p>📞 <a href="tel:+34922713255" className="text-amber-400 transition hover:text-amber-300">922 713 255</a></p>
                <p className="text-gray-400">Wed — Sun: 14:00 – 23:00</p>
                <a href="https://maps.google.com/?q=C.+Dublin+1,+38660+Costa+Adeje" target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-amber-500 underline transition hover:text-amber-400">View on Google Maps →</a>
              </div>
            </motion.div>
            {/* NORTE */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="group rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition hover:border-amber-600/40 hover:bg-white/10"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20 text-lg">📍</span>
                <h3 className="text-xl font-bold text-white">Rodeo Grill <span className="text-amber-400">NORTE</span></h3>
              </div>
              <div className="space-y-3 text-sm text-gray-300">
                <p className="font-medium text-white">La Esperanza</p>
                <p>Carr. de la Esperanza Km4.8, La Esperanza</p>
                <p>📞 <a href="tel:+34922443900" className="text-amber-400 transition hover:text-amber-300">922 443 900</a></p>
                <div className="text-gray-400">
                  <p>Mon &amp; Thu: 13:00 – 18:00</p>
                  <p>Fri: 13:00 – 23:00</p>
                  <p>Sat: 12:00 – 23:00</p>
                  <p>Sun: 12:00 – 20:00</p>
                </div>
                <a href="https://maps.google.com/?q=Carr.+de+la+Esperanza+Km4.8,+La+Esperanza" target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-amber-500 underline transition hover:text-amber-400">View on Google Maps →</a>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* ── Menu & Pricing ── */}
        <motion.div
          id="menu"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <div className="mb-12 text-center">
            <span className="mb-4 block text-xs uppercase tracking-[0.3em] text-amber-500/60">Menu &amp; Prices</span>
            <h2 className="text-3xl font-bold text-white md:text-4xl">Our Rodizio Experience</h2>
            <p className="mx-auto mt-4 max-w-xl text-gray-400">All-you-can-eat rodizio including hot &amp; cold buffet and traditional sides.</p>
          </div>

          {/* Pricing cards */}
          <div className="mb-16 grid gap-6 md:grid-cols-3">
            {[
              { label: "Adults", price: "31.90", desc: "Full rodizio + buffet", popular: true },
              { label: "Kids", price: "17.90", desc: "Ages 4–12, rodizio + buffet", popular: false },
              { label: "Desserts", price: "4.90", desc: "Homemade desserts per portion", popular: false },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className={\`relative rounded-2xl border p-8 text-center backdrop-blur-sm \${
                  item.popular
                    ? "border-amber-500/50 bg-amber-500/10 shadow-lg shadow-amber-500/10"
                    : "border-white/10 bg-white/5"
                }\`}
              >
                {item.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-500 px-4 py-1 text-xs font-semibold text-black">
                    Most Popular
                  </span>
                )}
                <h3 className="mb-2 text-lg font-semibold text-white">{item.label}</h3>
                <p className="mb-4 text-4xl font-black text-white">
                  <span className="text-lg font-normal text-gray-400">€</span>{item.price}
                </p>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Meat selection */}
          <h3 className="mb-8 text-center text-2xl font-bold text-white">Premium Cuts</h3>
          <div className="mb-16 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {MEATS.map((meat, i) => (
              <motion.div
                key={meat.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                className="group rounded-xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-amber-600/30 hover:bg-white/[0.06]"
              >
                <span className="mb-2 inline-block rounded bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-400">#{i + 1}</span>
                <h4 className="text-base font-semibold text-white">{meat.name}</h4>
                <p className="mt-1 text-xs text-gray-400">{meat.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Starters */}
          <h3 className="mb-8 text-center text-2xl font-bold text-white">Starters &amp; Sides</h3>
          <div className="mb-16 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {STARTERS.map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-amber-600/30 hover:bg-white/[0.06]"
              >
                <h4 className="text-base font-semibold text-white">{item.name}</h4>
                <p className="mt-1 text-xs text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Desserts */}
          <h3 className="mb-8 text-center text-2xl font-bold text-white">Homemade Desserts</h3>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {DESSERTS.map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-5 text-center transition hover:border-amber-600/30 hover:bg-white/[0.06]"
              >
                <h4 className="text-sm font-semibold text-white">{item.name}</h4>
                <p className="mt-1 text-xs text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
`;
}

// ─── Reviews ──────────────────────────────────────────────────────

function generateReviews(reviews: Review[]): string {
  const reviewsJson = JSON.stringify(reviews);

  return `// Auto-generated Reviews component — framer-motion staggered cards
"use client";

import { motion } from "framer-motion";

const REVIEWS: Array<{ author: string; text: string; rating: number; source: string }> = ${reviewsJson};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={\`text-sm \${
          star <= rating ? "text-amber-400" : "text-gray-600"
        }\`}>★</span>
      ))}
    </div>
  );
}

export default function Reviews() {
  return (
    <section id="reviews" className="relative px-4 py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0d] via-[#1a0a0a] to-[#0d0d0d]" />
      <div className="relative z-10 container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <span className="mb-4 block text-xs uppercase tracking-[0.3em] text-amber-500/60">Testimonials</span>
          <h2 className="text-3xl font-bold text-white md:text-4xl">What Our Guests Say</h2>
          <p className="mx-auto mt-3 max-w-xl text-gray-400">Real reviews from real guests across Tenerife.</p>
        </motion.div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {REVIEWS.map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="rounded-xl border border-white/10 bg-white/5 p-6 shadow-sm backdrop-blur-sm transition hover:border-amber-600/30 hover:bg-white/10"
            >
              <StarRating rating={review.rating} />
              <p className="mt-3 text-sm leading-relaxed text-gray-300">"{review.text}"</p>
              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-gray-400">
                <span className="font-medium text-white">— {review.author}</span>
                <span className="text-amber-400/80">{review.source}</span>
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

// ─── Contact (both locations) ─────────────────────────────────────

function generateContact(site: ScrapedSite | null, business: BusinessData | null, config: ThemeConfig): string {
  return `// Auto-generated Contact — both locations, framer-motion
"use client";

import { motion } from "framer-motion";

export default function Contact() {
  return (
    <section id="contact" className="relative px-4 py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0d] via-black to-[#0d0d0d]" />
      <div className="relative z-10 container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <span className="mb-4 block text-xs uppercase tracking-[0.3em] text-amber-500/60">Contact</span>
          <h2 className="text-3xl font-bold text-white md:text-4xl">Get in Touch</h2>
          <p className="mx-auto mt-3 max-w-xl text-gray-400">Reserve your table or ask us anything.</p>
        </motion.div>

        <div className="grid gap-10 md:grid-cols-2">
          {/* Locations grid */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* SUR location */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <h3 className="mb-4 text-lg font-bold text-white">
                Rodeo Grill <span className="text-amber-400">SUR</span>
                <span className="ml-2 text-sm font-normal text-gray-400">— Costa Adeje</span>
              </h3>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5">📍</span>
                  <span>C. Dublin 1, 38660 Costa Adeje, Tenerife</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5">📞</span>
                  <a href="tel:+34922713255" className="text-amber-400 transition hover:text-amber-300">922 713 255</a>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5">✉️</span>
                  <a href="mailto:rodeosur@rodizio.com" className="text-amber-400 transition hover:text-amber-300">rodeosur@rodizio.com</a>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5">🕐</span>
                  <div>
                    <p>Wed — Sun: 14:00 – 23:00</p>
                    <p className="text-gray-500">Closed Mon &amp; Tue</p>
                  </div>
                </div>
              </div>
            </div>

            {/* NORTE location */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <h3 className="mb-4 text-lg font-bold text-white">
                Rodeo Grill <span className="text-amber-400">NORTE</span>
                <span className="ml-2 text-sm font-normal text-gray-400">— La Esperanza</span>
              </h3>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5">📍</span>
                  <span>Carr. de la Esperanza Km4.8, La Esperanza, Tenerife</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5">📞</span>
                  <a href="tel:+34922443900" className="text-amber-400 transition hover:text-amber-300">922 443 900</a>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5">✉️</span>
                  <a href="mailto:rodeonorte@rodizio.com" className="text-amber-400 transition hover:text-amber-300">rodeonorte@rodizio.com</a>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5">🕐</span>
                  <div>
                    <p>Mon &amp; Thu: 13:00 – 18:00</p>
                    <p>Fri: 13:00 – 23:00</p>
                    <p>Sat: 12:00 – 23:00</p>
                    <p>Sun: 12:00 – 20:00</p>
                    <p className="text-gray-500">Closed Tue &amp; Wed</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm"
          >
            <h3 className="mb-6 text-lg font-semibold text-white">Send Us a Message</h3>
            <form className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Your Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-gray-500 transition focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Your Email</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-gray-500 transition focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Preferred Location</label>
                <select className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-white transition focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20">
                  <option value="sur" className="bg-black">Rodeo Grill SUR — Costa Adeje</option>
                  <option value="norte" className="bg-black">Rodeo Grill NORTE — La Esperanza</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Your Message</label>
                <textarea
                  placeholder="Tell us about your reservation or inquiry..."
                  rows={4}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-gray-500 transition focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 px-6 py-3.5 text-sm font-semibold text-black shadow-lg transition hover:from-amber-500 hover:to-amber-400 hover:shadow-xl"
              >
                Send Message
              </motion.button>
            </form>
          </motion.div>
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
"use client";

import { motion } from "framer-motion";
import Header from "@/components/theme/Header";
import Footer from "@/components/theme/Footer";
import Hero from "@/components/theme/Hero";
import About from "@/components/theme/About";
import Services from "@/components/theme/Services";
import Reviews from "@/components/theme/Reviews";
import Contact from "@/components/theme/Contact";

export default function GeneratedPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex min-h-screen flex-col bg-black text-white"
    >
      <Header />
      <main className="flex-1">
        <Hero />
        <About />
        <Services />
        <Reviews />
        <Contact />
      </main>
      <Footer />
    </motion.div>
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
  console.log(`   Nav links: ${buildNavLinks(pageSlugs).length} (section anchors)`);

  return config;
}

export { buildNavLinks, type SitePage };
