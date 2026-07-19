#!/usr/bin/env node
/**
 * E2E Comparison Test — compares a deployed WordPress site
 * against the captured Next.js reference.
 *
 * Usage:
 *   node tests/e2e/compare-wp.mjs <wp-url> [--reference-dir <dir>] [--output-dir <dir>]
 *
 * Returns exit code 0 if all sections match, 1 if differences found.
 * Generates a diff report in the output dir.
 */
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REFERENCE_DIR = resolve(process.argv[3] || './tests/e2e/reference');
const OUTPUT_DIR = resolve(process.argv[5] || './tests/e2e/comparison');

const url = process.argv[2];
if (!url) {
  console.error('Usage: node compare-wp.mjs <wp-url> [--reference-dir <dir>] [--output-dir <dir>]');
  process.exit(1);
}

function log(...args) { console.log('[compare]', ...args); }

mkdirSync(OUTPUT_DIR, { recursive: true });

// Load reference data
const referenceSections = JSON.parse(readFileSync(resolve(REFERENCE_DIR, 'sections.json'), 'utf-8'));
const referenceCssVars = JSON.parse(readFileSync(resolve(REFERENCE_DIR, 'css-vars.json'), 'utf-8'));
const referenceHtml = readFileSync(resolve(REFERENCE_DIR, 'full-page.html'), 'utf-8');
const referenceReport = JSON.parse(readFileSync(resolve(REFERENCE_DIR, 'report.json'), 'utf-8'));

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});
const page = await context.newPage();

log('Navigating to WP site:', url);
await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(3000); // Let animations settle

// ======== SCREENSHOT ========
log('Capturing WP screenshot...');
await page.screenshot({ path: resolve(OUTPUT_DIR, 'wp-screenshot-full.png'), fullPage: true });

// ======== CAPTURE WP DATA ========
const wpSections = await page.evaluate(() => {
  const result = {};
  const heroEl = document.querySelector('section:first-of-type, [class*="hero"]');
  if (heroEl) result.hero = heroEl.innerText;

  const aboutSel = document.querySelectorAll('#about');
  aboutSel.forEach(el => { result.about = el.innerText; });

  const servicesSel = document.querySelectorAll('#services');
  servicesSel.forEach(el => { result.services = el.innerText; });

  const reviewsSel = document.querySelectorAll('#reviews');
  reviewsSel.forEach(el => { result.reviews = el.innerText; });

  const contactSel = document.querySelectorAll('#contact');
  contactSel.forEach(el => { result.contact = el.innerText; });

  const footerEl = document.querySelector('footer');
  if (footerEl) result.footer = footerEl.innerText;

  const navEl = document.querySelector('header nav, nav');
  if (navEl) result.navigation = navEl.innerText;

  return result;
});

const wpImages = await page.evaluate(() => {
  const imgs = document.querySelectorAll('img, [style*="background-image"]');
  const results = [];
  imgs.forEach(el => {
    const src = el.getAttribute('src') ||
      el.style.backgroundImage?.match(/url\(['"]?([^'")]+)['"]?\)/)?.[1] || '';
    if (src && !src.startsWith('data:')) results.push({ src, alt: el.getAttribute('alt') || '' });
  });
  return results;
});

const wpMetadata = await page.evaluate(() => ({
  title: document.title,
  description: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
  lang: document.documentElement.lang,
}));

const wpHtml = await page.content();
writeFileSync(resolve(OUTPUT_DIR, 'wp-page.html'), wpHtml, 'utf-8');
writeFileSync(resolve(OUTPUT_DIR, 'wp-sections.json'), JSON.stringify(wpSections, null, 2));

// ======== COMPARISON ========
const failures = [];
const passes = [];

