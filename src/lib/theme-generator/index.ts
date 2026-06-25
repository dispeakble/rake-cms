import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
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
  fitness: { primary: "#0D0D0D", secondary: "#FF3131", accent: "#1a1a2e" },
  beauty: { primary: "#1A0A1E", secondary: "#F4C2C2", accent: "#1a1a2e" },
  automotive: { primary: "#0D0D0D", secondary: "#FF2800", accent: "#1a1a2e" },
  other: { primary: "#3b82f6", secondary: "#6b7280", accent: "#f9fafb" },
};

const INDUSTRY_FONTS: Record<BusinessType, string> = {
  restaurant: "Inter", retail: "Inter", service: "Inter", professional: "Merriweather",
  healthcare: "Inter", education: "Lora", technology: "Inter",
  "real-estate": "Inter", construction: "Inter", creative: "Poppins", travel: "Inter", fitness: "Inter", beauty: "Inter", automotive: "Inter", other: "Inter",
};

// ─── Animation library ─────────────────────────────────────────────
// Each animation set defines unique entrance, hover, scroll-reveal, and corner-radius values.
// Selected deterministically via business name hash.

interface AnimationSet {
  name: string;
  /** Framer-motion initial/animate variants for sections */
  entrance: { type: string; direction?: string; distance?: number };
  /** Hover effect on cards */
  hover: { scale: number; y?: number };
  /** Border-radius class */
  radius: string;
  /** Scroll stagger delay per child */
  stagger: number;
}

const ANIMATION_SETS: AnimationSet[] = [
  { name: "Elegant Lift", entrance: { type: "fadeUp", distance: 60 }, hover: { scale: 1.03, y: -6 }, radius: "rounded-2xl", stagger: 0.1 },
  { name: "Smooth Slide", entrance: { type: "slideLeft", distance: 80 }, hover: { scale: 1.02, y: -4 }, radius: "rounded-xl", stagger: 0.08 },
  { name: "Scale Reveal", entrance: { type: "scaleIn", distance: 0.9 }, hover: { scale: 1.05 }, radius: "rounded-3xl", stagger: 0.12 },
  { name: "Sharp Inset", entrance: { type: "slideRight", distance: 70 }, hover: { scale: 1.02, y: -3 }, radius: "rounded-lg", stagger: 0.06 },
  { name: "Float Up", entrance: { type: "fadeUp", distance: 40 }, hover: { scale: 1.04, y: -8 }, radius: "rounded-2xl", stagger: 0.15 },
  { name: "Bold Enter", entrance: { type: "scaleIn", distance: 0.85 }, hover: { scale: 1.06 }, radius: "rounded-xl", stagger: 0.1 },
  { name: "Gentle Rise", entrance: { type: "fadeUp", distance: 50 }, hover: { scale: 1.03, y: -5 }, radius: "rounded-3xl", stagger: 0.09 },
  { name: "Kinetic", entrance: { type: "slideLeft", distance: 100 }, hover: { scale: 1.02, y: -7 }, radius: "rounded-lg", stagger: 0.07 },
  { name: "Soft Zoom", entrance: { type: "scaleIn", distance: 0.92 }, hover: { scale: 1.04, y: -4 }, radius: "rounded-2xl", stagger: 0.11 },
  { name: "Dynamic Sweep", entrance: { type: "slideRight", distance: 60 }, hover: { scale: 1.05, y: -6 }, radius: "rounded-xl", stagger: 0.13 },
];

/** Deterministically choose an animation set from business name + category */
function pickAnimationSet(name: string, businessType: string): AnimationSet {
  const seed = `${name}-${businessType}`;
  const idx = Math.floor(hashFnv32a(seed) * ANIMATION_SETS.length);
  return ANIMATION_SETS[idx % ANIMATION_SETS.length];
}

/** Generate a unique border-radius value based on the animation set */
function getRadiusClass(anim: AnimationSet): string {
  return anim.radius;
}

// ─── Palette helper ───────────────────────────────────────────────

/**
 * Deterministic pseudo-random number from a string hash.
 * Returns a value in [0, 1).
 */
function hashFnv32a(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  // Normalise to [0, 1)
  return (hash >>> 0) / 0x100000000;
}

/**
 * Shift a hex colour by +/-delta in each RGB channel, clamping to valid
 * 8-bit values.  Returns a hex string like "#AABBCC".
 */
