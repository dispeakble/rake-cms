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
  travel: { primary: "#0d9488", secondary: "#d97706", accent: "#fffbeb" },
  other: { primary: "#3b82f6", secondary: "#6b7280", accent: "#f9fafb" },
};

const INDUSTRY_FONTS: Record<BusinessType, string> = {
  restaurant: "Inter", retail: "Inter", service: "Inter", professional: "Merriweather",
  healthcare: "Inter", education: "Lora", technology: "Inter",
  "real-estate": "Inter", construction: "Inter", creative: "Poppins", travel: "Inter", other: "Inter",
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

  // Dynamic CTA text based on business type
  const ctaPrimary = config.businessType === "restaurant"
    ? "Explore Menu &amp; Prices"
    : "Explore Our Services";
  const ctaSecondary = config.businessType === "restaurant"
    ? "Reserve Your Table"
    : "Get in Touch";

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
            ${escapeJsx(content.tagline?.split(",")[0]?.trim() || "Welcome")}
          </span>
        </motion.div>

        {/* ── 3. Animated Gradient Text on Tagline ── */}
        <motion.h1
          variants={childVariants}
          className="mb-6 text-5xl font-black tracking-tight md:text-7xl lg:text-8xl"
        >
          ${escapeJsx(content.tagline || "Welcome")}
        </motion.h1>

        {/* ── 4. Typewriter / Staggered Subtitle ── */}
        <motion.p
          variants={childVariants}
          className="mx-auto mb-12 max-w-2xl text-lg text-white/70 md:text-xl"
        >
          {"${escapeJsx(content.heroSubtitle || "Welcome to our establishment. We look forward to serving you.")}".split("").map((char, i) => (
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
            <span className="relative z-10">${ctaPrimary}</span>
          </Link>
          <Link
            href="/#contact"
            className="shimmer-btn relative inline-flex items-center rounded-xl border-2 border-white/30 px-10 py-4 font-bold text-white transition-all duration-300 hover:border-[#D4A017] hover:bg-[#D4A017]/10 hover:shadow-[0_0_30px_rgba(212,160,23,0.3)] hover:scale-105 active:scale-95"
          >
            <span className="relative z-10">${ctaSecondary}</span>
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
              ${escapeJsx(content.tagline?.split(",")[0]?.trim() || "About Us")}
            </motion.span>
            <motion.h2
              variants={springUp}
              className="mb-6 text-3xl font-bold md:text-4xl gradient-text"
            >
              ${escapeJsx(content.aboutHeading || "About Us")}
            </motion.h2>
            <motion.p
              variants={springUp}
              className="mb-4 leading-relaxed text-gray-300"
            >
              ${escapeJsx(content.aboutParagraphs[0] || "Welcome to our establishment. We're dedicated to providing an exceptional experience for every guest.")}
            </motion.p>
            <motion.p
              variants={springUp}
              className="mb-4 leading-relaxed text-gray-300"
            >
              ${escapeJsx(content.aboutParagraphs[1] || "Our team is committed to quality and service, ensuring every visit is memorable.")}
            </motion.p>
            <motion.p
              variants={springUp}
              className="leading-relaxed text-gray-300"
            >
              ${escapeJsx(content.aboutParagraphs[2] || "We invite you to join us and discover what makes us special.")}
            </motion.p>

            {/* ── 2. Animated Counter Stats ── */}
            <motion.div
              variants={springUp}
              className="mt-8 grid grid-cols-3 gap-4"
            >
              {[
                { value: 500, label: "Happy Clients", suffix: "+" },
                { value: 15, label: "Years Experience", suffix: "+" },
                { value: 99, label: "Satisfaction", suffix: "%" },
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
  const services = content.services && content.services.length > 0
    ? content.services
    : [{ title: config.name || "Our Services", description: "Discover what we offer." }];
  const servicesJson = JSON.stringify(services);
  const bizName = escapeJsx(config.name || "Our Business");

  return `// ============================================================
//  Services — 3D Perspective Tilt + Glowing Borders + Pulse Dots
//  MAXIMUM WOW EDITION
// ============================================================

"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { useRef } from "react";

const SERVICES = ${servicesJson};

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
        {/* ── Our Services ── */}
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
              What We Offer
            </motion.span>
            <h2 className="text-3xl font-bold text-white md:text-4xl gradient-text">Our Services</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service, i) => (
              <TiltCard key={i} className="rounded-2xl p-[1px] glow-card">
                <div className="relative rounded-2xl bg-[#0a0a0f] p-8 h-full">
                  <span className="mb-2 inline-block rounded bg-[#D4A017]/20 px-2 py-0.5 text-xs font-medium text-[#D4A017]">#{(i + 1).toString().padStart(2, "0")}</span>
                  <h3 className="mb-3 text-xl font-bold text-white">{service.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-300">{service.description}</p>
                </div>
              </TiltCard>
            ))}
          </div>
        </motion.div>

        {/* ── Menu / More Services ── */}
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
              Explore
            </motion.span>
            <h2 className="text-3xl font-bold text-white md:text-4xl gradient-text">Everything We Offer</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, type: "spring", stiffness: 100, damping: 15 }}
                whileHover={{ y: -8, scale: 1.03 }}
                className="relative rounded-2xl p-[1px] overflow-hidden bg-white/10"
              >
                <div className="relative rounded-2xl p-8 text-center h-full glass">
                  <h3 className="mb-2 text-lg font-semibold text-white">{service.title}</h3>
                  <p className="text-sm text-gray-400">{service.description}</p>
                </div>
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
          <h2 className="text-3xl font-bold text-white md:text-4xl gradient-text">What Our Clients Say</h2>
          <p className="mx-auto mt-3 max-w-xl text-gray-400">Real reviews from real customers.</p>
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
          <p className="mx-auto mt-3 max-w-xl text-gray-400">Get in touch with us for inquiries or bookings.</p>
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
            {/* Business location — Hover Lift Card */}
            <motion.div
              whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(212,160,23,0.1)" }}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-[#D4A017]/30"
            >
              <h3 className="mb-4 text-lg font-bold text-white">
                <span className="text-[#D4A017]">📍</span> ${escapeJsx(config.name || "Our Location")}
              </h3>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5">📍</span>
                  <span>Contact us for our exact location and directions.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5">📞</span>
                  <a href="tel:" className="text-[#D4A017] transition hover:text-[#F5D061]">Call us for more information</a>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5">✉️</span>
                  <a href="mailto:" className="text-[#D4A017] transition hover:text-[#F5D061]">Email us for inquiries</a>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5">🕐</span>
                  <div>
                    <p>Mon — Fri: 09:00 – 18:00</p>
                    <p className="text-gray-500">Weekend hours may vary</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Additional contact info — Hover Lift Card */}
            <motion.div
              whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(212,160,23,0.1)" }}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-[#D4A017]/30"
            >
              <h3 className="mb-4 text-lg font-bold text-white">
                <span className="text-[#D4A017]">📋</span> Get in Touch
              </h3>
              <div className="space-y-3 text-sm text-gray-300">
                <p>We'd love to hear from you! Whether you have a question about our services, need assistance planning your visit, or just want to say hello, feel free to reach out.</p>
                <div className="mt-4 pt-3 border-t border-white/10">
                  <p className="text-xs text-gray-400">We typically respond within 24 hours.</p>
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
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Subject</label>
                <motion.select
                  whileFocus={{ scale: 1.01 }}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-white transition-all duration-300 focus:border-[#D4A017] focus:outline-none focus:ring-[3px] focus:ring-[#D4A017]/20 focus:shadow-[0_0_20px_rgba(212,160,23,0.15)]"
                >
                  <option value="general" className="bg-black">General Inquiry</option>
                  <option value="booking" className="bg-black">Booking / Reservation</option>
                  <option value="support" className="bg-black">Customer Support</option>
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

function generateFooter(business: BusinessData | null, name: string, pageSlugs: SitePage[], content: GeneratedContent): string {
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
              ${escapeJsx(content.heroSubtitle || "Welcome to our establishment. We look forward to serving you.")}
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
  const reviews = getReviews(name, businessType);

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
    { name: "Footer.tsx", content: generateFooter(business, name, pageSlugs, content) },
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
