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
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;").replace(/\\n/g, "\\n").trim();
}

// ─── CSS — MAXIMUM BLING ─────────────────────────────────────────

function generateCss(config: ThemeConfig): string {
  const rgb = hexToRgb(config.primaryColor);
  const secRgb = hexToRgb(config.secondaryColor);
  return `/* Rake CMS — Theme: ${config.name} - MAXIMUM WOW EDITION */

:root {
  --color-primary: ${config.primaryColor};
  --color-primary-rgb: ${rgb};
  --color-secondary: ${config.secondaryColor};
  --color-secondary-rgb: ${secRgb};
  --color-accent: ${config.accentColor};
  --color-gold: #D4A017;
  --color-gold-rgb: 212, 160, 23;
  --color-glow: rgba(212, 160, 23, 0.3);
  --color-glow-intense: rgba(212, 160, 23, 0.6);
  --gradient-main: linear-gradient(135deg, ${config.primaryColor}, ${config.secondaryColor});
  --gradient-glow: radial-gradient(circle at 50% 50%, rgba(212, 160, 23, 0.15), transparent 70%);
  --glass-bg: rgba(255, 255, 255, 0.05);
  --glass-border: rgba(255, 255, 255, 0.1);
  --border-angle: 0deg;
}

/* ── Gradient Text Utility ── */
.gradient-text {
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary), var(--color-gold));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

.gradient-text-gold {
  background: linear-gradient(135deg, #D4A017, #F5D061, #D4A017);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  background-size: 200% 200%;
  animation: gradient 4s ease infinite;
}

/* ── Glassmorphism Utility ── */
.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
}

.glass-strong {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

/* ── Glow Card Utility ── */
.glow-card {
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.glow-card::before {
  content: "";
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  padding: 1px;
  background: conic-gradient(from var(--border-angle), transparent, rgba(212, 160, 23, 0.3), transparent, rgba(212, 160, 23, 0.5), transparent);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: border-rotate 4s linear infinite;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.glow-card:hover::before {
  opacity: 1;
}

.glow-card:hover {
  border-color: transparent;
  background: rgba(255, 255, 255, 0.06);
  box-shadow: 0 0 30px rgba(212, 160, 23, 0.15), 0 0 60px rgba(212, 160, 23, 0.05);
  transform: translateY(-4px);
}

/* ── Shimmer Button Utility ── */
.shimmer-btn {
  position: relative;
  overflow: hidden;
  isolation: isolate;
}

.shimmer-btn::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent);
  transform: translateX(-100%);
  animation: shimmer 2s infinite;
  pointer-events: none;
}

.shimmer-btn-gold::before {
  background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.35), transparent);
}

/* ── Animated Gradient Background ── */
.animated-gradient {
  background: linear-gradient(135deg, ${config.primaryColor}, ${config.secondaryColor}, ${config.primaryColor}, ${config.secondaryColor});
  background-size: 400% 400%;
  animation: gradient 8s ease infinite;
}

/* ── Pulse Glow ── */
.pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

/* ── Floating Animation ── */
.float {
  animation: float 3s ease-in-out infinite;
}
.float-delayed {
  animation: float 4s ease-in-out 1s infinite;
}
.float-slow {
  animation: float 5s ease-in-out 0.5s infinite;
}

/* ── Keyframes ── */
@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(212, 160, 23, 0.3); }
  50% { box-shadow: 0 0 40px rgba(212, 160, 23, 0.6); }
}

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes grain {
  0%, 100% { transform: translate(0, 0); }
  10% { transform: translate(-5%, -5%); }
  20% { transform: translate(-10%, 5%); }
  30% { transform: translate(5%, -10%); }
  40% { transform: translate(-5%, 15%); }
  50% { transform: translate(-10%, 10%); }
  60% { transform: translate(15%, 5%); }
  70% { transform: translate(10%, -5%); }
  80% { transform: translate(-15%, 10%); }
  90% { transform: translate(5%, 5%); }
}

@keyframes border-rotate {
  0% { --border-angle: 0deg; }
  100% { --border-angle: 360deg; }
}

@keyframes sparkle {
  0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
  50% { opacity: 1; transform: scale(1) rotate(180deg); }
}

@keyframes breathe {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.05); }
}

@keyframes drift {
  0% { transform: translate(0, 0) rotate(0deg); }
  33% { transform: translate(20px, -30px) rotate(120deg); }
  66% { transform: translate(-15px, -10px) rotate(240deg); }
  100% { transform: translate(0, 0) rotate(360deg); }
}

/* ── Legacy CSS utility classes ── */
.bg-theme-primary { background-color: var(--color-primary); }
.text-theme-primary { color: var(--color-primary); }
.border-theme-primary { border-color: var(--color-primary); }

/* ── Scrollbar Styling ── */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #0a0a0f; }
::-webkit-scrollbar-thumb { background: linear-gradient(180deg, ${config.primaryColor}, ${config.secondaryColor}); border-radius: 3px; }

/* ── Selection ── */
::selection { background: ${config.primaryColor}55; color: white; }
`;
}

// ─── Section-anchor nav links ─────────────────────────────────────