// Check all reference sections exist in WP
for (const [sectionName, refText] of Object.entries(referenceSections)) {
  const wpText = wpSections[sectionName];
  if (!wpText) {
    failures.push(`MISSING: Section "${sectionName}" not found in WP output`);
    continue;
  }

  // Check section has real content (not empty)
  if (wpText.trim().length < 10) {
    failures.push(`EMPTY: Section "${sectionName}" has negligible content (${wpText.trim().length} chars)`);
    continue;
  }

  // Check core business name appears
  if (wpText.includes("Daria's Bakery") || wpText.includes("Bakery") || refText.includes("Bakery")) {
    const nameInWp = wpText.includes("Daria");
    if (!nameInWp && refText.includes("Daria")) {
      failures.push(`CONTENT: Section "${sectionName}" missing business name "Daria"`);
    } else {
      passes.push(`Section "${sectionName}": Contains business name ✓`);
    }
  }

  // Check no dummy text
  if (/lorem ipsum|placeholder|dummy text/i.test(wpText)) {
    failures.push(`DUMMY: Section "${sectionName}" contains placeholder text`);
  } else {
    passes.push(`Section "${sectionName}": No placeholder text ✓`);
  }

  // Check has substantial content
  if (wpText.trim().length >= refText.trim().length * 0.5) {
    passes.push(`Section "${sectionName}": Content length ${wpText.trim().length} chars (ref: ${refText.trim().length}) ✓`);
  } else {
    failures.push(`SHORT: Section "${sectionName}" too short (${wpText.trim().length} vs ref ${refText.trim().length})`);
  }
}

// Check WP metadata
if (wpMetadata.title && wpMetadata.title.length > 0) {
  passes.push(`Page title: "${wpMetadata.title}" ✓`);
} else {
  failures.push('Missing page title');
}
if (wpMetadata.lang === 'es' || wpMetadata.lang === 'en' || wpMetadata.lang.startsWith('es')) {
  passes.push(`Language: ${wpMetadata.lang} ✓`);
} else {
  failures.push(`Language: expected es/en, got "${wpMetadata.lang}"`);
}

// Check images
if (wpImages.length > 0) {
  passes.push(`Images: ${wpImages.length} found ✓`);
} else {
  failures.push('No images found on page');
}

// Check footer
if (wpSections.footer && wpSections.footer.trim().length > 10) {
  passes.push(`Footer present ✓`);
} else {
  failures.push('Footer missing or empty');
}

// Check navigation
if (wpSections.navigation && wpSections.navigation.trim().length > 10) {
  passes.push(`Navigation present ✓`);
} else {
  failures.push('Navigation missing or empty');
}

// Check all 5 main sections exist
const requiredSections = ['hero', 'about', 'services', 'reviews', 'contact', 'footer'];
for (const section of requiredSections) {
  if (wpSections[section]) {
    passes.push(`Required section "${section}" present ✓`);
  } else {
    failures.push(`Required section "${section}" MISSING`);
  }
}

// ======== REPORT ========
const report = {
  url,
  capturedAt: new Date().toISOString(),
  results: {
    passes: passes.length,
    failures: failures.length,
    total: passes.length + failures.length,
  },
  passes,
  failures,
  wpSections: Object.keys(wpSections),
  wpMetadata,
  wpImageCount: wpImages.length,
};
writeFileSync(resolve(OUTPUT_DIR, 'comparison-report.json'), JSON.stringify(report, null, 2));

// ======== SUMMARY ========
console.log('\n' + '='.repeat(60));
console.log('  COMPARISON RESULTS');
console.log('='.repeat(60));
console.log(`  Passes:   ${passes.length}`);
console.log(`  Failures: ${failures.length}`);
console.log(`  Rate:     ${passes.length / (passes.length + failures.length) * 100}%`);
console.log('='.repeat(60));

if (passes.length > 0) {
  console.log('\n  ✅ PASSES:');
  passes.forEach(p => console.log(`    ${p}`));
}
if (failures.length > 0) {
  console.log('\n  ❌ FAILURES:');
  failures.forEach(f => console.log(`    ${f}`));
}

console.log(`\n  Report: ${resolve(OUTPUT_DIR, 'comparison-report.json')}`);
console.log('='.repeat(60));

await browser.close();
process.exit(failures.length > 0 ? 1 : 0);
