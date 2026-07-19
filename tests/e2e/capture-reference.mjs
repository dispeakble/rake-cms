#!/usr/bin/env node
/**
 * E2E Reference Capture — Scrapes the live Next.js site with Playwright
 * to produce a reusable reference for the WordPress comparison.
 *
 * Usage:
 *   node tests/e2e/capture-reference.mjs <url> [--output-dir <dir>]
 *
 * Captures:
 *   - Full-page screenshot (desktop + mobile)
 *   - Full HTML (including generated markup from JS)
 *   - Per-section text content (hero, about, services, reviews, contact, footer)
 *   - All CSS variable values
 *   - All images used
 *   - Page metadata
 *   - Theme colors
 *   - Active language
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const url = process.argv[2];
if (!url) {
  console.error('Usage: node capture-reference.mjs <url> [--output-dir <dir>]');
  process.exit(1);
}

const outputDir = resolve(process.argv[4] || './reference-capture');

function log(...args) {
  console.log('[capture]', ...args);
}

mkdirSync(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});
const page = await context.newPage();

log('Navigating to', url);
await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

// Wait for animations to settle
await page.waitForTimeout(2000);

// ======== FULL PAGE SCREENSHOT ========
log('Capturing full-page screenshot...');
await page.screenshot({
  path: resolve(outputDir, 'screenshot-full.png'),
  fullPage: true,
});

// ======== MOBILE SCREENSHOT ========
log('Capturing mobile screenshot...');
const mobileCtx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
});
const mobilePage = await mobileCtx.newPage();
await mobilePage.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
await mobilePage.waitForTimeout(2000);
await mobilePage.screenshot({
  path: resolve(outputDir, 'screenshot-mobile.png'),
  fullPage: true,
});
await mobileCtx.close();

// ======== FULL HTML ========
log('Capturing full HTML...');
const html = await page.content();
writeFileSync(resolve(outputDir, 'full-page.html'), html, 'utf-8');

// ======== METADATA ========
const metadata = await page.evaluate(() => ({
  title: document.title,
  description: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
  lang: document.documentElement.lang,
  charset: document.characterSet,
  favicon: document.querySelector('link[rel="icon"]:not([sizes])')?.getAttribute('href') || '',
}));
log('Metadata:', JSON.stringify(metadata, null, 2));

// ======== CSS VARIABLES ========
const cssVars = await page.evaluate(() => {
  const style = getComputedStyle(document.documentElement);
  const vars = {};
  for (let i = 0; i < style.length; i++) {
    const name = style[i];
    if (name.startsWith('--')) {
      vars[name] = style.getPropertyValue(name).trim();
    }
  }
  return vars;
});
log('CSS variables:', Object.keys(cssVars).length, 'found');
writeFileSync(resolve(outputDir, 'css-vars.json'), JSON.stringify(cssVars, null, 2));

// ======== ALL USED IMAGES ========
const images = await page.evaluate(() => {
  const imgs = document.querySelectorAll('img, [style*="background-image"]');
  const results = [];
  imgs.forEach(el => {
    const src = el.getAttribute('src') ||
      el.style.backgroundImage?.match(/url\(['"]?([^'")]+)['"]?\)/)?.[1] || '';
    if (src && !src.startsWith('data:')) {
      results.push({
        src,
        alt: el.getAttribute('alt') || '',
        width: el.naturalWidth || el.offsetWidth,
        height: el.naturalHeight || el.offsetHeight,
      });
    }
  });
  return results;
});
writeFileSync(resolve(outputDir, 'images.json'), JSON.stringify(images, null, 2));
log('Images:', images.length);

// ======== SECTION TEXT CONTENT ========
const sections = await page.evaluate(() => {
  const result = {};
  const heroEl = document.querySelector('section:first-of-type, [class*="hero"]');
  if (heroEl) result.hero = heroEl.innerText;

  const aboutSections = document.querySelectorAll('#about, [id*="about"], section:has([id*="about"])');
  aboutSections.forEach(el => { result.about = el.innerText; });

  const servicesSections = document.querySelectorAll('#services, [id*="service"], section:has([id*="service"])');
  servicesSections.forEach(el => { result.services = el.innerText; });

  const reviewsSections = document.querySelectorAll('#reviews, [id*="review"]');
  reviewsSections.forEach(el => { result.reviews = el.innerText; });

  const contactSections = document.querySelectorAll('#contact, [id*="contact"]');
  contactSections.forEach(el => { result.contact = el.innerText; });

  const footerEl = document.querySelector('footer');
  if (footerEl) result.footer = footerEl.innerText;

  const navEl = document.querySelector('header nav, nav');
  if (navEl) result.navigation = navEl.innerText;

  return result;
});
writeFileSync(resolve(outputDir, 'sections.json'), JSON.stringify(sections, null, 2));
log('Sections found:', Object.keys(sections).join(', '));

// ======== STRUCTURE ========
const structure = await page.evaluate(() => {
  function getStructure(el, depth = 0) {
    if (depth > 5) return { tag: el.tagName, truncated: true };
    const children = [];
    for (const child of el.children) {
      children.push(getStructure(child, depth + 1));
    }
    return {
      tag: el.tagName,
      id: el.id || undefined,
      className: typeof el.className === 'string' ? el.className.slice(0, 100) : undefined,
      children: children.length > 0 ? children : undefined,
      text: el.childNodes.length === 1 && el.firstChild?.nodeType === 3
        ? el.innerText?.slice(0, 100) : undefined,
    };
  }
  return getStructure(document.body);
});
writeFileSync(resolve(outputDir, 'structure.json'), JSON.stringify(structure, null, 2));

// ======== SUMMARY REPORT ========
const report = {
  url,
  capturedAt: new Date().toISOString(),
  viewport: '1440x900@2x',
  mobileViewport: '390x844@2x',
  metadata,
  cssVariables: Object.keys(cssVars).length,
  images,
  sections: Object.keys(sections),
  sectionCharLengths: Object.fromEntries(
    Object.entries(sections).map(([k, v]) => [k, v.length])
  ),
};
writeFileSync(resolve(outputDir, 'report.json'), JSON.stringify(report, null, 2));

log('\n======== REFERENCE CAPTURE COMPLETE ========');
log('Output:', outputDir);
log('Sections:', Object.keys(sections).join(', '));
log('Images:', images.length);
log('CSS vars:', Object.keys(cssVars).length);
log('HTML size:', html.length, 'chars');
console.log('=========================================');

await browser.close();