/**
 * Builds section-anchor nav links for the homepage.
 * Main sections: about, services, locations, menu, reviews, contact.
 * Also includes blog if it's in the pageSlugs list, but as a section anchor.
 */
function buildNavLinks(_pageSlugs: SitePage[]): SitePage[] {
  const sectionLinks: SitePage[] = [
    { slug: "/#about", label: "About" },
    { slug: "/#services", label: "Services" },
    { slug: "/#locations", label: "Locations" },
    { slug: "/#menu", label: "Menu" },
    { slug: "/#reviews", label: "Reviews" },
    { slug: "/#contact", label: "Contact" },
  ];
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

// ─── Header — GLASSMORPHISM WOW ───────────────────────────────────

function generateHeader(name: string, pageSlugs: SitePage[]): string {
  const navLinks = buildNavLinks(pageSlugs);
  const desktopLinks = renderNavLinks(
    navLinks,
    `relative text-sm font-medium text-white/70 transition-colors hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[#D4A017] after:to-[#F5D061] after:transition-all after:duration-300 hover:after:w-full`
  );
  const mobileLinks = renderNavLinks(
    navLinks,
    "text-base font-medium text-white/80 transition hover:text-[#D4A017]",
    true
  );

  return `// ============================================================
//  Header — Scroll-Aware Glassmorphism + Shimmer Nav Hover
//  MAXIMUM WOW EDITION
// ============================================================

"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  const bgOpacity = useTransform(scrollY, [0, 80], [0, 0.85]);
  const blurAmount = useTransform(scrollY, [0, 80], [0, 24]);
  const borderOpacity = useTransform(scrollY, [0, 80], [0, 0.15]);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 25, delay: 0.2 }}
      style={{
        backgroundColor: bgOpacity.get() === 0 ? "transparent" : undefined,
      }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <motion.div
        style={{
          backgroundColor: bgOpacity,
          backdropFilter: \`blur(\${blurAmount}px)\`,
          WebkitBackdropFilter: \`blur(\${blurAmount}px)\`,
          borderColor: \`rgba(255,255,255,\${borderOpacity})\`,
        }}
        className="border-b transition-shadow duration-500"
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          {/* Logo with gradient glow */}
          <Link href="/" className="group relative">
            <span className="text-xl font-black tracking-tight text-white transition-all duration-300 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#D4A017] group-hover:to-[#F5D061]">
              ${escapeJsx(name)}
            </span>
            <span className="absolute -bottom-0.5 left-0 h-[2px] w-0 bg-gradient-to-r from-[#D4A017] to-[#F5D061] transition-all duration-300 group-hover:w-full" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-8 md:flex">
            ${desktopLinks}
          </nav>

          {/* Mobile Hamburger */}
          <button
            className="relative z-50 flex h-10 w-10 items-center justify-center text-white md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <motion.span
              animate={open ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              className="absolute h-[2px] w-6 bg-white rounded-full"
            />
            <motion.span
              animate={open ? { opacity: 0 } : { opacity: 1 }}
              className="absolute h-[2px] w-6 bg-white rounded-full"
            />
            <motion.span
              animate={open ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
              className="absolute h-[2px] w-6 bg-white rounded-full"
            />
          </button>
        </div>
      </motion.div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ height: "auto", opacity: 1, backdropFilter: "blur(24px)" }}
            exit={{ height: 0, opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.35 }}
            className="overflow-hidden border-b border-white/10 bg-black/90 backdrop-blur-2xl"
          >
            <div className="flex flex-col gap-4 px-4 py-8">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.06 } },
                }}
                className="flex flex-col gap-4"
              >
                ${mobileLinks.split("\\n").map(l => l.trim()).join("\\n")}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
`;
}

// ─── Hero — MAXIMUM WOW ───────────────────────────────────────────

function generateHero(content: GeneratedContent, config: ThemeConfig, heroPhoto: string | null): string {
  const bgStyle = heroPhoto
    ? `backgroundImage: 'url(${heroPhoto})', backgroundSize: 'cover', backgroundPosition: 'center'`
    : `background: 'linear-gradient(135deg, ${config.primaryColor}, ${config.secondaryColor})'`;

  return `// ============================================================
//  Hero — Animated Gradient Mesh + Floating Particles + Shimmer CTAs
//  MAXIMUM WOW EDITION
// ============================================================

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
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0.2]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.4 },
    },
  };

  const childVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
  };

  return (
    <section
      ref={ref}
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4"
      style={{ ${bgStyle} }}
    >
      {/* ── 1. Animated Mesh/Gradient Background ── */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background: "linear-gradient(135deg, #8B1A1A 0%, #D4A017 25%, #1a0a0a 50%, #8B1A1A 75%, #D4A017 100%)",
          backgroundSize: "400% 400%",
          animation: "gradient 8s ease infinite",
        }}
      />

      {/* ── 2. Floating Glow Particles / Embers (6+ circles) ── */}
      <motion.div
        className="absolute top-[15%] left-[10%] h-4 w-4 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(212,160,23,0.8), transparent)" }}
        animate={{ y: [0, -30, 0], x: [0, 15, 0], opacity: [0.4, 1, 0.4] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[25%] right-[15%] h-6 w-6 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(212,160,23,0.6), transparent)" }}
        animate={{ y: [0, -25, 0], x: [0, -10, 0], opacity: [0.3, 0.8, 0.3] }}
        transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.5 }}
      />
      <motion.div
        className="absolute bottom-[30%] left-[20%] h-3 w-3 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(139,26,26,0.8), transparent)" }}
        animate={{ y: [0, -20, 0], x: [0, -12, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute bottom-[20%] right-[25%] h-5 w-5 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(245,208,97,0.7), transparent)" }}
        animate={{ y: [0, -35, 0], x: [0, 8, 0], opacity: [0.2, 0.9, 0.2] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 0.2 }}
      />
      <motion.div
        className="absolute top-[40%] left-[40%] h-8 w-8 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(212,160,23,0.5), transparent)" }}
        animate={{ y: [0, -15, 0], x: [0, 20, 0], opacity: [0.1, 0.6, 0.1] }}
        transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1.5 }}
      />
      <motion.div
        className="absolute top-[60%] right-[10%] h-3 w-3 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(139,26,26,0.9), transparent)" }}
        animate={{ y: [0, -22, 0], x: [0, -5, 0], opacity: [0.3, 0.7, 0.3] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.8 }}
      />

      {/* ── 7. Decorative Radial Gradient Overlay (pulsing) ── */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(212,160,23,0.12), transparent 60%)",
        }}
        animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
      />

      {/* ── Parallax Background Layer ── */}
      <motion.div
        className="absolute inset-0 bg-black/50"
        style={{ y, opacity }}
      />

      {/* ── Content ── */}
      <motion.div
        className="relative z-10 mx-auto max-w-4xl text-center text-white"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Subtitle badge */}
        <motion.div
          variants={childVariants}
          className="mb-6 inline-block"
        >
          <span className="inline-block rounded-full border border-[#D4A017]/30 bg-[#D4A017]/10 px-6 py-2 text-xs uppercase tracking-[0.3em] text-[#D4A017] backdrop-blur-sm">
            ✦ Brazilian Rodizio ✦
          </span>
        </motion.div>

        {/* ── 3. Animated Gradient Text on Tagline ── */}
        <motion.h1
          variants={childVariants}
          className="mb-6 text-5xl font-black tracking-tight md:text-7xl lg:text-8xl"
        >
          CARNE SIN FIN,
          <br />
          <span className="gradient-text-gold inline-block">
            SABOR SIN LÍMITE
          </span>
        </motion.h1>

        {/* ── 4. Typewriter / Staggered Subtitle ── */}
        <motion.p
          variants={childVariants}
          className="mx-auto mb-12 max-w-2xl text-lg text-white/70 md:text-xl"
        >
          {"${escapeJsx(content.heroSubtitle || "Discover the authentic Brazilian rodizio experience — an endless parade of premium grilled meats, carved tableside by our expert passadores.")}".split("").map((char, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.015, duration: 0.3 }}
              className="inline-block"
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </motion.p>

        {/* ── 5. Two Shimmer CTA Buttons ── */}
        <motion.div
          variants={childVariants}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            href="/#menu"
            className="shimmer-btn shimmer-btn-gold relative inline-flex items-center rounded-xl bg-gradient-to-r from-[#8B1A1A] to-[#D4A017] px-10 py-4 font-bold text-white shadow-[0_0_20px_rgba(212,160,23,0.3)] transition-all duration-300 hover:shadow-[0_0_40px_rgba(212,160,23,0.5)] hover:scale-105 active:scale-95"
          >
            <span className="relative z-10">Explore Menu &amp; Prices</span>
          </Link>
          <Link
            href="/#contact"
            className="shimmer-btn relative inline-flex items-center rounded-xl border-2 border-white/30 px-10 py-4 font-bold text-white transition-all duration-300 hover:border-[#D4A017] hover:bg-[#D4A017]/10 hover:shadow-[0_0_30px_rgba(212,160,23,0.3)] hover:scale-105 active:scale-95"
          >
            <span className="relative z-10">Reserve Your Table</span>
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs uppercase tracking-[0.2em] text-white/30">Scroll</span>
          <div className="h-8 w-[1px] bg-gradient-to-b from-[#D4A017] to-transparent" />
        </div>
      </motion.div>
    </section>
  );
}
`;
}

// ─── About — SPRING REVEAL + COUNTERS + GLASSMORPHISM ────────────

function generateAbout(content: GeneratedContent, photo: string | null): string {
  const imgHtml = photo
    ? `<motion.div
              className="relative overflow-hidden rounded-2xl"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-[#D4A017]/20 via-[#8B1A1A]/20 to-[#D4A017]/20 rounded-2xl animate-[spin-slow_8s_linear_infinite] blur-2xl" />
              <div className="relative overflow-hidden rounded-2xl">
                <img src="${photo}" alt="${escapeJsx(content.aboutHeading)}" className="h-full w-full object-cover" />
              </div>
            </motion.div>`
    : `<motion.div
              className="aspect-square rounded-2xl bg-gradient-to-br from-[#D4A017]/30 via-[#8B1A1A]/20 to-black animate-[spin-slow_10s_linear_infinite]"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            />`;

  return `// ============================================================
//  About — Spring Reveal + Animated Counters + Glassmorphism
//  MAXIMUM WOW EDITION
// ============================================================

"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

function AnimatedCounter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const steps = 60;
    const increment = end / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, end]);

  return (
    <span ref={ref} className="tabular-nums">
      {count}{suffix}
    </span>
  );
}

export default function About() {
  const sectionRef = useRef<HTMLDivElement>(null);

  const springUp = {
    hidden: { opacity: 0, y: 60, scale: 0.95 } as const,
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 },
    },
  };

  return (
    <section id="about" ref={sectionRef} className="relative px-4 py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#1a0a0a] to-black opacity-90" />
      <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, rgba(212,160,23,0.05), transparent 50%)" }} />

      <div className="relative z-10 container mx-auto max-w-6xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid items-center gap-12 md:grid-cols-2"
        >
          {/* Left Content */}
          <div>
            {/* ── 5. Gradient Text on Heading ── */}
            <motion.span
              variants={springUp}
              className="mb-4 block text-xs uppercase tracking-[0.3em] text-[#D4A017]/80"
            >
              Our Story
            </motion.span>
            <motion.h2
              variants={springUp}
              className="mb-6 text-3xl font-bold md:text-4xl gradient-text"
            >
              ${escapeJsx(content.aboutHeading || "The Rodizio Experience")}
            </motion.h2>
            <motion.p
              variants={springUp}
              className="mb-4 leading-relaxed text-gray-300"
            >
              Step into ${escapeJsx(content.aboutHeading?.split(" in ")[0] || "our restaurant")} and experience the centuries-old gaucho tradition of rodizio — a continuous service of fire-grilled meats, carved directly onto your plate by our skilled passadores. Each cut is seasoned with coarse sea salt and grilled over open flames to perfection.
            </motion.p>
            <motion.p
              variants={springUp}
              className="mb-4 leading-relaxed text-gray-300"
            >
              From the coveted picanha (prime rump cap) to succulent costela (beef ribs) and tender alcatra (top sirloin), our rotating selection features 12+ premium cuts brought to your table on skewers. Use the color-coded card — green means "keep them coming," red means "I need a moment."
            </motion.p>
            <motion.p
              variants={springUp}
              className="leading-relaxed text-gray-300"
            >
              Complement your feast with our hot and cold buffet of traditional Brazilian sides — garlic bread, black beans, rice, farofa, fried bananas, and fresh salads. Save room for dessert and finish with a caipirinha, Brazil's national cocktail.
            </motion.p>

            {/* ── 2. Animated Counter Stats ── */}
            <motion.div
              variants={springUp}
              className="mt-8 grid grid-cols-3 gap-4"
            >
              {[
                { value: 14, label: "Premium Cuts", suffix: "+" },
                { value: 842, label: "Happy Guests", suffix: "+" },
                { value: 23, label: "Years Serving", suffix: "+" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-sm"
                >
                  <div className="text-2xl font-black text-[#D4A017]">
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="mt-1 text-xs text-gray-400">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Image with Rotating Glow */}
          <motion.div
            variants={springUp}
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

// ─── Services — 3D TILT + GLOWING BORDERS + PULSE DOTS ───────────

function generateServices(content: GeneratedContent, config: ThemeConfig): string {
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

  return `// ============================================================
//  Services — 3D Perspective Tilt + Glowing Borders + Pulse Dots
//  MAXIMUM WOW EDITION
// ============================================================

"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { useRef } from "react";

const MEATS = ${meatsJson};
const STARTERS = ${startersJson};
const DESSERTS = ${dessertsJson};

function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-8, 8]);

  function handleMouseMove(e: React.MouseEvent) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const width = rect.width;
    const height = rect.height;
    const mx = (e.clientX - rect.left) / width - 0.5;
    const my = (e.clientY - rect.top) / height - 0.5;
    x.set(mx);
    y.set(my);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      transition={{ type: "spring", stiffness: 150, damping: 20 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Services() {
  return (
    <section id="services" className="relative px-4 py-24 overflow-hidden">
      {/* Animated Background Mesh */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0d] via-[#1a0808] to-[#0d0d0d]" />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: \`
            radial-gradient(circle at 20% 30%, rgba(139,26,26,0.3), transparent 40%),
            radial-gradient(circle at 80% 70%, rgba(212,160,23,0.2), transparent 40%),
            radial-gradient(circle at 50% 50%, rgba(139,26,26,0.15), transparent 50%)
          \`,
          backgroundSize: "100% 100%",
          animation: "breathe 6s ease-in-out infinite",
        }}
      />

      <div className="relative z-10 container mx-auto max-w-6xl">
        {/* ── Locations ── */}
        <motion.div
          id="locations"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 80, damping: 15 }}
          className="mb-20"
        >
          <div className="mb-12 text-center">
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mb-4 block text-xs uppercase tracking-[0.3em] text-[#D4A017]/60"
            >
              Our Locations
            </motion.span>
            <h2 className="text-3xl font-bold text-white md:text-4xl gradient-text">Find Your Nearest Rodeo Grill</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            {/* SUR */}
            <TiltCard className="rounded-2xl p-[1px] glow-card">
              <div className="relative rounded-2xl bg-[#0a0a0f] p-8 h-full">
                {/* Pulse dot indicator */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4A017] opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#D4A017]" />
                  </span>
                  <span className="text-xs text-[#D4A017]/60">Open Now</span>
                </div>
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D4A017]/20 text-lg">📍</span>
                  <h3 className="text-xl font-bold text-white">Rodeo Grill <span className="text-[#D4A017]">SUR</span></h3>
                </div>
                <div className="space-y-3 text-sm text-gray-300">
                  <p className="font-medium text-white">Costa Adeje</p>
                  <p>C. Dublin 1, 38660 Costa Adeje</p>
                  <p>📞 <a href="tel:+349****3255" className="text-[#D4A017] transition hover:text-[#F5D061]">922 713 255</a></p>
                  <p className="text-gray-400">Wed — Sun: 14:00 – 23:00</p>
                  <a href="https://maps.google.com/?q=C.+Dublin+1,+38660+Costa+Adeje" target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-[#D4A017] underline transition hover:text-[#F5D061]">View on Google Maps →</a>
                </div>
              </div>
            </TiltCard>
            {/* NORTE */}
            <TiltCard className="rounded-2xl p-[1px] glow-card">
              <div className="relative rounded-2xl bg-[#0a0a0f] p-8 h-full">
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4A017] opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#D4A017]" />
                  </span>
                  <span className="text-xs text-[#D4A017]/60">Open Now</span>
                </div>
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D4A017]/20 text-lg">📍</span>
                  <h3 className="text-xl font-bold text-white">Rodeo Grill <span className="text-[#D4A017]">NORTE</span></h3>
                </div>
                <div className="space-y-3 text-sm text-gray-300">
                  <p className="font-medium text-white">La Esperanza</p>
                  <p>Carr. de la Esperanza Km4.8, La Esperanza</p>
                  <p>📞 <a href="tel:+349****3900" className="text-[#D4A017] transition hover:text-[#F5D061]">922 443 900</a></p>
                  <div className="text-gray-400">
                    <p>Mon &amp; Thu: 13:00 – 18:00</p>
                    <p>Fri: 13:00 – 23:00</p>
                    <p>Sat: 12:00 – 23:00</p>
                    <p>Sun: 12:00 – 20:00</p>
                  </div>
                  <a href="https://maps.google.com/?q=Carr.+de+la+Esperanza+Km4.8,+La+Esperanza" target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-[#D4A017] underline transition hover:text-[#F5D061]">View on Google Maps →</a>
                </div>
              </div>
            </TiltCard>
          </div>
        </motion.div>

        {/* ── Menu & Pricing ── */}
        <motion.div
          id="menu"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 80, damping: 15 }}
          className="mb-20"
        >
          <div className="mb-12 text-center">
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mb-4 block text-xs uppercase tracking-[0.3em] text-[#D4A017]/60"
            >
              Menu &amp; Prices
            </motion.span>
            <h2 className="text-3xl font-bold text-white md:text-4xl gradient-text">Our Rodizio Experience</h2>
            <p className="mx-auto mt-4 max-w-xl text-gray-400">All-you-can-eat rodizio including hot &amp; cold buffet and traditional sides.</p>
          </div>

          {/* ── Glassmorphism Pricing Cards ── */}
          <div className="mb-16 grid gap-6 md:grid-cols-3">
            {[
              { label: "Adults", price: "31.90", desc: "Full rodizio + buffet", popular: true },
              { label: "Kids", price: "17.90", desc: "Ages 4–12, rodizio + buffet", popular: false },
              { label: "Desserts", price: "4.90", desc: "Homemade desserts per portion", popular: false },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, type: "spring", stiffness: 100, damping: 15 }}
                whileHover={{ y: -8, scale: 1.03 }}
                className={\`relative rounded-2xl p-[1px] overflow-hidden \${
                  item.popular
                    ? "bg-gradient-to-b from-[#D4A017] via-[#8B1A1A] to-[#D4A017]"
                    : "bg-white/10"
                }\`}
              >
                <div className={\`relative rounded-2xl p-8 text-center h-full \${
                  item.popular
                    ? "bg-[#0a0a0f]"
                    : "glass"
                }\`}>
                  {item.popular && (
                    <motion.span
                      initial={{ y: -20, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#D4A017] to-[#F5D061] px-4 py-1 text-xs font-bold text-black shadow-lg"
                    >
                      ★ Most Popular ★
                    </motion.span>
                  )}
                  <h3 className="mb-2 text-lg font-semibold text-white">{item.label}</h3>
                  {/* ── Animated Price Tag with Glow ── */}
                  <motion.p
                    className="mb-4 text-4xl font-black"
                    whileHover={{ scale: 1.1, textShadow: "0 0 20px rgba(212,160,23,0.6)" }}
                  >
                    <span className="text-lg font-normal text-gray-400">€</span>
                    <span className="gradient-text-gold">{item.price}</span>
                  </motion.p>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ── Gradient Divider ── */}
          <div className="mx-auto mb-12 h-[1px] max-w-2xl bg-gradient-to-r from-transparent via-[#D4A017]/40 to-transparent" />

          {/* Premium Cuts */}
          <h3 className="mb-8 text-center text-2xl font-bold text-white">🔥 Premium Cuts</h3>
          <div className="mb-16 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {MEATS.map((meat, i) => (
              <motion.div
                key={meat.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, type: "spring", stiffness: 100, damping: 12 }}
                whileHover={{ scale: 1.05, y: -4 }}
                className="glow-card rounded-xl p-5"
              >
                <span className="mb-2 inline-block rounded bg-[#D4A017]/20 px-2 py-0.5 text-xs font-medium text-[#D4A017]">#{(i + 1).toString().padStart(2, "0")}</span>
                <h4 className="text-base font-semibold text-white">{meat.name}</h4>
                <p className="mt-1 text-xs text-gray-400">{meat.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Gradient Divider */}
          <div className="mx-auto mb-12 h-[1px] max-w-2xl bg-gradient-to-r from-transparent via-[#D4A017]/30 to-transparent" />

          {/* Starters */}
          <h3 className="mb-8 text-center text-2xl font-bold text-white">🥟 Starters &amp; Sides</h3>
          <div className="mb-16 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {STARTERS.map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, type: "spring", stiffness: 100, damping: 12 }}
                whileHover={{ scale: 1.05, y: -4 }}
                className="glow-card rounded-xl p-5"
              >
                <h4 className="text-base font-semibold text-white">{item.name}</h4>
                <p className="mt-1 text-xs text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Gradient Divider */}
          <div className="mx-auto mb-12 h-[1px] max-w-2xl bg-gradient-to-r from-transparent via-[#D4A017]/30 to-transparent" />

          {/* Desserts */}
          <h3 className="mb-8 text-center text-2xl font-bold text-white">🍰 Homemade Desserts</h3>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {DESSERTS.map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, type: "spring", stiffness: 100, damping: 12 }}
                whileHover={{ scale: 1.08, y: -6 }}
                className="glow-card rounded-xl p-5 text-center"
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

// ─── Reviews — 3D PERSPECTIVE + ANIMATED STARS + GRADIENT QUOTES ──

function generateReviews(reviews: Review[]): string {
  const reviewsJson = JSON.stringify(reviews);

  return `// ============================================================
//  Reviews — 3D Perspective Cards + Sparkle Stars + Gradient Quotes
//  MAXIMUM WOW EDITION
// ============================================================

"use client";

import { motion } from "framer-motion";

const REVIEWS: Array<{ author: string; text: string; rating: number; source: string }> = ${reviewsJson};

function SparkleStar({ filled, delay }: { filled: boolean; delay: number }) {
  return (
    <motion.span
      className={\`relative inline-block text-lg \${
        filled ? "text-[#D4A017]" : "text-gray-600"
      }\`}
      initial={{ opacity: 0, scale: 0, rotate: -180 }}
      whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
      viewport={{ once: true }}
      transition={{ delay, type: "spring", stiffness: 200, damping: 10 }}
    >
      {filled ? "★" : "☆"}
      {filled && (
        <motion.span
          className="absolute -top-1 -right-1 text-[8px] text-[#F5D061]"
          animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0], rotate: [0, 180, 360] }}
          transition={{ repeat: Infinity, duration: 2, delay: delay + 0.5, ease: "easeInOut" }}
        >
          ✦
        </motion.span>
      )}
    </motion.span>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <SparkleStar key={star} filled={star <= rating} delay={star * 0.1} />
      ))}
    </div>
  );
}

export default function Reviews() {
  return (
    <section id="reviews" className="relative px-4 py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0d] via-[#1a0a0a] to-[#0d0d0d]" />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: "radial-gradient(circle at 70% 30%, rgba(212,160,23,0.15), transparent 50%)",
        }}
      />

      <div className="relative z-10 container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 80, damping: 15 }}
          className="mb-12 text-center"
        >
          <span className="mb-4 block text-xs uppercase tracking-[0.3em] text-[#D4A017]/60">Testimonials</span>
          <h2 className="text-3xl font-bold text-white md:text-4xl gradient-text">What Our Guests Say</h2>
          <p className="mx-auto mt-3 max-w-xl text-gray-400">Real reviews from real guests across Tenerife.</p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {REVIEWS.map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40, rotateX: 10, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                delay: i * 0.1,
                type: "spring",
                stiffness: 80,
                damping: 12,
              }}
              whileHover={{
                y: -8,
                scale: 1.02,
                boxShadow: "0 20px 60px rgba(212,160,23,0.15)",
              }}
              className="relative rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm hover:border-[#D4A017]/30"
              style={{ transformPerspective: 800 }}
            >
              {/* Gradient Quote Decoration */}
              <div className="absolute -top-2 -left-2 text-4xl text-[#D4A017]/20 select-none leading-none" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z"/>
                </svg>
              </div>

              <StarRating rating={review.rating} />
              <p className="mt-3 text-sm leading-relaxed text-gray-300 relative z-10">"{review.text}"</p>
              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-gray-400">
                <span className="font-medium text-white">— {review.author}</span>
                <span className="text-[#D4A017]/80">{review.source}</span>
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

// ─── Contact — GRADIENT FORM FIELDS + PULSE BUTTON + LIFT CARDS ──

function generateContact(site: ScrapedSite | null, business: BusinessData | null, config: ThemeConfig): string {
  return `// ============================================================
//  Contact — Animated Gradient Fields + Pulse Button + Hover Lift
//  MAXIMUM WOW EDITION
// ============================================================

"use client";

import { motion } from "framer-motion";

export default function Contact() {
  return (
    <section id="contact" className="relative px-4 py-24 overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0d] via-black to-[#0d0d0d]" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: \`radial-gradient(circle at 25% 25%, #D4A017 1px, transparent 1px),
            radial-gradient(circle at 75% 75%, #8B1A1A 1px, transparent 1px)\`,
          backgroundSize: "60px 60px",
          animation: "drift 20s linear infinite",
        }}
      />

      <div className="relative z-10 container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 80, damping: 15 }}
          className="mb-14 text-center"
        >
          <span className="mb-4 block text-xs uppercase tracking-[0.3em] text-[#D4A017]/60">Contact</span>
          <h2 className="text-3xl font-bold text-white md:text-4xl gradient-text">Get in Touch</h2>
          <p className="mx-auto mt-3 max-w-xl text-gray-400">Reserve your table or ask us anything.</p>
        </motion.div>

        <div className="grid gap-10 md:grid-cols-2">
          {/* Locations grid */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 80, damping: 15 }}
            className="space-y-8"
          >
            {/* SUR location — Hover Lift Card */}
            <motion.div
              whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(212,160,23,0.1)" }}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-[#D4A017]/30"
            >
              <h3 className="mb-4 text-lg font-bold text-white">
                Rodeo Grill <span className="text-[#D4A017]">SUR</span>
                <span className="ml-2 text-sm font-normal text-gray-400">— Costa Adeje</span>
              </h3>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5">📍</span>
                  <span>C. Dublin 1, 38660 Costa Adeje, Tenerife</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5">📞</span>
                  <a href="tel:+349****3255" className="text-[#D4A017] transition hover:text-[#F5D061]">922 713 255</a>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5">✉️</span>
                  <a href="mailto:rodeosur@rodizio.com" className="text-[#D4A017] transition hover:text-[#F5D061]">rodeosur@rodizio.com</a>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5">🕐</span>
                  <div>
                    <p>Wed — Sun: 14:00 – 23:00</p>
                    <p className="text-gray-500">Closed Mon &amp; Tue</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* NORTE location — Hover Lift Card */}
            <motion.div
              whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(212,160,23,0.1)" }}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-[#D4A017]/30"
            >
              <h3 className="mb-4 text-lg font-bold text-white">
                Rodeo Grill <span className="text-[#D4A017]">NORTE</span>
                <span className="ml-2 text-sm font-normal text-gray-400">— La Esperanza</span>
              </h3>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5">📍</span>
                  <span>Carr. de la Esperanza Km4.8, La Esperanza, Tenerife</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5">📞</span>
                  <a href="tel:+349****3900" className="text-[#D4A017] transition hover:text-[#F5D061]">922 443 900</a>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5">✉️</span>
                  <a href="mailto:rodeonorte@rodizio.com" className="text-[#D4A017] transition hover:text-[#F5D061]">rodeonorte@rodizio.com</a>
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
            </motion.div>
          </motion.div>

          {/* Contact form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 80, damping: 15, delay: 0.2 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm"
          >
            <h3 className="mb-6 text-lg font-semibold text-white">Send Us a Message</h3>
            <form className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Your Name</label>
                <motion.input
                  type="text"
                  placeholder="John Doe"
                  whileFocus={{ scale: 1.01 }}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-gray-500 transition-all duration-300 focus:border-[#D4A017] focus:outline-none focus:ring-[3px] focus:ring-[#D4A017]/20 focus:shadow-[0_0_20px_rgba(212,160,23,0.15)]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Your Email</label>
                <motion.input
                  type="email"
                  placeholder="john@example.com"
                  whileFocus={{ scale: 1.01 }}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-gray-500 transition-all duration-300 focus:border-[#D4A017] focus:outline-none focus:ring-[3px] focus:ring-[#D4A017]/20 focus:shadow-[0_0_20px_rgba(212,160,23,0.15)]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Preferred Location</label>
                <motion.select
                  whileFocus={{ scale: 1.01 }}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-white transition-all duration-300 focus:border-[#D4A017] focus:outline-none focus:ring-[3px] focus:ring-[#D4A017]/20 focus:shadow-[0_0_20px_rgba(212,160,23,0.15)]"
                >
                  <option value="sur" className="bg-black">Rodeo Grill SUR — Costa Adeje</option>
                  <option value="norte" className="bg-black">Rodeo Grill NORTE — La Esperanza</option>
                </motion.select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Your Message</label>
                <motion.textarea
                  placeholder="Tell us about your reservation or inquiry..."
                  rows={4}
                  whileFocus={{ scale: 1.01 }}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-gray-500 transition-all duration-300 focus:border-[#D4A017] focus:outline-none focus:ring-[3px] focus:ring-[#D4A017]/20 focus:shadow-[0_0_20px_rgba(212,160,23,0.15)]"
                />
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(212,160,23,0.4)" }}
                whileTap={{ scale: 0.97 }}
                animate={{ boxShadow: ["0 0 15px rgba(212,160,23,0.2)", "0 0 25px rgba(212,160,23,0.4)", "0 0 15px rgba(212,160,23,0.2)"] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="shimmer-btn shimmer-btn-gold relative w-full rounded-lg bg-gradient-to-r from-[#8B1A1A] via-[#D4A017] to-[#8B1A1A] px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:from-[#D4A017] hover:via-[#F5D061] hover:to-[#D4A017]"
              >
                <span className="relative z-10">✨ Send Message ✨</span>
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

// ─── Footer — GRADIENT BG + GLOW LINKS + ANIMATED BORDER ─────────

function generateFooter(business: BusinessData | null, name: string, pageSlugs: SitePage[]): string {
  const year = new Date().getFullYear();
  const navLinks = buildNavLinks(pageSlugs);
  const quickLinks = renderNavLinks(
    navLinks,
    "block text-sm text-gray-400 transition-all duration-300 hover:text-[#D4A017] hover:translate-x-1"
  );

  return `// ============================================================
//  Footer — Gradient Background + Glow Links + Animated Border
//  MAXIMUM WOW EDITION
// ============================================================

"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="relative px-4 py-16 overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0a0f] to-[#1a0a0a]" />
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          background: "linear-gradient(135deg, #8B1A1A 0%, #D4A017 50%, #8B1A1A 100%)",
          backgroundSize: "400% 400%",
          animation: "gradient 6s ease infinite",
        }}
      />

      {/* Animated Border Top */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: "linear-gradient(90deg, transparent, #D4A017, #8B1A1A, #D4A017, transparent)",
          backgroundSize: "200% 100%",
          animation: "gradient 3s linear infinite",
        }}
      />

      <div className="relative z-10 container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 80, damping: 15 }}
          className="grid gap-10 md:grid-cols-4"
        >
          <div className="md:col-span-2">
            <h4 className="mb-4 text-lg font-semibold text-white">
              <span className="gradient-text-gold">${escapeJsx(name)}</span>
            </h4>
            <p className="max-w-sm text-sm leading-relaxed text-gray-400">
              Authentic Brazilian rodizio. Endless meat, bold flavors, unforgettable moments.
            </p>
            {/* Social / Watermark link with Glow Hover */}
            <div className="mt-6 flex gap-4">
              <motion.a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2, y: -2 }}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm text-gray-400 transition-all duration-300 hover:border-[#D4A017]/50 hover:bg-[#D4A017]/10 hover:text-[#D4A017] hover:shadow-[0_0_15px_rgba(212,160,23,0.3)]"
              >
                f
              </motion.a>
              <motion.a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2, y: -2 }}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm text-gray-400 transition-all duration-300 hover:border-[#D4A017]/50 hover:bg-[#D4A017]/10 hover:text-[#D4A017] hover:shadow-[0_0_15px_rgba(212,160,23,0.3)]"
              >
                ig
              </motion.a>
              <motion.a
                href="https://tripadvisor.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2, y: -2 }}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm text-gray-400 transition-all duration-300 hover:border-[#D4A017]/50 hover:bg-[#D4A017]/10 hover:text-[#D4A017] hover:shadow-[0_0_15px_rgba(212,160,23,0.3)]"
              >
                ta
              </motion.a>
            </div>
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
              <motion.a
                href="#"
                whileHover={{ x: 4 }}
                className="block transition-all duration-200 hover:text-[#D4A017]"
              >Facebook</motion.a>
              <motion.a
                href="#"
                whileHover={{ x: 4 }}
                className="block transition-all duration-200 hover:text-[#D4A017]"
              >Instagram</motion.a>
              <motion.a
                href="#"
                whileHover={{ x: 4 }}
                className="block transition-all duration-200 hover:text-[#D4A017]"
              >Tripadvisor</motion.a>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 border-t border-white/10 pt-8 text-center text-sm text-gray-400"
        >
          <p>
            Made with ❤️ by{" "}
            <Link
              href="https://alexawebservers.com"
              className="bg-gradient-to-r from-[#8B1A1A] to-[#D4A017] bg-clip-text text-transparent font-semibold transition-all duration-300 hover:from-[#D4A017] hover:to-[#F5D061] hover:drop-shadow-[0_0_8px_rgba(212,160,23,0.5)]"
              target="_blank"
              rel="noopener noreferrer"
            >
              alexawebservers.com
            </Link>
          </p>
          <p className="mt-1">&copy; ${year} ${escapeJsx(name)}. All rights reserved.</p>
        </motion.div>
      </div>
    </footer>
  );
}
`;
}

// ─── GeneratedPage — AnimatePresence page transition ──────────────

function generateLayout(name: string): string {
  return `// ============================================================
//  GeneratedPage — Smooth Page Transition with AnimatePresence
//  MAXIMUM WOW EDITION
// ============================================================

"use client";

import "./theme.css";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/theme/Header";
import Footer from "@/components/theme/Footer";
import Hero from "@/components/theme/Hero";
import About from "@/components/theme/About";
import Services from "@/components/theme/Services";
import Reviews from "@/components/theme/Reviews";
import Contact from "@/components/theme/Contact";

export default function GeneratedPage() {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="page"
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.98 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
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
    </AnimatePresence>
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

  console.log(`\n🎨 Theme generated for "${name}" — MAXIMUM WOW EDITION:`);
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
