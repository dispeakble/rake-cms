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
  return `/* Rake CMS — Theme: ${config.name} - MAXIMUM WOW EDITION */

:root {
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
function buildNavLinks(_pageSlugs: SitePage[], businessType?: BusinessType): SitePage[] {
	  const sectionLinks: SitePage[] = [
	    { slug: "/#about", label: "Sobre nosotros" },
	    { slug: "/#services", label: "Qué ofrecemos" },
	    { slug: "/#contact", label: "Contacto" },
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
      (link) =>
        `<Link href="${escapeJsx(link.slug)}" className="${escapeJsx(className)}"${isMobile ? ` onClick={() => setOpen(false)}` : ""}>${escapeJsx(link.label)}</Link>`
    )
    .join("\n          ");
}

// ─── Header — GLASSMORPHISM WOW ───────────────────────────────────

function generateHeader(name: string, pageSlugs: SitePage[], businessType: BusinessType = "other"): string {
	  const navLinks = buildNavLinks(pageSlugs, businessType);
	  const desktopLinks = renderNavLinks(
	    navLinks,
	    `relative text-sm font-medium text-white/70 transition-colors hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[var(--color-gold)] after:to-[var(--color-gold-light)] after:transition-all after:duration-300 hover:after:w-full`
	  );
	  const mobileLinks = renderNavLinks(
	    navLinks,
	    "text-base font-medium text-white/80 transition hover:text-[var(--color-gold)]",
	    true
	  );

	  // Business-type-specific CTA link (3rd slot in nav, after Inicio + navLinks)
	  let ctaDesktop: string;
	  let ctaMobile: string;
	  const ctaBtnClass = `relative text-sm font-medium text-white/70 transition-colors hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[var(--color-gold)] after:to-[var(--color-gold-light)] after:transition-all after:duration-300 hover:after:w-full`;

	  if (businessType === "restaurant") {
	    ctaDesktop = `<a href="/#contact" className="${ctaBtnClass}">Reservas</a>`;
	    ctaMobile = `<a href="/#contact" className="text-base font-medium text-white/80 transition hover:text-[var(--color-gold)]" onClick={() => setOpen(false)}>Reservas</a>`;
	  } else if (businessType === "travel") {
	    ctaDesktop = `<a href="/#contact" className="${ctaBtnClass}">Contactar</a>`;
	    ctaMobile = `<a href="/#contact" className="text-base font-medium text-white/80 transition hover:text-[var(--color-gold)]" onClick={() => setOpen(false)}>Contactar</a>`;
	  } else {
	    ctaDesktop = `<a href="/#contact" className="${ctaBtnClass}">Contactar</a>`;
	    ctaMobile = `<a href="/#contact" className="text-base font-medium text-white/80 transition hover:text-[var(--color-gold)]" onClick={() => setOpen(false)}>Contactar</a>`;
	  }

	  // Extra nav items: Inicio (home), CTA (desktop & mobile)
	  const extraDesktopLinks = [
	    `<Link href="/" className="relative text-sm font-medium text-white/70 transition-colors hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[var(--color-gold)] after:to-[var(--color-gold-light)] after:transition-all after:duration-300 hover:after:w-full">Inicio</Link>`,
	    ctaDesktop,
	  ];
	  const extraMobileLinks = [
	    `<Link href="/" className="text-base font-medium text-white/80 transition hover:text-[var(--color-gold)]" onClick={() => setOpen(false)}>Inicio</Link>`,
	    ctaMobile,
	  ];

	  return `// ============================================================
	//  Header — Matte Glass Always On + Shimmer Nav Hover + Lang Toggle
	//  MAXIMUM WOW EDITION
	// ============================================================

	"use client";

	import Link from "next/link";
	import { useState, useEffect } from "react";
	import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";

	export default function Header() {
	  const [open, setOpen] = useState(false);
	  const [lang, setLang] = useState("es");
	  const { scrollY } = useScroll();

	  // Always-on glass background — starts at 70% opacity, goes to 90% on scroll
	  const bgOpacity = useTransform(scrollY, [0, 80], [0.7, 0.9]);
	  const blurAmount = useTransform(scrollY, [0, 80], [12, 24]);
	  const borderOpacity = useTransform(scrollY, [0, 80], [0.08, 0.15]);

	  // ─── Language dropdown state ───
	  const [langOpen, setLangOpen] = useState(false);

	  useEffect(() => {
	    document.documentElement.setAttribute("lang", lang);
	  }, [lang]);

	  const switchLang = (next: string) => {
	    setLang(next);
	    setLangOpen(false);
	    document.documentElement.setAttribute("lang", next);
	    // Show/hide content by language
	    document.querySelectorAll("[data-lang]").forEach(el => {
	      (el as HTMLElement).style.display = el.getAttribute("data-lang") === next ? "" : "none";
	    });
	  };

	  return (
	    <motion.header
	      initial={{ y: -100, opacity: 0 }}
	      animate={{ y: 0, opacity: 1 }}
	      transition={{ type: "spring", stiffness: 100, damping: 25, delay: 0.2 }}
	      className="fixed top-0 left-0 right-0 z-50"
	    >
	      <motion.div
	        style={{
	          backgroundColor: bgOpacity,
	          backdropFilter: \`blur(\${blurAmount}px)\`,
	          WebkitBackdropFilter: \`blur(\${blurAmount}px)\`,
	          borderColor: \`rgba(255,255,255,\${borderOpacity})\`,
	        }}
	        className="border-b border-white/10 shadow-lg shadow-black/20 transition-shadow duration-500"
	      >
	        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
	          {/* Logo with gradient glow */}
	          <Link href="/" className="group relative">
	            <span className="text-xl font-black tracking-tight text-white transition-all duration-300 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[var(--color-gold)] group-hover:to-[var(--color-gold-light)]">
	              ${escapeJsx(name)}
	            </span>
	            <span className="absolute -bottom-0.5 left-0 h-[2px] w-0 bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-light)] transition-all duration-300 group-hover:w-full" />
	          </Link>

	          {/* Desktop Nav */}
	          <nav className="hidden items-center gap-8 md:flex">
	            ${extraDesktopLinks[0]}
	            ${desktopLinks}
	            ${extraDesktopLinks[1]}
	            {/* ─── Language Dropdown ─── */}
	            <div className="relative">
	              <button
	                onClick={() => setLangOpen(!langOpen)}
	                onBlur={() => setTimeout(() => setLangOpen(false), 200)}
	                className="flex items-center gap-1 relative text-sm font-medium text-[var(--color-gold)] hover:text-[var(--color-gold-light)] transition-colors cursor-pointer bg-transparent border-none"
	              >
	                {lang === "es" ? "ES" : "EN"}
	                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
	                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={langOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
	                </svg>
	              </button>
	              {langOpen && (
	                <div className="absolute right-0 mt-1 w-20 rounded-lg border border-white/10 bg-black/90 backdrop-blur-xl shadow-xl overflow-hidden z-50">
	                  <button
	                    onClick={() => switchLang("es")}
	                    className={`w-full px-3 py-2 text-xs font-medium text-left transition-colors hover:bg-white/10 ${lang === "es" ? "text-[var(--color-gold)] bg-white/5" : "text-white/60"}`}
	                  >
	                    🇪🇸 ES
	                  </button>
	                  <button
	                    onClick={() => switchLang("en")}
	                    className={`w-full px-3 py-2 text-xs font-medium text-left transition-colors hover:bg-white/10 ${lang === "en" ? "text-[var(--color-gold)] bg-white/5" : "text-white/60"}`}
	                  >
	                    🇬🇧 EN
	                  </button>
	                </div>
	              )}
	            </div>
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
	                ${extraMobileLinks[0]}
	                ${mobileLinks.split("\\\\n").map(l => l.trim()).join("\\\\n")}
	                ${extraMobileLinks[1]}
	                <div className="relative">
	                  <button
	                    onClick={() => setLangOpen(!langOpen)}
	                    className="flex items-center gap-1 text-base font-medium text-[var(--color-gold)] cursor-pointer hover:text-[var(--color-gold-light)] transition-colors bg-transparent border-none text-left"
	                  >
	                    {lang === "es" ? "ES" : "EN"}
	                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
	                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={langOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
	                    </svg>
	                  </button>
	                  {langOpen && (
	                    <div className="mt-1 w-20 rounded-lg border border-white/10 bg-black/90 backdrop-blur-xl shadow-xl overflow-hidden">
	                      <button
	                        onClick={() => { switchLang("es"); setOpen(false); }}
	                        className={`w-full px-3 py-2 text-xs font-medium text-left transition-colors hover:bg-white/10 ${lang === "es" ? "text-[var(--color-gold)] bg-white/5" : "text-white/60"}`}
	                      >
	                        🇪🇸 ES
	                      </button>
	                      <button
	                        onClick={() => { switchLang("en"); setOpen(false); }}
	                        className={`w-full px-3 py-2 text-xs font-medium text-left transition-colors hover:bg-white/10 ${lang === "en" ? "text-[var(--color-gold)] bg-white/5" : "text-white/60"}`}
	                      >
	                        🇬🇧 EN
	                      </button>
	                    </div>
	                  )}
	                </div>
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
    ? "Explora menú y precios"
    : "Explora nuestros servicios";
  const ctaSecondary = config.businessType === "restaurant"
    ? "Reserve Your Table"
    : "Contacta con nosotros";

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
          background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-gold) 25%, #1a0a0a 50%, var(--color-primary) 75%, var(--color-gold) 100%)",
          backgroundSize: "400% 400%",
          animation: "gradient 8s ease infinite",
        }}
      />

      {/* ── 2. Floating Glow Particles / Embers (6+ circles) ── */}
      <motion.div
        className="absolute top-[15%] left-[10%] h-4 w-4 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(var(--color-gold-rgb), 0.8), transparent)" }}
        animate={{ y: [0, -30, 0], x: [0, 15, 0], opacity: [0.4, 1, 0.4] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[25%] right-[15%] h-6 w-6 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(var(--color-gold-rgb), 0.6), transparent)" }}
        animate={{ y: [0, -25, 0], x: [0, -10, 0], opacity: [0.3, 0.8, 0.3] }}
        transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.5 }}
      />
      <motion.div
        className="absolute bottom-[30%] left-[20%] h-3 w-3 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(var(--color-primary-rgb), 0.8), transparent)" }}
        animate={{ y: [0, -20, 0], x: [0, -12, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute bottom-[20%] right-[25%] h-5 w-5 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(var(--color-gold-rgb), 0.7), transparent)" }}
        animate={{ y: [0, -35, 0], x: [0, 8, 0], opacity: [0.2, 0.9, 0.2] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 0.2 }}
      />
      <motion.div
        className="absolute top-[40%] left-[40%] h-8 w-8 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(var(--color-gold-rgb), 0.5), transparent)" }}
        animate={{ y: [0, -15, 0], x: [0, 20, 0], opacity: [0.1, 0.6, 0.1] }}
        transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1.5 }}
      />
      <motion.div
        className="absolute top-[60%] right-[10%] h-3 w-3 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(var(--color-primary-rgb), 0.9), transparent)" }}
        animate={{ y: [0, -22, 0], x: [0, -5, 0], opacity: [0.3, 0.7, 0.3] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.8 }}
      />

      {/* ── 7. Decorative Radial Gradient Overlay (pulsing) ── */}
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
          <span className="inline-block rounded-full border border-[var(--color-gold)]/30 bg-[var(--color-gold)]/10 px-6 py-2 text-xs uppercase tracking-[0.3em] text-[var(--color-gold)] backdrop-blur-sm">
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
            className="shimmer-btn shimmer-btn-gold relative inline-flex items-center rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-gold)] px-10 py-4 font-bold text-white shadow-[0_0_20px_rgba(var(--color-gold-rgb), 0.3)] transition-all duration-300 hover:shadow-[0_0_40px_rgba(var(--color-gold-rgb), 0.5)] hover:scale-105 active:scale-95"
          >
            <span className="relative z-10">${ctaPrimary}</span>
          </Link>
          <Link
            href="/#contact"
            className="shimmer-btn relative inline-flex items-center rounded-xl border-2 border-white/30 px-10 py-4 font-bold text-white transition-all duration-300 hover:border-[var(--color-gold)] hover:bg-[var(--color-gold)]/10 hover:shadow-[0_0_30px_rgba(var(--color-gold-rgb), 0.3)] hover:scale-105 active:scale-95"
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
          <div className="h-8 w-[1px] bg-gradient-to-b from-[var(--color-gold)] to-transparent" />
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
              <div className="absolute -inset-4 bg-gradient-to-r from-[var(--color-gold)]/20 via-[var(--color-primary)]/20 to-[var(--color-gold)]/20 rounded-2xl animate-[spin-slow_8s_linear_infinite] blur-2xl" />
              <div className="relative overflow-hidden rounded-2xl">
                <img src="${photo}" alt="${escapeJsx(content.aboutHeading)}" className="h-full w-full object-cover" />
              </div>
            </motion.div>`
    : `<motion.div
              className="aspect-square rounded-2xl bg-gradient-to-br from-[var(--color-gold)]/30 via-[var(--color-primary)]/20 to-black animate-[spin-slow_10s_linear_infinite]"
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
  const services = content.services && content.services.length > 0
    ? content.services
    : [{ title: config.name || "Nuestros Servicios", description: "Discover what we offer." }];
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
            radial-gradient(circle at 20% 30%, rgba(var(--color-primary-rgb), 0.3), transparent 40%),
            radial-gradient(circle at 80% 70%, rgba(var(--color-gold-rgb), 0.2), transparent 40%),
            radial-gradient(circle at 50% 50%, rgba(var(--color-primary-rgb), 0.15), transparent 50%)
          \`,
          backgroundSize: "100% 100%",
          animation: "breathe 6s ease-in-out infinite",
        }}
      />

      <div className="relative z-10 container mx-auto max-w-6xl">
        {/* ── Nuestros Servicios ── */}
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
              className="mb-4 block text-xs uppercase tracking-[0.3em] text-[var(--color-gold)]/60"
            >
              Lo que ofrecemos
            </motion.span>
            <h2 className="text-3xl font-bold text-white md:text-4xl gradient-text">Nuestros Servicios</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service, i) => (
              <TiltCard key={i} className="rounded-2xl p-[1px] glow-card">
                <div className="relative rounded-2xl bg-[#0a0a0f] p-8 h-full">
                  <span className="mb-2 inline-block rounded bg-[var(--color-gold)]/20 px-2 py-0.5 text-xs font-medium text-[var(--color-gold)]">#{(i + 1).toString().padStart(2, "0")}</span>
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
              className="mb-4 block text-xs uppercase tracking-[0.3em] text-[var(--color-gold)]/60"
            >
              Explora
            </motion.span>
            <h2 className="text-3xl font-bold text-white md:text-4xl gradient-text">Todo lo que ofrecemos</h2>
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
  return (
    <section id="reviews" className="relative px-4 py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0d] via-[#1a0a0a] to-[#0d0d0d]" />
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
          <span className="mb-4 block text-xs uppercase tracking-[0.3em] text-[var(--color-gold)]/60">Testimonios</span>
          <h2 className="text-3xl font-bold text-white md:text-4xl gradient-text">Lo que dicen nuestros clientes</h2>
          <p className="mx-auto mt-3 max-w-xl text-gray-400">Opiniones reales de clientes reales.</p>
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
  const infoText = config.businessType === "restaurant"
    ? "Estaremos encantados de atenderle. Si tiene alguna pregunta sobre nuestro menú, reservas o eventos especiales, no dude en contactarnos."
    : "Estaremos encantados de atenderle. Si tiene alguna pregunta sobre nuestros servicios, no dude en contactarnos.";
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
          <span className="mb-4 block text-xs uppercase tracking-[0.3em] text-[var(--color-gold)]/60">Contacto</span>
          <h2 className="text-3xl font-bold text-white md:text-4xl gradient-text">Contacto</h2>
          <p className="mx-auto mt-3 max-w-xl text-gray-400">Para más informacin, rellene el siguiente formulario.</p>
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
                <span className="text-[var(--color-gold)]">📋</span> Informacin
              </h3>
              <div className="space-y-3 text-sm text-gray-300">
                <p>${escapeJsx(infoText)}</p>
                <div className="mt-4 pt-3 border-t border-white/10">
                  <p className="text-xs text-gray-400">Le responderemos en un plazo de 24 horas.</p>
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
            <h3 className="mb-6 text-lg font-semibold text-white">Envanos un mensaje</h3>
            <form className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Nombre</label>
                <motion.input
                  type="text"
                  placeholder="Su nombre"
                  whileFocus={{ scale: 1.01 }}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-gray-500 transition-all duration-300 focus:border-[var(--color-gold)] focus:outline-none focus:ring-[3px] focus:ring-[var(--color-gold)]/20 focus:shadow-[0_0_20px_rgba(var(--color-gold-rgb), 0.15)]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Apellido</label>
                <motion.input
                  type="text"
                  placeholder="Su apellido"
                  whileFocus={{ scale: 1.01 }}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-gray-500 transition-all duration-300 focus:border-[var(--color-gold)] focus:outline-none focus:ring-[3px] focus:ring-[var(--color-gold)]/20 focus:shadow-[0_0_20px_rgba(var(--color-gold-rgb), 0.15)]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Correo electrnico</label>
                <motion.input
                  type="email"
                  placeholder="email@ejemplo.com"
                  whileFocus={{ scale: 1.01 }}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-gray-500 transition-all duration-300 focus:border-[var(--color-gold)] focus:outline-none focus:ring-[3px] focus:ring-[var(--color-gold)]/20 focus:shadow-[0_0_20px_rgba(var(--color-gold-rgb), 0.15)]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Telfono</label>
                <motion.input
                  type="tel"
                  placeholder="+34 123 456 789"
                  whileFocus={{ scale: 1.01 }}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-gray-500 transition-all duration-300 focus:border-[var(--color-gold)] focus:outline-none focus:ring-[3px] focus:ring-[var(--color-gold)]/20 focus:shadow-[0_0_20px_rgba(var(--color-gold-rgb), 0.15)]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Mensaje</label>
                <motion.textarea
                  placeholder="Escriba su mensaje..."
                  rows={4}
                  whileFocus={{ scale: 1.01 }}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-gray-500 transition-all duration-300 focus:border-[var(--color-gold)] focus:outline-none focus:ring-[3px] focus:ring-[var(--color-gold)]/20 focus:shadow-[0_0_20px_rgba(var(--color-gold-rgb), 0.15)]"
                />
              </div>
              {/* reCAPTCHA placeholder */}
              <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/30 px-4 py-3">
                <div className="flex h-6 w-6 items-center justify-center rounded border border-white/20 bg-white/5">
                  <input type="checkbox" className="h-4 w-4 accent-[var(--color-gold)]" />
                </div>
                <span className="text-xs text-gray-400">No soy un robot</span>
                <div className="ml-auto flex items-center gap-1 text-xs text-gray-500">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[var(--color-gold)]">
                    <rect x="2" y="2" width="20" height="20" rx="4" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  reCAPTCHA
                </div>
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(var(--color-gold-rgb), 0.4)" }}
                whileTap={{ scale: 0.97 }}
                animate={{ boxShadow: ["0 0 15px rgba(var(--color-gold-rgb), 0.2)", "0 0 25px rgba(var(--color-gold-rgb), 0.4)", "0 0 15px rgba(var(--color-gold-rgb), 0.2)"] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="shimmer-btn shimmer-btn-gold relative w-full rounded-lg bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-gold)] to-[var(--color-primary)] px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:from-[var(--color-gold)] hover:via-[var(--color-gold-light)] hover:to-[var(--color-gold)]"
              >
                <span className="relative z-10">Enviar mensaje</span>
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

function generateFooter(business: BusinessData | null, name: string, pageSlugs: SitePage[], content: GeneratedContent, businessType: BusinessType = "other"): string {
	  const year = new Date().getFullYear();
	  const navLinks = buildNavLinks(pageSlugs, businessType);
	  const quickLinks = renderNavLinks(
	    navLinks,
	    "block text-sm text-gray-400 transition-all duration-300 hover:text-[var(--color-gold)] hover:translate-x-1"
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
	              ${escapeJsx(content.heroSubtitle || "Welcome to our establishment. We look forward to serving you.")}
	            </p>
	            {/* Social / Watermark link with Glow Hover */}
	            <div className="mt-6 flex gap-4">
	              <motion.a
	                href="https://facebook.com"
	                target="_blank"
	                rel="noopener noreferrer"
	                whileHover={{ scale: 1.2, y: -2 }}
	                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm text-gray-400 transition-all duration-300 hover:border-[var(--color-gold)]/50 hover:bg-[var(--color-gold)]/10 hover:text-[var(--color-gold)] hover:shadow-[0_0_15px_rgba(var(--color-gold-rgb), 0.3)]"
	              >
	                f
	              </motion.a>
	              <motion.a
	                href="https://instagram.com"
	                target="_blank"
	                rel="noopener noreferrer"
	                whileHover={{ scale: 1.2, y: -2 }}
	                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm text-gray-400 transition-all duration-300 hover:border-[var(--color-gold)]/50 hover:bg-[var(--color-gold)]/10 hover:text-[var(--color-gold)] hover:shadow-[0_0_15px_rgba(var(--color-gold-rgb), 0.3)]"
	              >
	                ig
	              </motion.a>
	              <motion.a
	                href="https://tripadvisor.com"
	                target="_blank"
	                rel="noopener noreferrer"
	                whileHover={{ scale: 1.2, y: -2 }}
	                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm text-gray-400 transition-all duration-300 hover:border-[var(--color-gold)]/50 hover:bg-[var(--color-gold)]/10 hover:text-[var(--color-gold)] hover:shadow-[0_0_15px_rgba(var(--color-gold-rgb), 0.3)]"
	              >
	                ta
	              </motion.a>
	            </div>
	          </div>
	          <div>
	            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">Enlaces</h4>
	            <div className="space-y-3 text-sm">
	              ${quickLinks}
	            </div>
	          </div>
	          <div>
	            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">Legal</h4>
	            <div className="space-y-3 text-sm text-gray-400">
	              <Link
	                href="/legal"
	                className="block transition-all duration-200 hover:text-[var(--color-gold)] hover:translate-x-1"
	              >Aviso Legal</Link>
	              <Link
	                href="/privacy"
	                className="block transition-all duration-200 hover:text-[var(--color-gold)] hover:translate-x-1"
	              >Política de Privacidad</Link>
	            </div>
	          </div>
	        </motion.div>

	        <motion.div
	          initial={{ opacity: 0 }}
	          whileInView={{ opacity: 1 }}
	          viewport={{ once: true }}
	          transition={{ delay: 0.3 }}
	          className="mt-12 border-t border-white/10 pt-8 text-center text-xs text-gray-500 leading-relaxed"
	        >
	          <p className="mt-4">&copy; ${year} ${escapeJsx(name)}. Todos los derechos reservados.</p>
	          <p className="mt-2">Made with ❤️ by <a href="https://alexawebservers.com" target="_blank" rel="noopener noreferrer" className="text-[var(--color-gold)] hover:text-[var(--color-gold-light)] transition-colors">alexawebservers.com</a></p>
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

const ISLANDS = [
  {
    title: "Sobre Tenerife",
    description: "Tenerife es considerada como la isla de la 'primavera eterna' con un clima suave durante todo el ao. Es la isla más alta de las siete Islas Canarias debido al volcán Teide, que es 3718 metros de altura, siendo el pico más alto de España.",
    image: "https://placehold.co/800x600/1a0a0a/D4A017?text=Tenerife",
  },
  {
    title: "Sobre Gran Canaria",
    description: "Si usted deja ir su imaginación durante su visita a Gran Canaria, tendr la sensación de que en lugar de una isla, en realidad visitar tres continentes: frica, Europa y América. Es la tercera isla más grande del archipiélago canario.",
    image: "https://placehold.co/800x600/1a0a0a/D4A017?text=Tenerife",
  },
  {
    title: "Otras Islas Canarias",
    description: "La Gomera, Lanzarote, Fuerteventura, La Palma y El Hierro no son sólo nombres. Son 5 islas hermosas y vale la pena visitar. Cada uno tiene características diferentes: La Gomera es considerada como la última selva en Europa.",
    image: "https://placehold.co/800x600/1a0a0a/D4A017?text=Canarias",
  },
];

export default function Islands() {
  return (
    <section id="excursions" className="relative px-4 py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0d] via-[#1a0a0a] to-[#0d0d0d]" />
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
          <span className="mb-4 block text-xs uppercase tracking-[0.3em] text-[var(--color-gold)]/60">Destinos</span>
          <h2 className="text-3xl font-bold text-white md:text-4xl gradient-text">Descubre las Islas Canarias</h2>
          <p className="mx-auto mt-3 max-w-xl text-gray-400">
            Te invitamos a descubrir juntos el encanto y la singularidad de las Islas Canarias! Desde el pico del volcán, hasta 30 metros de profundidad en el Atlántico, ofrecemos una amplia gama de actividades y excursiones que representan el superlativo de la diversidad para cualquier persona, logrando satisfacer incluso los gustos más exigentes.
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
                    Isla Canaria
                  </span>
                  <h3 className="text-xl font-bold text-white">{island.title}</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm leading-relaxed text-gray-300">
                  {island.description}
                </p>
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
import Header from "@/components/theme/Header";
import Footer from "@/components/theme/Footer";
import Hero from "@/components/theme/Hero";
import About from "@/components/theme/About";
${islandsImport}import Services from "@/components/theme/Services";
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
${islandsComponent}          <Services />
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
    { name: "Header.tsx", content: generateHeader(name, pageSlugs, businessType) },
    { name: "Hero.tsx", content: generateHero(content, config, heroPhoto) },
    { name: "About.tsx", content: generateAbout(content, aboutPhoto) },
    { name: "Services.tsx", content: generateServices(content, config) },
    { name: "Reviews.tsx", content: generateReviews(reviews) },
    { name: "Contact.tsx", content: generateContact(site, business, config) },
    { name: "Footer.tsx", content: generateFooter(business, name, pageSlugs, content, businessType) },
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