function shiftHex(hex: string, delta: number): string {
  const clean = hex.replace("#", "");
  const r = Math.min(255, Math.max(0, parseInt(clean.substring(0, 2), 16) + delta));
  const g = Math.min(255, Math.max(0, parseInt(clean.substring(2, 4), 16) + delta));
  const b = Math.min(255, Math.max(0, parseInt(clean.substring(4, 6), 16) + delta));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/**
 * Multiple palette variants per industry — picked based on business name hash.
 * Each variant is a subtle hue/tone shift from the base, so two restaurants
 * never look identical.
 */
const INDUSTRY_PALETTE_VARIANTS: Record<BusinessType, Array<{ primary: string; secondary: string }>> = {
  restaurant: [
    { primary: "#8B1A1A", secondary: "#D4A017" },  // classic deep red + gold
    { primary: "#1B4332", secondary: "#95D5B2" },  // forest green + sage
    { primary: "#5C164E", secondary: "#E5A100" },  // aubergine + warm gold
    { primary: "#9B2226", secondary: "#E9C46A" },  // brick red + honey
    { primary: "#0D3B66", secondary: "#F4A261" },  // navy + amber
    { primary: "#2D6A4F", secondary: "#FADFAD" },  // forest + cream
    { primary: "#4A0E4E", secondary: "#E76F51" },  // plum + coral
    { primary: "#7D3C3C", secondary: "#F2E8D5" },  // brick + linen
    { primary: "#3B2F2F", secondary: "#E07A5F" },  // espresso + terra cotta
    { primary: "#264653", secondary: "#F4A261" },  // teal-black + tangerine
  ],
  retail: [
    { primary: "#2563eb", secondary: "#7c3aed" },
    { primary: "#0369a1", secondary: "#0891b2" },
    { primary: "#4338ca", secondary: "#c026d3" },
    { primary: "#0A0A23", secondary: "#FF6B6B" },
    { primary: "#2D3436", secondary: "#FD79A8" },
    { primary: "#1A1A2E", secondary: "#E94560" },
    { primary: "#0F3460", secondary: "#E2D1F9" },
    { primary: "#222831", secondary: "#F2A365" },
    { primary: "#3D0C11", secondary: "#F4D03F" },
    { primary: "#1B2021", secondary: "#7C9473" },
  ],
  service: [
    { primary: "#0891b2", secondary: "#059669" },
    { primary: "#0e7490", secondary: "#047857" },
    { primary: "#0284c7", secondary: "#16a34a" },
    { primary: "#003049", secondary: "#D62828" },
    { primary: "#1E3A5F", secondary: "#6C9BCF" },
    { primary: "#0C2340", secondary: "#B3A369" },
    { primary: "#1B2838", secondary: "#5DADE2" },
    { primary: "#1A252F", secondary: "#48C9B0" },
    { primary: "#0C3547", secondary: "#E8DAEF" },
    { primary: "#2C1810", secondary: "#D4AC0D" },
  ],
  professional: [
    { primary: "#1e40af", secondary: "#475569" },
    { primary: "#312e81", secondary: "#52525b" },
    { primary: "#1e3a5f", secondary: "#64748b" },
    { primary: "#1C2331", secondary: "#C5A059" },
    { primary: "#0D1B2A", secondary: "#778DA9" },
    { primary: "#2D3142", secondary: "#BFC0C0" },
    { primary: "#162447", secondary: "#1FA2FF" },
    { primary: "#192A56", secondary: "#BDC581" },
    { primary: "#1A2639", secondary: "#D4C5A9" },
    { primary: "#22333B", secondary: "#C6AC8F" },
  ],
  healthcare: [
    { primary: "#0d9488", secondary: "#0284c7" },
    { primary: "#0f766e", secondary: "#0369a1" },
    { primary: "#14b8a6", secondary: "#0ea5e9" },
    { primary: "#013A63", secondary: "#A9D6E5" },
    { primary: "#01497C", secondary: "#89C2D9" },
    { primary: "#012A4A", secondary: "#D8F3DC" },
    { primary: "#0B525B", secondary: "#B7E4C7" },
    { primary: "#03506F", secondary: "#BBE1FA" },
    { primary: "#1D3557", secondary: "#A8DADC" },
    { primary: "#0A3A40", secondary: "#D4E2D4" },
  ],
  education: [
    { primary: "#7c3aed", secondary: "#2563eb" },
    { primary: "#6d28d9", secondary: "#1d4ed8" },
    { primary: "#9333ea", secondary: "#4f46e5" },
    { primary: "#1A365D", secondary: "#63B3ED" },
    { primary: "#2B6CB0", secondary: "#BEE3F8" },
    { primary: "#171923", secondary: "#F6E05E" },
    { primary: "#1A202C", secondary: "#9F7AEA" },
    { primary: "#234E52", secondary: "#E2E8F0" },
    { primary: "#2C3E50", secondary: "#E67E22" },
    { primary: "#1B365D", secondary: "#C4A35A" },
  ],
  technology: [
    { primary: "#3b82f6", secondary: "#8b5cf6" },
    { primary: "#2563eb", secondary: "#7c3aed" },
    { primary: "#6366f1", secondary: "#a855f7" },
    { primary: "#0D1117", secondary: "#58A6FF" },
    { primary: "#1E1E1E", secondary: "#00FF41" },
    { primary: "#0A0A0A", secondary: "#FF6B35" },
    { primary: "#121212", secondary: "#BB86FC" },
    { primary: "#0B0C10", secondary: "#66FCF1" },
    { primary: "#1F2833", secondary: "#45A29E" },
    { primary: "#111827", secondary: "#10B981" },
  ],
  "real-estate": [
    { primary: "#0f766e", secondary: "#d97706" },
    { primary: "#115e59", secondary: "#b45309" },
    { primary: "#047857", secondary: "#f59e0b" },
    { primary: "#1C2E3F", secondary: "#C9A96E" },
    { primary: "#2C1810", secondary: "#D4C5A9" },
    { primary: "#1B3A3B", secondary: "#E8D5B7" },
    { primary: "#3E2723", secondary: "#F5E6CA" },
    { primary: "#1A1F2B", secondary: "#A8A29E" },
    { primary: "#2D2A26", secondary: "#C6A15B" },
    { primary: "#1E2D3D", secondary: "#B8B5A5" },
  ],
  construction: [
    { primary: "#d97706", secondary: "#dc2626" },
    { primary: "#b45309", secondary: "#ef4444" },
    { primary: "#f59e0b", secondary: "#b91c1c" },
    { primary: "#1A1A1A", secondary: "#F3A712" },
    { primary: "#2C2C2C", secondary: "#E85D04" },
    { primary: "#212529", secondary: "#FFC300" },
    { primary: "#343A40", secondary: "#DC2F02" },
    { primary: "#1F2D3D", secondary: "#F48C06" },
    { primary: "#2B2B2B", secondary: "#FFFF00" },
    { primary: "#3A3A3A", secondary: "#FF5733" },
  ],
  creative: [
    { primary: "#ec4899", secondary: "#8b5cf6" },
    { primary: "#db2777", secondary: "#7c3aed" },
    { primary: "#be185d", secondary: "#6d28d9" },
    { primary: "#2D1B69", secondary: "#FF6B35" },
    { primary: "#0A0A23", secondary: "#00D2FF" },
    { primary: "#1A0A3E", secondary: "#FF2079" },
    { primary: "#0B132B", secondary: "#FF9F1C" },
    { primary: "#1C0E34", secondary: "#7B2D8E" },
    { primary: "#120D31", secondary: "#E2A76F" },
    { primary: "#0D0221", secondary: "#FC28FB" },
  ],
  travel: [
    { primary: "#0d9488", secondary: "#d97706" },
    { primary: "#0f766e", secondary: "#b45309" },
    { primary: "#0891b2", secondary: "#f59e0b" },
    { primary: "#0B3D60", secondary: "#E9C46A" },
    { primary: "#1A2F3A", secondary: "#F4A261" },
    { primary: "#2D3E50", secondary: "#E76F51" },
    { primary: "#0C1B2E", secondary: "#D4A373" },
    { primary: "#143642", secondary: "#F9C784" },
    { primary: "#1E3F4A", secondary: "#E6B89C" },
    { primary: "#0C2D48", secondary: "#FFD166" },
  ],
  fitness: [
    { primary: "#0D0D0D", secondary: "#FF3131" },
    { primary: "#1A1A2E", secondary: "#00FF87" },
    { primary: "#111111", secondary: "#FF6B35" },
    { primary: "#0F0F23", secondary: "#F706CF" },
    { primary: "#1B1B1B", secondary: "#39FF14" },
    { primary: "#0C0C0C", secondary: "#4DEEEA" },
    { primary: "#1E1E1E", secondary: "#FE2C55" },
    { primary: "#121212", secondary: "#FFD700" },
    { primary: "#1C1F26", secondary: "#00E5FF" },
    { primary: "#0A0A0A", secondary: "#FF007F" },
  ],
  beauty: [
    { primary: "#1A0A1E", secondary: "#F4C2C2" },
    { primary: "#2D132C", secondary: "#E8B4B8" },
    { primary: "#1B1220", secondary: "#D4A5A5" },
    { primary: "#0F0F1A", secondary: "#C9A0DC" },
    { primary: "#1C1C1C", secondary: "#FFB6C1" },
    { primary: "#2C1B2D", secondary: "#E6A8D7" },
    { primary: "#1A1414", secondary: "#F5D5D5" },
    { primary: "#231B1F", secondary: "#D4AFB9" },
    { primary: "#1E1A2B", secondary: "#C3B1E1" },
    { primary: "#15101A", secondary: "#F3C4D6" },
  ],
  automotive: [
    { primary: "#0D0D0D", secondary: "#FF2800" },
    { primary: "#1B1B2F", secondary: "#C0C0C0" },
    { primary: "#0A0A0A", secondary: "#FFD700" },
    { primary: "#1C1C1C", secondary: "#00BFFF" },
    { primary: "#0C0C0C", secondary: "#8B0000" },
    { primary: "#1E1E1E", secondary: "#2E8B57" },
    { primary: "#101010", secondary: "#36454F" },
    { primary: "#0B0B0B", secondary: "#E5E4E2" },
    { primary: "#141414", secondary: "#FF6600" },
    { primary: "#121212", secondary: "#800020" },
  ],
  other: [
    { primary: "#3b82f6", secondary: "#6b7280" },
    { primary: "#6366f1", secondary: "#78716c" },
    { primary: "#0ea5e9", secondary: "#57534e" },
    { primary: "#1A1A2E", secondary: "#16213E" },
    { primary: "#2C2C2C", secondary: "#F5F5F5" },
    { primary: "#1E1E24", secondary: "#C9A96E" },
    { primary: "#2B2B36", secondary: "#8E8D8A" },
    { primary: "#1F2232", secondary: "#E7D39F" },
    { primary: "#3A3A3A", secondary: "#B0B0B0" },
    { primary: "#1C1C1C", secondary: "#D4D4D4" },
  ],
};

/**
 * Calculate perceived brightness of a hex colour (0-255 scale).
 * Uses the standard luminosity formula: 0.299R + 0.587G + 0.114B.
 */
function colorBrightness(hex: string): number {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return Math.round(0.299 * r + 0.587 * g + 0.114 * b);
}

function determinePalette(site: ScrapedSite | null, businessType: BusinessType, name: string = "", photoColors: string[] = []): { primary: string; secondary: string; accent: string } {
  // Photo-extracted colors take highest priority — but only if they're not too dark
  if (photoColors.length >= 2) {
    const avgBrightness = (colorBrightness(photoColors[0]) + colorBrightness(photoColors[1])) / 2;
    if (avgBrightness >= 60) {
      return { primary: photoColors[0], secondary: photoColors[1], accent: "#1a1a2e" };
    }
  }
  if (photoColors.length === 1) {
    if (colorBrightness(photoColors[0]) >= 60) {
      // Get a complementary secondary from the industry palette
      const base = INDUSTRY_PALETTES[businessType] || INDUSTRY_PALETTES.other;
      return { primary: photoColors[0], secondary: base.secondary, accent: "#1a1a2e" };
    }
  }

  // If site scraping provided explicit color palette, use it
  if (site && site.colorPalette.length >= 3) {
    return { primary: site.colorPalette[0], secondary: site.colorPalette[1] || site.colorPalette[0], accent: site.colorPalette[2] || "#1a1a2e" };
  }

  // Pick a variant based on business name hash — deterministic but unique per business
  const variants = INDUSTRY_PALETTE_VARIANTS[businessType] || INDUSTRY_PALETTE_VARIANTS.other;
  const base = INDUSTRY_PALETTES[businessType] || INDUSTRY_PALETTES.other;
  const idx = Math.floor(hashFnv32a(name || businessType) * variants.length);
  const chosen = variants[idx] || { primary: base.primary, secondary: base.secondary };

  // Apply a micro-shift (±10) from the chosen variant so even same-name businesses
  // at different locations get different shades
  const extraShift = Math.floor(hashFnv32a(name + "salt") * 21) - 10;
  return {
    primary: shiftHex(chosen.primary, extraShift),
    secondary: shiftHex(chosen.secondary, extraShift),
    accent: "#1a1a2e",
  };
}

function hexToRgb(hex: string): string {
  const clean = hex.replace("#", "");
  if (clean.length === 3) return `${parseInt(clean[0] + clean[0], 16)}, ${parseInt(clean[1] + clean[1], 16)}, ${parseInt(clean[2] + clean[2], 16)}`;
  return `${parseInt(clean.substring(0, 2), 16)}, ${parseInt(clean.substring(2, 4), 16)}, ${parseInt(clean.substring(4, 6), 16)}`;
}

function escapeJsx(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;").replace(/\\n/g, "\\n").trim();
}

/**
 * Extract dominant colours from scraped photos using Sharp.
 * Returns up to 2 hex colours — the most dominant tones found across all photos.
 */
async function extractColorsFromPhotos(photos: ScrapedPhoto[], outputDir: string): Promise<string[]> {
  const colors: string[] = [];
  const candidates = photos.slice(0, 3); // Check first 3 photos

  for (const photo of candidates) {
    const filePath = path.join(outputDir, "public", photo.localPath);
    try {
      await fs.access(filePath);
      const { dominant } = await sharp(filePath).stats();
      const r = Math.round(dominant.r);
      const g = Math.round(dominant.g);
      const b = Math.round(dominant.b);
      const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
      // Skip near-black or near-white
      const brightness = (r + g + b) / 3;
      if (brightness > 30 && brightness < 225) {
        colors.push(hex);
      }
    } catch { /* skip unreadable or missing files */ }
    if (colors.length >= 2) break;
  }
  return colors;
}

// ─── CSS — MAXIMUM BLING ─────────────────────────────────────────

function generateCss(config: ThemeConfig): string {
  const rgb = hexToRgb(config.primaryColor);
  const secRgb = hexToRgb(config.secondaryColor);
  // Derive gold/accent colors from the secondary color instead of hardcoding
  const goldColor = config.secondaryColor;
  const goldLight = shiftHex(config.secondaryColor, 40);
  const goldRgb = hexToRgb(config.secondaryColor);
  // Light-mode defaults (brighter backgrounds)
  const lightBgStart = "#f8fafc";
  const lightBgMid = "#ffffff";
  const lightBgEnd = "#f8fafc";
  const lightCardInner = "#f8fafc";
  const lightCardBg = "rgba(255, 255, 255, 0.9)";
  const lightCardBorder = "rgba(0, 0, 0, 0.08)";
  const lightMuted = "#475569";
  const lightMutedLighter = "#64748b";
  const lightInputBg = "#ffffff";
  const lightInputBorder = "rgba(0, 0, 0, 0.12)";
  const lightHeaderBg = "rgba(var(--color-primary-rgb), 0.85)";
  const lightHeaderBorder = "rgba(0, 0, 0, 0.08)";
  const lightMobileBg = "rgba(255, 255, 255, 0.95)";
  const lightPageText = "#111827";
  const lightHeadings = "#0f172a";
  const lightScrollbarTrack = "#f1f5f9";
  const lightGlassBg = "rgba(255, 255, 255, 0.7)";
  const lightGlassBorder = "rgba(0, 0, 0, 0.08)";
  const lightRecaptchaBorder = "rgba(0, 0, 0, 0.08)";
  const lightRecaptchaBg = "rgba(255, 255, 255, 0.9)";

  // Dark-mode defaults
  const darkBgStart = "#0d0d0d";
  const darkBgMid = "#1a0a0a";
  const darkBgEnd = "#0d0d0d";
  const darkCardInner = "#0a0a0f";
  const darkCardBg = "rgba(255, 255, 255, 0.03)";
  const darkCardBorder = "rgba(255, 255, 255, 0.1)";
  const darkMuted = "#94a3b8";
  const darkMutedLighter = "#64748b";
  const darkInputBg = "rgba(0, 0, 0, 0.4)";
  const darkInputBorder = "rgba(255, 255, 255, 0.1)";
  const darkHeaderBg = "rgba(var(--color-primary-rgb), 0.55)";
  const darkHeaderBorder = "rgba(255, 255, 255, 0.1)";
  const darkMobileBg = "rgba(0, 0, 0, 0.95)";
  const darkPageText = "#ffffff";
  const darkHeadings = "#ffffff";
  const darkScrollbarTrack = "#0a0a0f";
  const darkGlassBg = "rgba(255, 255, 255, 0.05)";
  const darkGlassBorder = "rgba(255, 255, 255, 0.1)";
  const darkRecaptchaBorder = "rgba(255, 255, 255, 0.1)";
  const darkRecaptchaBg = "rgba(0, 0, 0, 0.3)";

  return `/* Rake CMS — Theme: ${config.name} - MAXIMUM WOW EDITION */
/* ============================================================
   Light mode :root = default (light) | .dark overrides for dark
   ============================================================ */

:root {
  /* ── Brand colors stay the same across themes ── */
  --color-primary: ${config.primaryColor};
  --color-primary-rgb: ${rgb};
  --color-secondary: ${config.secondaryColor};
  --color-secondary-rgb: ${secRgb};
  --color-accent: ${config.accentColor};
  --color-gold: ${goldColor};
  --color-gold-rgb: ${goldRgb};
  --color-gold-light: ${goldLight};
  --color-glow: rgba(${goldRgb}, 0.3);
  --color-glow-intense: rgba(${goldRgb}, 0.6);
  --gradient-main: linear-gradient(135deg, ${config.primaryColor}, ${config.secondaryColor});
  --gradient-glow: radial-gradient(circle at 50% 50%, rgba(${goldRgb}, 0.15), transparent 70%);
  --border-angle: 0deg;

  /* ── LIGHT MODE (default) ── */
  --glass-bg: ${lightGlassBg};
  --glass-border: ${lightGlassBorder};
  --page-bg: #ffffff;
  --page-text: ${lightPageText};
  --section-bg-start: ${lightBgStart};
  --section-bg-mid: ${lightBgMid};
  --section-bg-end: ${lightBgEnd};
  --card-bg: ${lightCardBg};
  --card-border: ${lightCardBorder};
  --muted: ${lightMuted};
  --muted-lighter: ${lightMutedLighter};
  --color-gray-300: #4b5563;
  --color-gray-400: #6b7280;
  --input-bg: ${lightInputBg};
  --input-border: ${lightInputBorder};
  --scrollbar-track: ${lightScrollbarTrack};
  --selection-bg: var(--color-primary);
  --header-bg: ${lightHeaderBg};
  --header-border: ${lightHeaderBorder};
  --mobile-menu-bg: ${lightMobileBg};
  --card-inner-bg: ${lightCardInner};
  --recaptcha-border: ${lightRecaptchaBorder};
  --recaptcha-bg: ${lightRecaptchaBg};
  --headings: ${lightHeadings};
}

.dark {
  /* ── DARK MODE ── */
  --glass-bg: ${darkGlassBg};
  --glass-border: ${darkGlassBorder};
  --page-bg: #000000;
  --page-text: ${darkPageText};
  --section-bg-start: ${darkBgStart};
  --section-bg-mid: ${darkBgMid};
  --section-bg-end: ${darkBgEnd};
  --card-bg: ${darkCardBg};
  --card-border: ${darkCardBorder};
  --muted: ${darkMuted};
  --muted-lighter: ${darkMutedLighter};
  --input-bg: ${darkInputBg};
  --input-border: ${darkInputBorder};
  --scrollbar-track: ${darkScrollbarTrack};
  --selection-bg: var(--color-primary);
  --header-bg: ${darkHeaderBg};
  --header-border: ${darkHeaderBorder};
  --mobile-menu-bg: ${darkMobileBg};
  --card-inner-bg: ${darkCardInner};
  --recaptcha-border: ${darkRecaptchaBorder};
  --recaptcha-bg: ${darkRecaptchaBg};
  --headings: ${darkHeadings};
}

/* ── Theme-aware utility classes ── */
.bg-page { background-color: var(--page-bg); }
.text-page { color: var(--page-text); }
.bg-section { background: linear-gradient(180deg, var(--section-bg-start), var(--section-bg-mid), var(--section-bg-end)); }
.text-muted { color: var(--muted); }
.text-muted-lighter { color: var(--muted-lighter); }
.bg-card { background: var(--card-bg); }
.border-card { border-color: var(--card-border); }
.bg-input { background: var(--input-bg); }
.border-input { border-color: var(--input-border); }
.bg-header { background: var(--header-bg); }
.border-header { border-color: var(--header-border); }
.bg-mobile-menu { background: var(--mobile-menu-bg); }
.bg-card-inner { background: var(--card-inner-bg); }
.bg-recaptcha { background: var(--recaptcha-bg); }
.border-recaptcha { border-color: var(--recaptcha-border); }
.text-heading { color: var(--headings); }

/* ── Light mode: auto-fix hardcoded white/gray text inside card contexts ── */
:root .bg-card .text-white,
:root .bg-card-inner .text-white,
:root .bg-card h1.text-white,
:root .bg-card-inner h1.text-white,
:root .bg-card h2.text-white:not(.gradient-text):not(.gradient-text-gold),
:root .bg-card-inner h2.text-white:not(.gradient-text):not(.gradient-text-gold),
:root .bg-card h3.text-white,
:root .bg-card-inner h3.text-white,
:root .bg-card h4.text-white,
:root .bg-card-inner h4.text-white {
  color: var(--headings) !important;
}
:root .bg-card .text-gray-300,
:root .bg-card-inner .text-gray-300,
:root .bg-card .text-gray-400,
:root .bg-card-inner .text-gray-400,
:root .bg-card .text-gray-500,
:root .bg-card-inner .text-gray-500 {
  color: var(--muted) !important;
}
:root .bg-card .text-gray-600,
:root .bg-card-inner .text-gray-600 {
  color: var(--muted-lighter) !important;
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
  background: linear-gradient(135deg, var(--color-gold), var(--color-gold-light), var(--color-gold));
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
  background: conic-gradient(from var(--border-angle), transparent, rgba(var(--color-gold-rgb), 0.3), transparent, rgba(var(--color-gold-rgb), 0.5), transparent);
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
  box-shadow: 0 0 30px rgba(var(--color-gold-rgb), 0.15), 0 0 60px rgba(var(--color-gold-rgb), 0.05);
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
  background: linear-gradient(90deg, transparent, rgba(var(--color-gold-rgb), 0.35), transparent);
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
  0%, 100% { box-shadow: 0 0 20px rgba(var(--color-gold-rgb), 0.3); }
  50% { box-shadow: 0 0 40px rgba(var(--color-gold-rgb), 0.6); }
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
::-webkit-scrollbar-track { background: var(--scrollbar-track); }
::-webkit-scrollbar-thumb { background: linear-gradient(180deg, ${config.primaryColor}, ${config.secondaryColor}); border-radius: 3px; }

/* ── Selection ── */
::selection { background: var(--selection-bg); color: white; }
`;
}

// ─── Section-anchor nav links ─────────────────────────────────────

/**
 * Builds section-anchor nav links for the homepage.
 * Main sections: about, services, locations, menu, reviews, contact.
 * Also includes blog if it's in the pageSlugs list, but as a section anchor.
 */
function buildNavLinks(_pageSlugs: SitePage[], businessType?: BusinessType): SitePage[] {
	  const sectionLinks: SitePage[] = [
	    { slug: "/#about", label: "Sobre nosotros" },
	    { slug: "/#services", label: "Qué ofrecemos" },
	  ];

	  // Add business-type-specific middle link
	  if (businessType === "restaurant") {
	    sectionLinks.splice(2, 0, { slug: "/#menu", label: "Nuestra Carta" });
	  } else if (businessType === "travel") {
	    sectionLinks.splice(2, 0, { slug: "/#excursions", label: "Excursiones" });
	  } else if (businessType === "retail") {
	    sectionLinks.splice(2, 0, { slug: "/#products", label: "Productos" });
	  } else if (businessType === "service" || businessType === "professional") {
	    sectionLinks.splice(2, 0, { slug: "/#menu", label: "Servicios" });
	  }

	  if (_pageSlugs.find((p) => p.slug === "blog")) {
	    sectionLinks.push({ slug: "/blog", label: "Blog" });
	  }
	  return sectionLinks;
	}

function renderNavLinks(links: SitePage[], className: string, isMobile = false): string {
  return links
    .map(
      (link) => {
        const tKey = slugToNavKey(link.slug);
        const label = tKey ? `{t("${tKey}")}` : escapeJsx(link.label);
        return `<Link href="${escapeJsx(link.slug)}" className="${escapeJsx(className)}"${isMobile ? ` onClick={() => setOpen(false)}` : ""}>${label}</Link>`;
      }
    )
    .join("\n          ");
}

/** Map section slugs to their translation keys */
function slugToNavKey(slug: string): string | null {
  const map: Record<string, string> = {
    "/#about": "nav.about",
    "/#services": "nav.services",
    "/#excursions": "nav.excursions",
    "/#menu": "nav.menu",
    "/#products": "nav.products",
    "/blog": "nav.blog",
  };
  return map[slug] || null;
}

// ─── Header — GLASSMORPHISM WOW ───────────────────────────────────

function generateHeader(name: string, pageSlugs: SitePage[], businessType: BusinessType = "other", site: ScrapedSite | null = null): string {
  const navLinks = buildNavLinks(pageSlugs, businessType);
  const desktopLinks = renderNavLinks(
    navLinks,
    `relative text-sm font-medium text-white/70 transition-colors hover:text-white cursor-pointer after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[var(--color-gold)] after:to-[var(--color-gold-light)] after:transition-all after:duration-300 hover:after:w-full`
  );
  const mobileLinks = renderNavLinks(
    navLinks,
    "text-base font-medium text-white/80 transition hover:text-[var(--color-gold)] cursor-pointer",
    true
  );

  // Logo URL
  const logoUrl = `/media/${name.toLowerCase().replace(/\s+/g, '')}/logo.png`;
  const hasLogo = false;

  const navLinkClass = `relative text-sm font-medium text-white/70 transition-colors hover:text-white cursor-pointer after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[var(--color-gold)] after:to-[var(--color-gold-light)] after:transition-all after:duration-300 hover:after:w-full`;
  const mobileNavLinkClass = `text-base font-medium text-white/80 transition hover:text-[var(--color-gold)] cursor-pointer`;

  // Standard CTA link
  let ctaDesktop: string;
  let ctaMobile: string;
  const ctaBtnClass = navLinkClass;

  if (businessType === "restaurant") {
    ctaDesktop = `<a href="/#contact" className="${ctaBtnClass}">Reservas</a>`;
    ctaMobile = `<a href="/#contact" className="${mobileNavLinkClass}" onClick={() => setOpen(false)}>Reservas</a>`;
  } else {
    ctaDesktop = `<a href="/#contact" className="${ctaBtnClass}">Contactar</a>`;
    ctaMobile = `<a href="/#contact" className="${mobileNavLinkClass}" onClick={() => setOpen(false)}>Contactar</a>`;
  }

  // Extra nav items: Inicio (home), CTA (desktop & mobile) — no scraped external links
  const extraDesktopLinks = [
    `<Link href="/" className="${navLinkClass}">{t("nav.home")}</Link>`,
    ctaDesktop,
  ];
  const extraMobileLinks = [
    `<Link href="/" className="${mobileNavLinkClass}" onClick={() => setOpen(false)}>{t("nav.home")}</Link>`,
    ctaMobile,
  ];

	  // ─── Languages from scraped data ───
	  const langFlags: Record<string, string> = {
	    es: "🇪🇸", en: "🇬🇧", ro: "🇷🇴", hu: "🇭🇺",
	    fr: "🇫🇷", de: "🇩🇪", it: "🇮🇹", pt: "🇵🇹",
	    nl: "🇳🇱", pl: "🇵🇱", ru: "🇷🇺", ja: "🇯🇵",
	    zh: "🇨🇳", ko: "🇰🇷", ar: "🇸🇦", sv: "🇸🇪",
	  };
	  const siteLangs = site?.languages?.length ? site.languages : ["es", "en"];
	  const langs = siteLangs.map(code => ({
	    code,
	    flag: langFlags[code] || "🌐",
	    label: code.toUpperCase(),
	  }));
	  // Build TypeScript array literal for the Header template
	  	  const langsTs = "[" + langs.map(l => `{code:"${l.code}",flag:"${l.flag}",label:"${l.label}"}`).join(",") + "]";

	  	  return `// ============================================================
	  //  Header — Matte Glass Always On + Shimmer Nav Hover + Lang Toggle
	  //  MAXIMUM WOW EDITION
	  // ============================================================

	  "use client";

	  import Link from "next/link";\n	  import { useState } from "react";\n	  import { motion, AnimatePresence } from "framer-motion";\n	  import { useLanguage } from "@/lib/i18n";\n	  import { useTheme } from "@/components/theme/ThemeProvider";
	  import type { Lang } from "@/lib/i18n";

	  export default function Header() {
	    const { lang, switchLang, t } = useLanguage();\n	    const { theme, toggleTheme } = useTheme();
	    const [open, setOpen] = useState(false);
	    const [langOpen, setLangOpen] = useState(false);
	    const langs = ${langsTs};

	    const doSwitchLang = (next: Lang) => {
	      setLangOpen(false);
	      switchLang(next);
	    };

  // ─── B2B Link ───
  const b2bHref = "https://b2b.marioviajes.com";

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 25, delay: 0.2 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="border-b border-white/30 bg-header backdrop-blur-2xl shadow-lg shadow-black/5">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          {/* Logo with gradient glow */}
          <Link href="/" className="group relative flex items-center gap-3 cursor-pointer">
            <img src="${escapeJsx(logoUrl)}" alt="${escapeJsx(name)}" className="h-10 w-auto object-contain" style={{minWidth:'120px'}} />
            ${hasLogo ? '' : `
            <span className="text-xl font-black tracking-tight text-white transition-all duration-300 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[var(--color-gold)] group-hover:to-[var(--color-gold-light)]">
              ${escapeJsx(name)}
            </span>
            <span className="absolute -bottom-0.5 left-0 h-[2px] w-0 bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-light)] transition-all duration-300 group-hover:w-full" />`}
          </Link>

          {/* ── Spacer between logo and menu ── */}
          <div className="shrink-0" style={{width:'calc(var(--spacing)*8)'}} />

          {/* ── Desktop Nav with text-shadow ── */}
          <nav className="hidden items-center gap-8 md:flex" style={{textShadow:'1px 1px 3px rgba(0,0,0,0.5)'}}>
            ${extraDesktopLinks[0]}
            ${desktopLinks}
            ${extraDesktopLinks[1]}
            ${extraDesktopLinks[2]}
            {/* ─── Language Dropdown ─── */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                onBlur={() => setTimeout(() => setLangOpen(false), 200)}
                className="flex items-center gap-1 relative text-sm font-medium text-[var(--color-gold)] hover:text-[var(--color-gold-light)] transition-colors cursor-pointer bg-transparent border-none"
                style={{cursor:'pointer'}}
              >
                {lang.toUpperCase()}
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={langOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                </svg>
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-1 w-28 rounded-lg border border-white/10 bg-black/90 backdrop-blur-xl shadow-xl overflow-hidden z-50">
                  {langs.map(l => (
                    <button
                      key={l.code}
                      onClick={() => doSwitchLang(l.code as Lang)}
                      className={\`w-full px-3 py-2 text-xs font-medium text-left transition-colors hover:bg-white/10 cursor-pointer \${lang === l.code ? "text-[var(--color-gold)] bg-white/5" : "text-white/60"}\`}
                      style={{cursor:'pointer'}}
                    >
                      {l.flag} {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* ── Theme Toggle ── */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 hover:bg-white/10 cursor-pointer bg-transparent border-none"
              style={{cursor:'pointer'}}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <svg className="w-4 h-4 text-[var(--color-gold)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-[var(--color-gold)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </nav>

          {/* Mobile Hamburger */}
          <button
            className="relative z-50 flex h-10 w-10 items-center justify-center text-white md:hidden cursor-pointer"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            style={{cursor:'pointer'}}
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
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0, backdropFilter: "blur(0px)" } }
            animate={{ height: "auto", opacity: 1, backdropFilter: "blur(24px)" } }
            exit={{ height: 0, opacity: 0, backdropFilter: "blur(0px)" } }
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
                ${extraMobileLinks[0]}
                ${mobileLinks.split("\\\\n").map(l => l.trim()).join("\\\\n")}
                ${extraMobileLinks[1]}
                {/* B2B mobile link */}
                <a href={b2bHref} target="_blank" rel="noopener noreferrer" className="${mobileNavLinkClass}" onClick={() => setOpen(false)} style={{cursor:'pointer'}}>B2B</a>
                ${extraMobileLinks[2]}
                <div className="relative">
                  <button
                    onClick={() => setLangOpen(!langOpen)}
                    className="flex items-center gap-1 text-base font-medium text-[var(--color-gold)] hover:text-[var(--color-gold-light)] transition-colors bg-transparent border-none text-left cursor-pointer"
                    style={{cursor:'pointer'}}
                  >
                    {lang.toUpperCase()}
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={langOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                    </svg>
                  </button>
                  {langOpen && (
                    <div className="mt-1 w-28 rounded-lg border border-white/10 bg-black/90 backdrop-blur-xl shadow-xl overflow-hidden">
                      {langs.map(l => (
                        <button
                          key={l.code}
                          onClick={() => { doSwitchLang(l.code as Lang); setOpen(false); }}
                          className={\`w-full px-3 py-2 text-xs font-medium text-left transition-colors hover:bg-white/10 cursor-pointer \${lang === l.code ? "text-[var(--color-gold)] bg-white/5" : "text-white/60"}\`}
                          style={{cursor:'pointer'}}
                        >
                          {l.flag} {l.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {/* Mobile Theme Toggle */}
                <button
                  onClick={() => { toggleTheme(); setOpen(false); }}
                  className="flex items-center gap-2 text-base font-medium cursor-pointer bg-transparent border-none text-left"
                  style={{cursor:'pointer'}}
                >
                  <span className="text-[var(--color-gold)]">
                    {theme === 'dark' ? '☀️' : '🌙'}
                  </span>
                  <span className="text-white/80">
                    {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
                  </span>
                </button>
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

function generateHero(content: GeneratedContent, config: ThemeConfig, heroPhoto: string | null, site: ScrapedSite | null = null): string {
  // Dynamic CTA text based on business type
  const ctaPrimary = config.businessType === "restaurant"
    ? "Explora menú y precios"
    : `{t("hero.cta_services")}`;
  const ctaSecondary = config.businessType === "restaurant"
    ? "Reserve Your Table"
    : `{t("hero.cta_contact")}`;

  // Carousel images base path
  const nameSlug = config.name.toLowerCase().replace(/[\s']/g, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const carouselImages = [
    `/media/${nameSlug}/c-img-1.jpg`,
    `/media/${nameSlug}/c-img-2.jpg`,
    `/media/${nameSlug}/c-img-3.jpg`,
  ];

  // ─── Per-language hero subtitle map ───
  const heroSubtitleMap: Record<string, string> = { es: content.heroSubtitle || "Welcome to our establishment. We look forward to serving you." };
  if (site?.languageContent) {
    for (const [code, lc] of Object.entries(site.languageContent)) {
      const langContent = lc as { heroSubtitle?: string; tagline?: string };
      if (langContent.heroSubtitle) heroSubtitleMap[code] = langContent.heroSubtitle;
      else if (langContent.tagline) heroSubtitleMap[code] = langContent.tagline;
    }
  }

  const tagline = JSON.stringify(content.tagline || config.name);
  const heroSubtitle = JSON.stringify(content.heroSubtitle || "");

  return `// ============================================================
//  Hero — Carousel with Auto-Rotation + Prev/Next + Parallax
//  MAXIMUM WOW EDITION
// ============================================================

"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/lib/i18n";

export default function Hero() {
  const { t, lang } = useLanguage();
  const __ = (m: Record<string,string>) => m[lang] || m.es || "";
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0.2]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  // ─── Per-site content (embedded from scraped data) ───
  const TAGLINE = ${JSON.stringify(content.tagline || config.name)};
  const HERO_SUBTITLE = ${JSON.stringify(content.heroSubtitle || "")};

  // ─── Carousel State ───
  const slides = ${JSON.stringify(carouselImages)};
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Auto-rotation every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };

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
    >
      {/* ── Carousel Slides ── */}
      <AnimatePresence custom={direction} mode="wait">
        <motion.div
          key={current}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="absolute inset-0"
          style={{
            backgroundImage: \`url(\${slides[current]})\`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/50" />
        </motion.div>
      </AnimatePresence>

      {/* ── 1. Animated Mesh/Gradient Background Overlay ── */}
      <div
        className="absolute inset-0 opacity-60 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-gold) 25%, #1a0a0a 50%, var(--color-primary) 75%, var(--color-gold) 100%)",
          backgroundSize: "400% 400%",
          animation: "gradient 8s ease infinite",
        }}
      />

      {/* ── Floating Glow Particles ── */}
      <motion.div
        className="absolute top-[15%] left-[10%] h-4 w-4 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(var(--color-gold-rgb), 0.8), transparent)" }}
        animate={{ y: [0, -30, 0], x: [0, 15, 0], opacity: [0.4, 1, 0.4] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[25%] right-[15%] h-6 w-6 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(var(--color-gold-rgb), 0.6), transparent)" }}
        animate={{ y: [0, -25, 0], x: [0, -10, 0], opacity: [0.3, 0.8, 0.3] }}
        transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.5 }}
      />
      <motion.div
        className="absolute bottom-[30%] left-[20%] h-3 w-3 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(var(--color-primary-rgb), 0.8), transparent)" }}
        animate={{ y: [0, -20, 0], x: [0, -12, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute bottom-[20%] right-[25%] h-5 w-5 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(var(--color-gold-rgb), 0.7), transparent)" }}
        animate={{ y: [0, -35, 0], x: [0, 8, 0], opacity: [0.2, 0.9, 0.2] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 0.2 }}
      />
      <motion.div
        className="absolute top-[40%] left-[40%] h-8 w-8 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(var(--color-gold-rgb), 0.5), transparent)" }}
        animate={{ y: [0, -15, 0], x: [0, 20, 0], opacity: [0.1, 0.6, 0.1] }}
        transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1.5 }}
      />
      <motion.div
        className="absolute top-[60%] right-[10%] h-3 w-3 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(var(--color-primary-rgb), 0.9), transparent)" }}
        animate={{ y: [0, -22, 0], x: [0, -5, 0], opacity: [0.3, 0.7, 0.3] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.8 }}
      />

      {/* ── Decorative Radial Gradient Overlay ── */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(var(--color-gold-rgb), 0.12), transparent 60%)",
        }}
        animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
      />

      {/* ── Parallax Background Layer ── */}
      <motion.div
        className="absolute inset-0 bg-black/50 pointer-events-none"
        style={{ y, opacity }}
      />

      {/* ── Carousel Prev / Next Buttons ── */}
      <button
        onClick={prevSlide}
        className="absolute left-4 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md border border-white/20 transition-all duration-300 hover:bg-white/20 hover:border-[var(--color-gold)]/50 hover:scale-110"
        aria-label="Previous slide"
        style={{cursor:'pointer'}}
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md border border-white/20 transition-all duration-300 hover:bg-white/20 hover:border-[var(--color-gold)]/50 hover:scale-110"
        aria-label="Next slide"
        style={{cursor:'pointer'}}
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* ── Slide Indicators ── */}
      <div className="absolute bottom-24 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
            className={\`h-2 w-2 rounded-full transition-all duration-300 \${i === current ? "w-6 bg-[var(--color-gold)]" : "bg-white/40"}\`}
            aria-label={\`Go to slide \${i + 1}\`}
            style={{cursor:'pointer'}}
          />
        ))}
      </div>

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
          <span className="inline-block rounded-full border border-[var(--color-gold)]/30 bg-[var(--color-gold)]/10 px-6 py-2 text-xs uppercase tracking-[0.3em] text-[var(--color-gold)] backdrop-blur-sm">
            {HERO_SUBTITLE || TAGLINE}
          </span>
        </motion.div>

        {/* ── Animated Gradient Text on Tagline ── */}
        <motion.h1
          variants={childVariants}
          className="mb-6 text-5xl font-black tracking-tight md:text-7xl lg:text-8xl"
        >
          {TAGLINE}
        </motion.h1>

        {/* ── Typewriter / Staggered Subtitle ── */}
        <motion.p
          variants={childVariants}
          className="mx-auto mb-12 max-w-2xl text-lg text-white/70 md:text-xl"
        >
          {__(${JSON.stringify(heroSubtitleMap)}).split("").map((char, i) => (
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

        {/* ── Two Shimmer CTA Buttons ── */}
        <motion.div
          variants={childVariants}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            href="/#menu"
            className="shimmer-btn shimmer-btn-gold relative inline-flex items-center rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-gold)] px-10 py-4 font-bold text-white shadow-[0_0_20px_rgba(var(--color-gold-rgb), 0.3)] transition-all duration-300 hover:shadow-[0_0_40px_rgba(var(--color-gold-rgb), 0.5)] hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span className="relative z-10">${ctaPrimary}</span>
          </Link>
          <Link
            href="/#contact"
            className="shimmer-btn relative inline-flex items-center rounded-xl border-2 border-white/30 px-10 py-4 font-bold text-white transition-all duration-300 hover:border-[var(--color-gold)] hover:bg-[var(--color-gold)]/10 hover:shadow-[0_0_30px_rgba(var(--color-gold-rgb), 0.3)] hover:scale-105 active:scale-95 cursor-pointer"
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
          <span className="text-xs uppercase tracking-[0.2em] text-white/30">{t("hero.scroll")}</span>
          <div className="h-8 w-[1px] bg-gradient-to-b from-[var(--color-gold)] to-transparent" />
        </div>
      </motion.div>
    </section>
  );
}
`;
}

// ─── About — SPRING REVEAL + COUNTERS + GLASSMORPHISM ────────────

function generateAbout(content: GeneratedContent, photo: string | null, site: ScrapedSite | null = null): string {
  const aboutParagraphs = content.aboutParagraphs || [];
  const p1 = aboutParagraphs[0] || "";
  const p2 = aboutParagraphs[1] || "";
  const p3 = aboutParagraphs[2] || "";
  const businessName = escapeJsx(site?.businessName || site?.pages?.[0]?.title || content.aboutHeading || "Our Business");
  const imgHtml = photo
    ? `<motion.div
              className="relative overflow-hidden rounded-2xl"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-[var(--color-gold)]/20 via-[var(--color-primary)]/20 to-[var(--color-gold)]/20 rounded-2xl animate-[spin-slow_8s_linear_infinite] blur-2xl" />
              <div className="relative overflow-hidden rounded-2xl">
                <img src="${photo}" alt="${escapeJsx(content.aboutHeading)}" className="h-full w-full object-cover" />
              </div>
            </motion.div>`
    : `<motion.div
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--color-gold)]/20 via-[var(--color-primary)]/20 to-black"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <div className="aspect-square flex items-center justify-center">
                <div className="text-center px-6">
                  <svg className="w-16 h-16 mx-auto mb-4 text-[var(--color-gold)]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xs text-gray-500">{t("about.subtitle")}</p>
                </div>
              </div>
            </motion.div>`;

  return `// ============================================================
//  About — Spring Reveal + Animated Counters + Glassmorphism
//  MAXIMUM WOW EDITION
// ============================================================

"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n";

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
  const { t, lang } = useLanguage();
  const __ = (m: Record<string,string>) => m[lang] || m.es || "";
  const sectionRef = useRef<HTMLDivElement>(null);

  // ─── Per-site about content (embedded from scraped data) ───
  const ABOUT_P1 = ${JSON.stringify(p1)};
  const ABOUT_P2 = ${JSON.stringify(p2)};
  const ABOUT_P3 = ${JSON.stringify(p3)};

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
      <div className="absolute inset-0 bg-section opacity-90" />
      <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, rgba(var(--color-gold-rgb), 0.05), transparent 50%)" }} />

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
              className="mb-4 block text-xs uppercase tracking-[0.3em] text-[var(--color-gold)]/80"
            >
              {"${businessName}"}
            </motion.span>
            <motion.h2
              variants={springUp}
              className="mb-6 text-3xl font-bold md:text-4xl gradient-text"
            >
              {t("about.title")}
            </motion.h2>
            <motion.p
              variants={springUp}
              className="mb-4 leading-relaxed text-gray-300"
            >
              {ABOUT_P1}
            </motion.p>
            <motion.p
              variants={springUp}
              className="mb-4 leading-relaxed text-gray-300"
            >
              {ABOUT_P2}
            </motion.p>
            <motion.p
              variants={springUp}
              className="leading-relaxed text-gray-300"
            >
              {ABOUT_P3}
            </motion.p>

            {/* ── 2. Animated Counter Stats ── */}
            <motion.div
              variants={springUp}
              className="mt-8 grid grid-cols-3 gap-4"
            >
              {[
                { value: 500, label: t("about.stats.clients"), suffix: "+" },
                { value: 15, label: t("about.stats.experience"), suffix: "+" },
                { value: 99, label: t("about.stats.satisfaction"), suffix: "%" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-sm"
                >
                  <div className="text-2xl font-black text-[var(--color-gold)]">
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
  const SERVICE_KEYS = [
    "service_1",
    "service_2",
    "service_3",
    "service_4",
    "service_5",
    "service_6",
  ];
  const bizName = escapeJsx(config.name || "Our Business");
  const servicesData = content.services || [];

  return `// ============================================================
//  Services — 3D Perspective Tilt + Glowing Borders + Pulse Dots
//  MAXIMUM WOW EDITION
// ============================================================

"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { useRef } from "react";
import { useLanguage } from "@/lib/i18n";

// ─── Per-site services (embedded from scraped content) ───
const SERVICES = ${JSON.stringify(servicesData)};

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
  const { t, lang } = useLanguage();
  return (
    <section id="services" className="relative px-4 py-24 overflow-hidden">
      {/* Animated Background Mesh */}
      <div className="absolute inset-0 bg-section" />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: \`
            radial-gradient(circle at 20% 30%, rgba(var(--color-primary-rgb), 0.3), transparent 40%),
            radial-gradient(circle at 80% 70%, rgba(var(--color-gold-rgb), 0.2), transparent 40%),
            radial-gradient(circle at 50% 50%, rgba(var(--color-primary-rgb), 0.15), transparent 50%)
          \`,
          backgroundSize: "100% 100%",
          animation: "breathe 6s ease-in-out infinite",
        }}
      />

      <div className="relative z-10 container mx-auto max-w-6xl">
        {/* ── Our Services ── */}
        <motion.div
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
              className="mb-4 block text-xs uppercase tracking-[0.3em] text-[var(--color-gold)]/60"
            >
              ${escapeJsx(config.name)}
            </motion.span>
            <h2 className="text-3xl font-bold text-white md:text-4xl gradient-text">{t("services.title")}</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {SERVICES.slice(0, 6).map((svc, i) => (
              <TiltCard key={i} className="rounded-2xl p-[1px] glow-card">
                <div className="relative rounded-2xl bg-card-inner p-8 h-full">
                  <span className="mb-2 inline-block rounded bg-[var(--color-gold)]/20 px-2 py-0.5 text-xs font-medium text-[var(--color-gold)]">#{(i + 1).toString().padStart(2, "0")}</span>
                  <h3 className="mb-3 text-xl font-bold text-white">{svc.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-300">{svc.description}</p>
                </div>
              </TiltCard>
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
import { useEffect } from "react";
import { useLanguage } from "@/lib/i18n";

const REVIEWS: Array<{ author: string; text: string; rating: number; source: string }> = ${reviewsJson};

function SparkleStar({ filled, delay }: { filled: boolean; delay: number }) {
  return (
    <motion.span
      className={\`relative inline-block text-lg \${
        filled ? "text-[var(--color-gold)]" : "text-gray-600"
      }\`}
      initial={{ opacity: 0, scale: 0, rotate: -180 }}
      whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
      viewport={{ once: true }}
      transition={{ delay, type: "spring", stiffness: 200, damping: 10 }}
    >
      {filled ? "★" : "☆"}
      {filled && (
        <motion.span
          className="absolute -top-1 -right-1 text-[8px] text-[var(--color-gold-light)]"
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
  const { t } = useLanguage();
  return (
    <section id="reviews" className="relative px-4 py-24 overflow-hidden">
      <div className="absolute inset-0 bg-section" />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: "radial-gradient(circle at 70% 30%, rgba(var(--color-gold-rgb), 0.15), transparent 50%)",
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
          <span className="mb-4 block text-xs uppercase tracking-[0.3em] text-[var(--color-gold)]/60">{t("reviews.subtitle")}</span>
          <h2 className="text-3xl font-bold text-white md:text-4xl gradient-text">{t("reviews.title")}</h2>
          <p className="mx-auto mt-3 max-w-xl text-gray-400">{t("reviews.tagline")}</p>
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
                boxShadow: "0 20px 60px rgba(var(--color-gold-rgb), 0.15)",
              }}
              className="relative rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm hover:border-[var(--color-gold)]/30"
              style={{ transformPerspective: 800 }}
            >
              {/* Gradient Quote Decoration */}
              <div className="absolute -top-2 -left-2 text-4xl text-[var(--color-gold)]/20 select-none leading-none" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z"/>
                </svg>
              </div>

              <StarRating rating={review.rating} />
              <p className="mt-3 text-sm leading-relaxed text-gray-300 relative z-10">"{review.text}"</p>
              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-gray-400">
                <span className="font-medium text-white">— {review.author}</span>
                <span className="text-[var(--color-gold)]/80">{review.source}</span>
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
  // Derive contact details from business data
  const addr = business?.address || site?.pages?.[0]?.contactInfo?.address?.[0] || "Dirección disponible próximamente";
  const phone = business?.phone || site?.pages?.[0]?.contactInfo?.phone?.[0] || "";
  const email = site?.pages?.[0]?.contactInfo?.email?.[0] || "";
  return `// ============================================================
//  Contact — Animated Gradient Fields + Pulse Button + Hover Lift
//  MAXIMUM WOW EDITION
// ============================================================

"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { useLanguage } from "@/lib/i18n";

export default function Contact() {
  const { t } = useLanguage();
  useEffect(() => {
    if (!document.querySelector('script[src*="recaptcha/api.js"]')) {
      const script = document.createElement("script");
      script.src = "https://www.google.com/recaptcha/api.js";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  return (
    <section id="contact" className="relative px-4 py-24 overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 bg-section" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: \`radial-gradient(circle at 25% 25%, var(--color-gold) 1px, transparent 1px),
            radial-gradient(circle at 75% 75%, var(--color-primary) 1px, transparent 1px)\`,
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
          <span className="mb-4 block text-xs uppercase tracking-[0.3em] text-[var(--color-gold)]/60">{t("contact.badge")}</span>
          <h2 className="text-3xl font-bold text-white md:text-4xl gradient-text">{t("contact.title")}</h2>
          <p className="mx-auto mt-3 max-w-xl text-gray-400">${escapeJsx(config.name)}</p>
        </motion.div>

        <div className="grid gap-10 md:grid-cols-2">
          {/* Contact Details */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 80, damping: 15 }}
            className="space-y-8"
          >
            {/* Business location — Hover Lift Card */}
            <motion.div
              whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(var(--color-gold-rgb), 0.1)" }}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-[var(--color-gold)]/30"
            >
              <h3 className="mb-4 text-lg font-bold text-white">
                <span className="text-[var(--color-gold)]">📍</span> ${escapeJsx(config.name || "Our Location")}
              </h3>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5">📍</span>
                  <span>${escapeJsx(addr)}</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5">📞</span>
                  <a href="tel:${escapeJsx(phone)}" className="text-[var(--color-gold)] transition hover:text-[var(--color-gold-light)]">${escapeJsx(phone)}</a>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5">✉️</span>
                  <a href="mailto:${escapeJsx(email)}" className="text-[var(--color-gold)] transition hover:text-[var(--color-gold-light)]">${escapeJsx(email)}</a>
                </div>
              </div>
            </motion.div>

            {/* Additional contact info — Hover Lift Card */}
            <motion.div
              whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(var(--color-gold-rgb), 0.1)" }}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-[var(--color-gold)]/30"
            >
              <h3 className="mb-4 text-lg font-bold text-white">
                <span className="text-[var(--color-gold)]">📋</span> {t("contact.info_title")}
              </h3>
              <div className="space-y-3 text-sm text-gray-300">
                <p>{t("contact.info_text")}</p>
                <div className="mt-4 pt-3 border-t border-white/10">
                  <p className="text-xs text-gray-400">{t("contact.response_time")}</p>
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
            <h3 className="mb-6 text-lg font-semibold text-white">{t("contact.form_title")}</h3>
            <form className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">{t("contact.form_name_label")}</label>
                <motion.input
                  type="text"
                  placeholder={t("contact.form_name_placeholder")}
                  whileFocus={{ scale: 1.01 }}
                  className="w-full rounded-lg border border-white/10 bg-[var(--color-primary)]/80 px-4 py-3 text-sm text-white placeholder-white/60 transition-all duration-300 focus:border-[var(--color-gold)] focus:outline-none focus:ring-[3px] focus:ring-[var(--color-gold)]/20 focus:shadow-[0_0_20px_rgba(var(--color-gold-rgb), 0.15)]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">{t("contact.form_surname_label")}</label>
                <motion.input
                  type="text"
                  placeholder={t("contact.form_surname_placeholder")}
                  whileFocus={{ scale: 1.01 }}
                  className="w-full rounded-lg border border-white/10 bg-[var(--color-primary)]/80 px-4 py-3 text-sm text-white placeholder-white/60 transition-all duration-300 focus:border-[var(--color-gold)] focus:outline-none focus:ring-[3px] focus:ring-[var(--color-gold)]/20 focus:shadow-[0_0_20px_rgba(var(--color-gold-rgb), 0.15)]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">{t("contact.form_email_label")}</label>
                <motion.input
                  type="email"
                  placeholder={t("contact.form_email_placeholder")}
                  whileFocus={{ scale: 1.01 }}
                  className="w-full rounded-lg border border-white/10 bg-[var(--color-primary)]/80 px-4 py-3 text-sm text-white placeholder-white/60 transition-all duration-300 focus:border-[var(--color-gold)] focus:outline-none focus:ring-[3px] focus:ring-[var(--color-gold)]/20 focus:shadow-[0_0_20px_rgba(var(--color-gold-rgb), 0.15)]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">{t("contact.form_phone_label")}</label>
                <motion.input
                  type="tel"
                  placeholder={t("contact.form_phone_placeholder")}
                  whileFocus={{ scale: 1.01 }}
                  className="w-full rounded-lg border border-white/10 bg-[var(--color-primary)]/80 px-4 py-3 text-sm text-white placeholder-white/60 transition-all duration-300 focus:border-[var(--color-gold)] focus:outline-none focus:ring-[3px] focus:ring-[var(--color-gold)]/20 focus:shadow-[0_0_20px_rgba(var(--color-gold-rgb), 0.15)]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">{t("contact.form_message_label")}</label>
                <motion.textarea
                  placeholder={t("contact.form_message_placeholder")}
                  rows={4}
                  whileFocus={{ scale: 1.01 }}
                  className="w-full rounded-lg border border-white/10 bg-[var(--color-primary)]/80 px-4 py-3 text-sm text-white placeholder-white/60 transition-all duration-300 focus:border-[var(--color-gold)] focus:outline-none focus:ring-[3px] focus:ring-[var(--color-gold)]/20 focus:shadow-[0_0_20px_rgba(var(--color-gold-rgb), 0.15)]"
                />
              </div>
              {/* Real Google reCAPTCHA */}
              <div className="flex justify-center rounded-lg border border-white/10 bg-black/30 px-4 py-4">
                <div
                  className="g-recaptcha"
                  data-sitekey="6LdbHk0UAAAAAAJrcrI7qcHPVr7u3U-xHTVQy032"
                  data-theme="dark"
                />
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(var(--color-gold-rgb), 0.4)" }}
                whileTap={{ scale: 0.97 }}
                animate={{ boxShadow: ["0 0 15px rgba(var(--color-gold-rgb), 0.2)", "0 0 25px rgba(var(--color-gold-rgb), 0.4)", "0 0 15px rgba(var(--color-gold-rgb), 0.2)"] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="shimmer-btn shimmer-btn-gold relative w-full rounded-lg bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-gold)] to-[var(--color-primary)] px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:from-[var(--color-gold)] hover:via-[var(--color-gold-light)] hover:to-[var(--color-gold)]"
              >
                <span className="relative z-10">{t("contact.form_submit")}</span>
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

function generateFooter(business: BusinessData | null, name: string, pageSlugs: SitePage[], content: GeneratedContent, businessType: BusinessType = "other", site: ScrapedSite | null = null): string {
	  const year = new Date().getFullYear();
	  const navLinks = buildNavLinks(pageSlugs, businessType);
	  const quickLinks = renderNavLinks(
	    navLinks,
	    "block text-sm text-gray-400 transition-all duration-300 hover:text-[var(--color-gold)] hover:translate-x-1 cursor-pointer"
	  );

	  // Build full text from scraped data (preserve ALL original text)
	  const nameSlug = name.toLowerCase().replace(/\s+/g, '');
	  const scrapedText = site?.allText || "";
	  const scrapedParagraphs = site?.pages?.flatMap(p => p.paragraphs) || [];
	  const allFooterText = scrapedParagraphs.length > 0
	    ? scrapedParagraphs.join("\\n\\n")
	    : scrapedText
	      ? scrapedText.substring(0, 2000)
	      : `${name} — Todos los derechos reservados.`;

	  // Legal PDF links
	  const legalPdfUrl = `https://${nameSlug}.com/docs/Legal-Term-${name.replace(/\s+/g, '-')}-Esp.pdf`;
	  const transparenciaPdfUrl = `https://${nameSlug}.com/docs/MEMORIA-TRANSPARENCIA-${name.replace(/\s+/g, '-').toUpperCase()}.pdf`;

	  // Full legal notice text
	  const legalText = `NOTA LEGAL Y CONDICIONES DE USO. ${name} (en adelante, "la Empresa") con CIF/NIF correspondiente y domicilio social en la dirección registrada, pone a disposición de los usuarios del presente sitio web el presente documento con el que pretende dar cumplimiento a las obligaciones dispuestas en la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), así como informar a todos los usuarios acerca de las condiciones de uso del sitio web. El acceso y uso del portal atribuye la condición de usuario e implica la aceptación plena y sin reservas de todas y cada una de las disposiciones incluidas en este Aviso Legal. Quien no acepte estas condiciones deberá abstenerse de utilizar el portal. ${name} se reserva el derecho de modificar en cualquier momento las condiciones de uso del sitio web. CIF: B-12345678 | I-AV: I-AV-0001234.4`;

	  // Full address
	  const scrapedAddr = site?.pages?.[0]?.contactInfo?.address?.[0] || business?.address;
	  const fullAddress = scrapedAddr
	    ? `${name}, ${scrapedAddr}`
	    : `${name} - Dirección disponible próximamente`;

	  // ─── Per-language hero subtitle map ───
	  const heroSubtitleMap: Record<string, string> = { es: content.heroSubtitle || "Welcome to our establishment. We look forward to serving you." };
	  if (site?.languageContent) {
	    for (const [code, lc] of Object.entries(site.languageContent)) {
	      const langContent = lc as { heroSubtitle?: string; tagline?: string };
	      if (langContent.heroSubtitle) heroSubtitleMap[code] = langContent.heroSubtitle;
	      else if (langContent.tagline) heroSubtitleMap[code] = langContent.tagline;
	    }
	  }

	  return `// ============================================================
//  Footer — Gradient Background + Glow Links + Animated Border
//  MAXIMUM WOW EDITION — Full Legal + Transparencia + PDFs
// ============================================================

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useLanguage } from "@/lib/i18n";

export default function Footer() {
  const { t, lang } = useLanguage();
  const __ = (m: Record<string,string>) => m[lang] || m.es || "";
  return (
    <footer className="relative px-4 py-16 overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-section" />
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-gold) 50%, var(--color-primary) 100%)",
          backgroundSize: "400% 400%",
          animation: "gradient 6s ease infinite",
        }}
      />

      {/* Animated Border Top */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: "linear-gradient(90deg, transparent, var(--color-gold), var(--color-primary), var(--color-gold), transparent)",
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
              {__(${JSON.stringify(heroSubtitleMap)})}
            </p>
            {/* Address */}
            <p className="mt-4 text-xs text-gray-500 leading-relaxed">
              ${escapeJsx(fullAddress)}
            </p>
            {/* Social / Watermark link with Glow Hover */}
            <div className="mt-6 flex gap-4">
              <motion.a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2, y: -2 }}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm text-gray-400 transition-all duration-300 hover:border-[var(--color-gold)]/50 hover:bg-[var(--color-gold)]/10 hover:text-[var(--color-gold)] hover:shadow-[0_0_15px_rgba(var(--color-gold-rgb), 0.3)] cursor-pointer"
                style={{cursor:'pointer'}}
              >
                f
              </motion.a>
              <motion.a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2, y: -2 }}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm text-gray-400 transition-all duration-300 hover:border-[var(--color-gold)]/50 hover:bg-[var(--color-gold)]/10 hover:text-[var(--color-gold)] hover:shadow-[0_0_15px_rgba(var(--color-gold-rgb), 0.3)] cursor-pointer"
                style={{cursor:'pointer'}}
              >
                ig
              </motion.a>
              <motion.a
                href="https://tripadvisor.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2, y: -2 }}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm text-gray-400 transition-all duration-300 hover:border-[var(--color-gold)]/50 hover:bg-[var(--color-gold)]/10 hover:text-[var(--color-gold)] hover:shadow-[0_0_15px_rgba(var(--color-gold-rgb), 0.3)] cursor-pointer"
                style={{cursor:'pointer'}}
              >
                ta
              </motion.a>
            </div>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">{t("footer.links")}</h4>
            <div className="space-y-3 text-sm">
              ${quickLinks}
            </div>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">{t("footer.legal_heading")}</h4>
            <div className="space-y-3 text-sm text-gray-400">
              <a
                href="${escapeJsx(legalPdfUrl)}"
                target="_blank"
                rel="noopener noreferrer"
                className="block transition-all duration-200 hover:text-[var(--color-gold)] hover:translate-x-1 cursor-pointer"
                style={{cursor:'pointer'}}
              >{t("footer.legal")}</a>
              <a
                href="${escapeJsx(transparenciaPdfUrl)}"
                target="_blank"
                rel="noopener noreferrer"
                className="block transition-all duration-200 hover:text-[var(--color-gold)] hover:translate-x-1 cursor-pointer"
                style={{cursor:'pointer'}}
              >{t("footer.transparency")}</a>
              <Link
                href="/legal"
                className="block transition-all duration-200 hover:text-[var(--color-gold)] hover:translate-x-1 cursor-pointer"
                style={{cursor:'pointer'}}
              >{t("footer.legal_notice")}</Link>
              <Link
                href="/privacy"
                className="block transition-all duration-200 hover:text-[var(--color-gold)] hover:translate-x-1 cursor-pointer"
                style={{cursor:'pointer'}}
              >{t("footer.privacy")}</Link>
            </div>
          </div>
        </motion.div>

        {/* ── Full Legal Text Section (preserved from original site) ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-8 border-t border-white/10 pt-6"
        >
          <div className="max-w-full text-xs text-gray-500 leading-relaxed space-y-3">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
              <a
                href="${escapeJsx(legalPdfUrl)}"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 font-medium text-xs uppercase tracking-wider hover:text-[var(--color-gold)] transition-colors cursor-pointer"
              >{t("footer.legal")}</a>
              <span className="text-gray-600 text-xs">|</span>
              <a
                href="${escapeJsx(transparenciaPdfUrl)}"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 font-medium text-xs uppercase tracking-wider hover:text-[var(--color-gold)] transition-colors cursor-pointer"
              >{t("footer.transparency")}</a>
            </div>
            <p>
              {__(${JSON.stringify({ es: "De conformidad con lo dispuesto en el artículo 10 de la Ley 34/2002, de 11 de julio, de servicios de la sociedad de la información y de comercio electrónico, se informa al usuario que el titular del presente sitio web es " + name + " S.L.U., con domicilio en la dirección registrada, con CIF/NIF correspondiente, Agencia de Viajes legalmente constituida. La actividad comprende la organización y comercialización de viajes combinados. Así mismo se informa que se encuentra a disposición de nuestros clientes las correspondientes hojas de reclamaciones debidamente autorizadas.", en: "In accordance with the provisions of Article 10 of Law 34/2002, of July 11, on information society services and electronic commerce, the user is informed that the owner of this website is " + name + " S.L.U., with registered address, with corresponding Tax ID, Travel Agency legally constituted. The activity includes the organization and marketing of package tours. Likewise, complaint forms duly authorized are available to our customers.", ro: "În conformitate cu prevederile articolului 10 din Legea 34/2002 din 11 iulie privind serviciile societății informaționale și comerțul electronic, utilizatorul este informat că proprietarul acestui site web este " + name + " S.L.U., cu sediul social la adresa înregistrată, cu CIF/NIF corespunzător, Agenție de Turism constituită legal. Activitatea include organizarea și comercializarea de pachete turistice. De asemenea, formularele de reclamații autorizate sunt puse la dispoziția clienților noștri.", hu: "A 34/2002. számú, július 11-i törvény 10. cikkének rendelkezéseivel összhangban, amely az információs társadalom szolgáltatásairól és az elektronikus kereskedelemmel foglalkozik, a felhasználó tájékoztatást kap arról, hogy a weboldal tulajdonosa " + name + " S.L.U., bejegyzett címmel, megfelelő CIF/NIF számmal, jogilag megalapított Utazási Iroda. A tevékenység magában foglalja az utazási csomagok szervezését és értékesítését. Továbbá, a megfelelően engedélyezett panaszfüzetek ügyfeleink rendelkezésére állnak." })})}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 border-t border-white/10 pt-8 text-center text-xs text-gray-500 leading-relaxed"
        >
          <p className="mt-4">&copy; ${year} ${escapeJsx(name)}. {t("footer.copyright")}</p>
          <p className="mt-2">CIF: B-12345678 | I-AV: I-AV-0001234.4</p>
          <p className="mt-2">${escapeJsx(fullAddress)}</p>
          <p className="mt-2">{t("footer.made_with")} <a href="https://alexawebservers.com" target="_blank" rel="noopener noreferrer" className="text-[var(--color-gold)] hover:text-[var(--color-gold-light)] transition-colors cursor-pointer" style={{cursor:'pointer'}}>alexawebservers.com</a></p>
        </motion.div>
      </div>
    </footer>
  );
}
`;
}

// ─── Islands / Destinations — 3 Island Cards ──────────────────────

function generateIslands(): string {
  return `// ============================================================
//  Islands — Destination Cards with Images and Descriptions
//  MAXIMUM WOW EDITION
// ============================================================

"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { useLanguage } from "@/lib/i18n";

const ISLANDS = [
  { titleKey: "island_tenerife.title", descKey: "island_tenerife.text", extraKey: "island_tenerife.extra", image: "https://placehold.co/800x600/e2e8f0/64748b?text=Tenerife" },
  { titleKey: "island_grancanaria.title", descKey: "island_grancanaria.text", extraKey: "island_grancanaria.extra", image: "https://placehold.co/800x600/e2e8f0/64748b?text=Gran+Canaria" },
  { titleKey: "island_other.title", descKey: "island_other.text", extraKey: "island_other.extra", image: "https://placehold.co/800x600/e2e8f0/64748b?text=Canarias" },
];

export default function Islands() {
  const { t } = useLanguage();
  return (
    <section id="excursions" className="relative px-4 py-24 overflow-hidden">
      <div className="absolute inset-0 bg-section" />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: "radial-gradient(circle at 30% 50%, rgba(var(--color-gold-rgb), 0.08), transparent 50%)",
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
          <span className="mb-4 block text-xs uppercase tracking-[0.3em] text-[var(--color-gold)]/60">{t("excursions.subtitle")}</span>
          <h2 className="text-3xl font-bold text-white md:text-4xl gradient-text">{t("islands.title")}</h2>
          <p className="mx-auto mt-3 max-w-xl text-gray-400">
            {t("excursions.text")}
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {ISLANDS.map((island, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 100, damping: 15 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-[var(--color-gold)]/30 hover:shadow-[0_0_30px_rgba(var(--color-gold-rgb), 0.1)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                <div
                  className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundImage: \`url(\${island.image})\` }}
                />
                <div className="absolute bottom-0 left-0 right-0 z-20 p-6">
                  <span className="mb-2 inline-block rounded-full bg-[var(--color-gold)]/20 px-3 py-1 text-xs font-medium text-[var(--color-gold)]">
                    {t("island.badge")}
                  </span>
                  <h3 className="text-xl font-bold text-white">{t(island.titleKey)}</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm leading-relaxed text-gray-300">
                  {t(island.descKey)}
                </p>
                <div className="mt-4 border-t border-white/10 pt-4">
                  <p className="text-xs leading-relaxed text-gray-400 italic">
                    {t(island.extraKey)}
                  </p>
                </div>
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

// ─── GeneratedPage — AnimatePresence page transition ──────────────

function generateLayout(name: string, businessType: BusinessType = "other"): string {
	  const includeIslands = businessType === "travel";
	  const islandsImport = includeIslands ? `import Islands from "@/components/theme/Islands";\n` : "";
	  const islandsComponent = includeIslands ? `          <Islands />\n` : "";
  return `// ============================================================
//  GeneratedPage — Smooth Page Transition with AnimatePresence
//  MAXIMUM WOW EDITION
// ============================================================

"use client";

import "./theme.css";
import { motion, AnimatePresence } from "framer-motion";
import { LanguageProvider } from "@/lib/i18n";
import ThemeProvider from "@/components/theme/ThemeProvider";
import Header from "@/components/theme/Header";
import Footer from "@/components/theme/Footer";
import Hero from "@/components/theme/Hero";
import About from "@/components/theme/About";
${islandsImport}import Services from "@/components/theme/Services";
import Reviews from "@/components/theme/Reviews";
import Contact from "@/components/theme/Contact";

export default function GeneratedPage() {
  return (
    <ThemeProvider>
    <LanguageProvider>
    <AnimatePresence mode="wait">
      <motion.div
        key="page"
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.98 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex min-h-screen flex-col bg-page text-page"
      >
        <Header />
        <main className="flex-1">
          <Hero />
          <About />
${islandsComponent}          <Services />
          <Reviews />
          <Contact />
        </main>
        <Footer />
      </motion.div>
    </AnimatePresence>
    </LanguageProvider>
    </ThemeProvider>
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
  pageSlugs: SitePage[] = [],
  /** Optional: override business type (from name detection, etc.) */
  overrideType?: BusinessType
): Promise<ThemeConfig> {
  const name = business?.name || site?.businessName || "My Business";
  const businessType = overrideType || site?.businessType || "other";

  // Extract dominant colours from scraped photos
  const photoColors = await extractColorsFromPhotos(photos, outputDir);
  if (photoColors.length > 0) {
    console.log(`   🎨 Extracted ${photoColors.length} colours from photos: ${photoColors.join(", ")}`);
  }

  const palette = determinePalette(site, businessType, name, photoColors);

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
    { name: "Header.tsx", content: generateHeader(name, pageSlugs, businessType, site) },
    { name: "Hero.tsx", content: generateHero(content, config, heroPhoto, site) },
    { name: "About.tsx", content: generateAbout(content, aboutPhoto, site) },
    ...(businessType === "travel" ? [{ name: "Islands.tsx", content: generateIslands() }] : []),
    { name: "Services.tsx", content: generateServices(content, config) },
    { name: "Reviews.tsx", content: generateReviews(reviews) },
    { name: "Contact.tsx", content: generateContact(site, business, config) },
    { name: "Footer.tsx", content: generateFooter(business, name, pageSlugs, content, businessType, site) },
    { name: "GeneratedPage.tsx", content: generateLayout(name, businessType) },
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
