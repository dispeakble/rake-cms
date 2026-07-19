/**
 * WordPress Theme Generator — outputs a full WordPress theme
 * from the same scraped business data used by the Next.js generator.
 *
 * When GENERATOR_OUTPUT=wordpress is set, generateTheme() calls this
 * instead of the Next.js component output.
 */
import fs from "fs/promises";
import path from "path";
import type { ScrapedSite, BusinessType } from "@/lib/scraper/web-scraper";
import type { BusinessData } from "@/lib/scraper/maps-scraper";
import type { ScrapedPhoto } from "@/lib/scraper/photo-scraper";
import { generateContent, type GeneratedContent } from "@/lib/theme-generator/content-generator";
import { getReviews, type Review } from "@/lib/theme-generator/reviews";
import type { ThemeConfig } from "@/lib/theme-generator/index";

// ─── Palette lookup (mirrors the Next.js generator) ──────────────────

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

/** Site page for nav */
interface SitePage {
  slug: string;
  label: string;
}

// ─── Main entry ──────────────────────────────────────────────────────

export async function generateWordPressTheme(
  config: ThemeConfig,
  name: string,
  businessType: BusinessType,
  site: ScrapedSite | null,
  business: BusinessData | null,
  content: GeneratedContent,
  reviews: Review[],
  photos: ScrapedPhoto[],
  pageSlugs: SitePage[],
  heroPhoto: string | null,
  aboutPhoto: string | null,
  outputDir: string,
): Promise<void> {
  const slug = name
    .toLowerCase()
    .replace(/'s\b/g, "")     // Remove possessive 's
    .replace(/'/g, "")        // Remove remaining apostrophes
    .replace(/\s*[|–—-].*$/, "")  // Remove "| Breakfast & Lunch" etc
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .replace(/-+/g, "-");
  // Fallback if slug is too short
  const finalSlug = slug.length < 3
    ? name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    : slug;
  const siteDir = path.join(outputDir, "generated-sites", finalSlug);
  const themeDir = path.join(siteDir, "wp-theme");
  await fs.mkdir(themeDir, { recursive: true });
  await fs.mkdir(path.join(themeDir, "assets", "images"), { recursive: true });

  // Copy scraped photos into theme assets
  const scrapedDir = path.join(outputDir, "public", "media", "scraped");
  try {
    const existing = await fs.readdir(scrapedDir);
    for (const file of existing) {
      await fs.cp(
        path.join(scrapedDir, file),
        path.join(themeDir, "assets", "images", file),
        { recursive: true, force: true },
      ).catch(() => {});
    }
    // Also copy generated/ folder (logo SVGs etc)
    const generatedDir = path.join(scrapedDir, "generated");
    try {
      const genFiles = await fs.readdir(generatedDir);
      await fs.mkdir(path.join(themeDir, "assets", "images", "generated"), { recursive: true });
      for (const f of genFiles) {
        await fs.cp(
          path.join(generatedDir, f),
          path.join(themeDir, "assets", "images", "generated", f),
          { force: true },
        ).catch(() => {});
      }
    } catch { /* no generated dir */ }
  } catch { /* no scraped dir */ }

  // Detect if Spanish
  const isSpanish = !!(content.tagline?.match(/[áéíóúñ]/i) || content.aboutParagraphs?.[0]?.match(/[áéíóúñ]/i));

  // Build nav items — sections + pages
  const sections: { id: string; label: string }[] = [
    { id: "about", label: content.aboutHeading || (isSpanish ? "Sobre nosotros" : "About Us") },
    { id: "services", label: isSpanish ? "Nuestros servicios" : "Our Services" },
    { id: "reviews", label: "Testimonials" },
    { id: "contact", label: "Contact" },
  ];
  // Build CSS theme (inline in style.css)
  const css = buildWordPressCss(config, businessType, photos, heroPhoto, aboutPhoto);

  // Build files
  const files: Array<{ name: string; content: string }> = [];

  // style.css
  files.push({
    name: "style.css",
    content: buildStyleCssHeader(name, finalSlug, css),
  });

  // functions.php
  files.push({
    name: "functions.php",
    content: buildFunctionsPhp(name, finalSlug),
  });

  // header.php
  files.push({
    name: "header.php",
    content: buildHeaderPhp(name, pageSlugs, sections, isSpanish),
  });

  // front-page.php (all sections on one page)
  files.push({
    name: "front-page.php",
    content: buildFrontPagePhp(name, content, config, reviews, photos, heroPhoto, aboutPhoto, site, business, businessType, isSpanish),
  });

  // footer.php
  files.push({
    name: "footer.php",
    content: buildFooterPhp(business, name, pageSlugs, content, businessType, site, isSpanish),
  });

  // Individual pages for WP content
  files.push({
    name: "page.php",
    content: buildPagePhp(isSpanish),
  });

  // index.php (fallback for WordPress)
  files.push({
    name: "index.php",
    content: buildIndexPhp(isSpanish),
  });

  // screenshot.png placeholder (empty, will use hero photo later)
  files.push({
    name: "screenshot.png",
    content: "placeholder",
  });

  // Write all files
  for (const file of files) {
    const filePath = path.join(themeDir, file.name);
    if (file.name.endsWith(".png")) {
      // Skip binary placeholders
      continue;
    }
    await fs.writeFile(filePath, file.content, "utf-8");
    console.log(`   ✓ Wrote: wp-theme/${file.name}`);
  }

  // Generate Docker Compose file
  const composeDir = path.join(siteDir, "wp-docker");
  await fs.mkdir(composeDir, { recursive: true });

  const dockerCompose = buildDockerCompose(name, finalSlug, themeDir);
  await fs.writeFile(path.join(composeDir, "docker-compose.yml"), dockerCompose, "utf-8");
  console.log(`   ✓ Wrote: wp-docker/docker-compose.yml`);

  console.log(`\n📦 WordPress theme generated for "${name}"`);
  console.log(`   Theme: ${themeDir}`);
  console.log(`   Docker: ${composeDir}/docker-compose.yml`);
  console.log(`   Port: ${getPortForSlug(finalSlug)}`);
}

// ─── Port allocation based on slug hash ──────────────────────────────

export function getPortForSlug(slug: string): number {
  // Hash the slug to get a stable port in 3100-3199 range
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash) + slug.charCodeAt(i);
    hash |= 0;
  }
  return 3100 + Math.abs(hash) % 100;
}

// ─── style.css ───────────────────────────────────────────────────────

function buildStyleCssHeader(name: string, slug: string, cssBody: string): string {
  return `/*
Theme Name: ${name}
Theme URI: https://${slug}.alexawebservers.com
Author: Rake CMS
Author URI: https://alexawebservers.com
Description: Auto-generated theme for ${name}
Version: 1.0.0
License: Proprietary
Text Domain: rake-cms
*/

${cssBody}
`;
}

// ─── functions.php ──────────────────────────────────────────────────

function buildFunctionsPhp(name: string, slug: string): string {
  return `<?php
/**
 * ${name} — Auto-generated WordPress Theme
 * Functions and theme setup.
 */

// Theme setup
add_action('after_setup_theme', function () {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('custom-logo');
    add_theme_support('html5', ['search-form', 'comment-form', 'comment-list', 'gallery', 'caption']);
    add_theme_support('responsive-embeds');
    add_theme_support('align-wide');

    register_nav_menus([
        'primary' => __('Primary Menu', 'rake-cms'),
    ]);
});

// Enqueue styles
add_action('wp_enqueue_scripts', function () {
    wp_enqueue_style('${slug}-theme', get_stylesheet_uri(), [], '1.0.0');
    // Enqueue Google Fonts if needed
    wp_enqueue_style('${slug}-fonts', 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap', [], null);
});
`;
}

// ─── header.php ──────────────────────────────────────────────────────

function buildHeaderPhp(name: string, pageSlugs: SitePage[], sections: { id: string; label: string }[], isSpanish: boolean): string {
  const navItems = sections.map(s =>
    `<li><a href="#${s.id}" class="nav-link">${escHtml(s.label)}</a></li>`
  ).join("\n            ");

  return `<!DOCTYPE html>
<html <?php language_attributes(); ?> class="dark">
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <?php wp_head(); ?>
    <style>
        html.dark { color-scheme: dark; }
        .dark body { background: var(--color-bg-page); color: var(--color-text-page); }
    </style>
</head>
<body <?php body_class('antialiased font-sans'); ?>>
<?php wp_body_open(); ?>
<div class="flex min-h-screen flex-col bg-page text-page">
<header class="fixed top-0 left-0 right-0 z-50">
    <div class="border-b border-white/30 bg-header backdrop-blur-2xl shadow-lg shadow-black/5">
        <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
            <a class="flex items-center gap-3" href="<?php echo esc_url(home_url('/')); ?>">
                <span class="text-xl font-black text-white">${escHtml(name)}</span>
            </a>
            <nav class="hidden items-center gap-8 md:flex">
                ${navItems}
            </nav>
            <button class="flex h-10 w-10 items-center justify-center text-white md:hidden" id="mobile-menu-toggle" aria-label="Toggle menu">
                <span class="block h-0.5 w-6 bg-white rounded-full mb-1"></span>
                <span class="block h-0.5 w-6 bg-white rounded-full mb-1"></span>
                <span class="block h-0.5 w-6 bg-white rounded-full"></span>
            </button>
        </div>
    </div>
</header>
<main class="flex-1">
`;
}

// ─── front-page.php ──────────────────────────────────────────────────

function buildFrontPagePhp(
  name: string,
  content: GeneratedContent,
  config: ThemeConfig,
  reviews: Review[],
  photos: ScrapedPhoto[],
  heroPhoto: string | null,
  aboutPhoto: string | null,
  site: ScrapedSite | null,
  business: BusinessData | null,
  businessType: BusinessType,
  isSpanish: boolean,
): string {
  const aboutImgPath = aboutPhoto ? path.basename(aboutPhoto) : (heroPhoto ? path.basename(heroPhoto) : '');

  return `<?php
/**
 * Front Page — renders all sections on one page.
 * Template Name: Front Page
 */

get_header();
?>

<!-- ═══════════ HERO ═══════════ -->
<section class="relative flex h-[75vh] min-h-[500px] items-center justify-center overflow-hidden px-4">
    <div class="absolute inset-0 bg-black/50"></div>
    <?php
    \$hero_files = glob(get_template_directory() . '/assets/images/website-*.{jpeg,jpg,png,webp,svg}');
    if (empty(\$hero_files)) {
        \$hero_files = glob(get_template_directory() . '/assets/images/unsplash-*.svg');
        if (!empty(\$hero_files)) {
            sort(\$hero_files);
            \$hero_files = [\$hero_files[0]];
        }
    }
    if (!empty(\$hero_files)): ?>
    <div class="absolute inset-0" style="background-image:url(<?php echo str_replace(get_template_directory(), get_template_directory_uri(), \$hero_files[0]); ?>);background-size:cover;background-position:center;"></div>
    <?php endif; ?>
    <div class="absolute inset-0 opacity-60 pointer-events-none" style="background:linear-gradient(135deg, ${config.primaryColor} 0%, ${config.secondaryColor} 25%, #1a0a0a 50%, ${config.primaryColor} 75%, ${config.secondaryColor} 100%);background-size:400% 400%;"></div>
    <div class="relative z-10 mx-auto max-w-4xl text-center text-white pb-36">
        <div class="mb-6 inline-block">
            <span class="inline-block rounded-full border border-white/30 bg-white/10 px-6 py-2 text-xs uppercase tracking-[0.3em] text-white backdrop-blur-sm">${escHtml(content.tagline || name)}</span>
        </div>
        <h1 class="mb-4 text-4xl font-black tracking-tight md:text-5xl lg:text-6xl leading-tight gradient-text">
            ${escHtml(content.tagline || `Welcome to ${name}`)}
        </h1>
        <p class="mx-auto mb-8 max-w-2xl text-base text-white/70 md:text-lg">
            ${escHtml(content.heroSubtitle || content.tagline || `Welcome to ${name}`)}
        </p>
        <div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href="#contact" class="shimmer-btn-gold inline-flex items-center rounded-xl bg-gradient-to-r from-[${config.primaryColor}] to-[${config.secondaryColor}] px-10 py-4 font-bold text-white shadow-lg transition-all duration-300 hover:scale-105">
                ${isSpanish ? 'Reserve Your Table' : 'Get in Touch'}
            </a>
            <a href="#services" class="inline-flex items-center rounded-xl border-2 border-white/30 px-10 py-4 font-bold text-white transition-all duration-300 hover:border-[${config.secondaryColor}] hover:bg-white/10 hover:scale-105">
                ${isSpanish ? 'Explora nuestros servicios' : 'Our Services'}
            </a>
        </div>
    </div>
</section>

<!-- ═══════════ ABOUT ═══════════ -->
<section id="about" class="relative px-4 py-24 overflow-hidden">
    <div class="absolute inset-0 bg-section opacity-90"></div>
    <div class="relative z-10 container mx-auto max-w-6xl">
        <div class="grid items-center gap-12 md:grid-cols-2">
            <div>
                <span class="mb-4 block text-xs uppercase tracking-[0.3em] text-secondary/60">${escHtml(content.tagline || 'About')}</span>
                <h2 class="mb-6 text-3xl font-bold md:text-4xl gradient-text">${escHtml(content.aboutHeading || 'About Us')}</h2>
                ${content.aboutParagraphs.map(p => `<p class="mb-4 leading-relaxed text-secondary">${escHtml(p)}</p>`).join('\n                ')}
            </div>
            <div>
                <div class="relative overflow-hidden rounded-2xl">
                    <img src="<?php echo get_template_directory_uri(); ?>/assets/images/${aboutImgPath || 'placeholder.svg'}" alt="About ${escHtml(name)}" class="h-full w-full object-cover" onerror="this.src='data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" fill="' + config.secondaryColor + '"><rect width="800" height="600"/><text x="400" y="300" text-anchor="middle" fill="white" font-size="24">' + escHtml(name) + '</text></svg>')}'" />
                </div>
            </div>
        </div>
    </div>
</section>

<!-- ═══════════ SERVICES ═══════════ -->
<section id="services" class="relative px-4 py-24 overflow-hidden">
    <div class="absolute inset-0 bg-section"></div>
    <div class="relative z-10 container mx-auto max-w-6xl">
        <div class="mb-12 text-center">
            <span class="mb-4 block text-xs uppercase tracking-[0.3em] text-secondary/60">${escHtml(name)}</span>
            <h2 class="text-3xl font-bold text-white md:text-4xl gradient-text">${isSpanish ? 'Nuestros servicios' : 'Our Services'}</h2>
        </div>
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            ${content.services.map((s, i) => buildServiceCardHtml(s, i, config)).join('\n            ')}
        </div>
    </div>
</section>

<!-- ═══════════ REVIEWS ═══════════ -->
<section id="reviews" class="relative px-4 py-24 overflow-hidden">
    <div class="absolute inset-0 bg-section"></div>
    <div class="relative z-10 container mx-auto max-w-6xl">
        <div class="mb-12 text-center">
            <span class="mb-4 block text-xs uppercase tracking-[0.3em] text-secondary/60">Testimonials</span>
            <h2 class="text-3xl font-bold text-white md:text-4xl gradient-text">${isSpanish ? 'Lo que dicen nuestros clientes' : 'What Our Clients Say'}</h2>
        </div>
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            ${reviews.map(r => buildReviewCardHtml(r)).join('\n            ')}
        </div>
    </div>
</section>

<!-- ═══════════ CONTACT ═══════════ -->
<section id="contact" class="relative px-4 py-24 overflow-hidden">
    <div class="absolute inset-0 bg-section"></div>
    <div class="relative z-10 container mx-auto max-w-6xl">
        <div class="mb-14 text-center">
            <span class="mb-4 block text-xs uppercase tracking-[0.3em] text-secondary/60">${isSpanish ? 'Contacto' : 'Contact'}</span>
            <h2 class="text-3xl font-bold text-white md:text-4xl gradient-text">${isSpanish ? 'Contacto' : 'Contact Us'}</h2>
            <p class="mx-auto mt-3 max-w-xl text-tertiary">${escHtml(name)}</p>
        </div>
        <div class="grid gap-10 md:grid-cols-2">
            ${buildContactInfoHtml(site, business, name, config)}
            ${buildContactFormHtml(isSpanish, config)}
        </div>
    </div>
</section>

<?php get_footer(); ?>
`;
}

// ═══════════ Helper: Service card HTML ═══════════

function buildServiceCardHtml(service: { title: string; description: string }, index: number, config: ThemeConfig): string {
  return `<div class="rounded-2xl p-[1px] glow-card">
    <div class="relative rounded-2xl bg-card-inner p-8 h-full">
        <span class="mb-2 inline-block rounded bg-white/20 px-2 py-0.5 text-xs font-medium text-${config.secondaryColor.replace('#', '')}">#${String(index + 1).padStart(2, '0')}</span>
        <h3 class="mb-3 text-xl font-bold text-heading">${escHtml(service.title)}</h3>
        <p class="text-sm leading-relaxed text-secondary">${escHtml(service.description)}</p>
    </div>
</div>`;
}

// ═══════════ Helper: Review card HTML ═══════════

function buildReviewCardHtml(review: Review): string {
  const stars = Array(5).fill(0).map((_, i) =>
    i < review.rating
      ? `<span class="text-lg text-secondary">★</span>`
      : `<span class="text-lg text-gray-600">☆</span>`
  ).join('');

  const source = review.source || 'Google';

  return `<div class="relative rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm hover:border-white/30">
    <div class="absolute -top-2 -left-2 text-4xl text-white/10 select-none leading-none">"</div>
    <div class="flex gap-1">${stars}</div>
    <p class="mt-3 text-sm leading-relaxed text-secondary relative z-10">&ldquo;${escHtml(review.text)}&rdquo;</p>
    <div class="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-tertiary">
        <span class="font-medium text-heading">&mdash; ${escHtml(review.author)}</span>
        <span class="text-secondary/80">${escHtml(source)}</span>
    </div>
</div>`;
}

// ═══════════ Helper: Contact info HTML ═══════════

function buildContactInfoHtml(site: ScrapedSite | null, business: BusinessData | null, name: string, config: ThemeConfig): string {
  const address = business?.address || site?.pages[0]?.contactInfo?.address?.[0] || '';
  const phone = site?.pages[0]?.contactInfo?.phone?.[0] || business?.phone || '';
  const email = site?.pages[0]?.contactInfo?.email?.[0] || '';
  const lat = business?.latitude || 0;
  const lng = business?.longitude || 0;
  const isSpanish = !!(name.match(/[áéíóúñ]/i));

  return `<div class="space-y-8">
    <div class="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        <h3 class="mb-4 text-lg font-bold text-heading"><span class="text-secondary">📍</span> ${escHtml(name)}</h3>
        <div class="space-y-3 text-sm text-secondary">
            ${address ? `<div class="flex items-start gap-3"><span>📍</span><span>${escHtml(address)}</span></div>` : ''}
            ${phone ? `<div class="flex items-start gap-3"><span>📞</span><a href="tel:${escAttr(phone)}" class="text-secondary transition hover:text-white">${escHtml(phone)}</a></div>` : ''}
            ${email ? `<div class="flex items-start gap-3"><span>✉️</span><a href="mailto:${escAttr(email)}" class="text-secondary transition hover:text-white">${escHtml(email)}</a></div>` : ''}
        </div>
    </div>
    ${lat && lng ? `<div class="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm overflow-hidden">
        <iframe title="${escAttr(name)} - Location" src="https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01}%2C${lat - 0.01}%2C${lng + 0.01}%2C${lat + 0.01}&layer=mapnik&marker=${lat}%2C${lng}" width="100%" height="300" style="border:0;border-radius:12px" loading="lazy" allowfullscreen></iframe>
        <p class="mt-2 text-center text-[10px] text-quaternary"><a href="https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}" target="_blank" rel="noopener noreferrer" class="text-secondary hover:underline">View on OpenStreetMap</a></p>
    </div>` : ''}
</div>`;
}

// ═══════════ Helper: Contact form HTML ═══════════

function buildContactFormHtml(isSpanish: boolean, config: ThemeConfig): string {
  return `<div class="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
    <h3 class="mb-6 text-lg font-semibold text-heading">${isSpanish ? 'Envíanos un mensaje' : 'Send us a message'}</h3>
    <form class="space-y-5" action="<?php echo esc_url(admin_url('admin-post.php')); ?>" method="post">
        <?php wp_nonce_field('rake_cms_contact', 'contact_nonce'); ?>
        <input type="hidden" name="action" value="rake_cms_contact_form">
        <div>
            <label class="mb-1.5 block text-sm font-medium text-secondary">${isSpanish ? 'Nombre' : 'First Name'}</label>
            <input type="text" name="first_name" placeholder="${isSpanish ? 'Su nombre' : 'Your first name'}" class="w-full rounded-lg border border-white/10 bg-primary/80 px-4 py-3 text-sm text-white placeholder-white/60 transition-all duration-300 focus:border-secondary focus:outline-none focus:ring-[3px] focus:ring-secondary/20" required>
        </div>
        <div>
            <label class="mb-1.5 block text-sm font-medium text-secondary">${isSpanish ? 'Apellido' : 'Last Name'}</label>
            <input type="text" name="last_name" placeholder="${isSpanish ? 'Su apellido' : 'Your last name'}" class="w-full rounded-lg border border-white/10 bg-primary/80 px-4 py-3 text-sm text-white placeholder-white/60 transition-all duration-300 focus:border-secondary focus:outline-none focus:ring-[3px] focus:ring-secondary/20" required>
        </div>
        <div>
            <label class="mb-1.5 block text-sm font-medium text-secondary">${isSpanish ? 'Correo electrónico' : 'Email'}</label>
            <input type="email" name="email" placeholder="${isSpanish ? 'Su correo electrónico' : 'Your email'}" class="w-full rounded-lg border border-white/10 bg-primary/80 px-4 py-3 text-sm text-white placeholder-white/60 transition-all duration-300 focus:border-secondary focus:outline-none focus:ring-[3px] focus:ring-secondary/20" required>
        </div>
        <div>
            <label class="mb-1.5 block text-sm font-medium text-secondary">${isSpanish ? 'Teléfono' : 'Phone'}</label>
            <input type="tel" name="phone" placeholder="${isSpanish ? 'Su teléfono' : 'Your phone'}" class="w-full rounded-lg border border-white/10 bg-primary/80 px-4 py-3 text-sm text-white placeholder-white/60 transition-all duration-300 focus:border-secondary focus:outline-none focus:ring-[3px] focus:ring-secondary/20">
        </div>
        <div>
            <label class="mb-1.5 block text-sm font-medium text-secondary">${isSpanish ? 'Mensaje' : 'Message'}</label>
            <textarea name="message" placeholder="${isSpanish ? 'Por favor, deje su mensaje aquí ...' : 'Please leave your message here...'}" rows="4" class="w-full rounded-lg border border-white/10 bg-primary/80 px-4 py-3 text-sm text-white placeholder-white/60 transition-all duration-300 focus:border-secondary focus:outline-none focus:ring-[3px] focus:ring-secondary/20" required></textarea>
        </div>
        <button type="submit" class="shimmer-btn-gold w-full rounded-lg bg-gradient-to-r from-[${config.primaryColor}] via-[${config.secondaryColor}] to-[${config.primaryColor}] px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:scale-105">
            ${isSpanish ? 'Enviar' : 'Send'}
        </button>
    </form>
</div>`;
}

// ═══════════ footer.php ═══════════

function buildFooterPhp(
  business: BusinessData | null,
  name: string,
  pageSlugs: SitePage[],
  content: GeneratedContent,
  businessType: BusinessType,
  site: ScrapedSite | null,
  isSpanish: boolean,
): string {
  return `</main>
<footer class="relative px-4 py-16 overflow-hidden">
    <div class="absolute inset-0 bg-section"></div>
    <div class="absolute top-0 left-0 right-0 h-[2px]" style="background:linear-gradient(90deg, transparent, var(--color-gold), var(--color-primary), var(--color-gold), transparent);background-size:200% 100%;"></div>
    <div class="relative z-10 container mx-auto max-w-6xl">
        <div class="grid gap-10 md:grid-cols-4">
            <div class="md:col-span-2">
                <h4 class="mb-4 text-lg font-semibold text-white"><span class="gradient-text-gold">${escHtml(name)}</span></h4>
                <p class="max-w-sm text-sm leading-relaxed text-tertiary">${escHtml(content.tagline || `Welcome to ${name}`)}</p>
                <div class="mt-6 flex gap-4">
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" class="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm text-tertiary transition-all duration-300 hover:border-white/30 hover:bg-white/10">f</a>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" class="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm text-tertiary transition-all duration-300 hover:border-white/30 hover:bg-white/10">ig</a>
                </div>
            </div>
            <div>
                <h4 class="mb-4 text-sm font-semibold uppercase tracking-wider text-tertiary">${isSpanish ? 'Enlaces' : 'Links'}</h4>
                <div class="space-y-3 text-sm">
                    <a href="#about" class="block text-sm text-tertiary transition-all duration-300 hover:text-white">${isSpanish ? 'Sobre nosotros' : 'About Us'}</a>
                    <a href="#services" class="block text-sm text-tertiary transition-all duration-300 hover:text-white">${isSpanish ? 'Qué ofrecemos' : 'Services'}</a>
                    <a href="#contact" class="block text-sm text-tertiary transition-all duration-300 hover:text-white">${isSpanish ? 'Contacto' : 'Contact'}</a>
                </div>
            </div>
        </div>
        <div class="mt-12 border-t border-white/10 pt-8 text-center text-xs text-quaternary leading-relaxed">
            <p>Made with ❤️ by <a href="https://alexawebservers.com" target="_blank" rel="noopener noreferrer" class="text-secondary hover:text-white transition-colors">alexawebservers.com</a></p>
        </div>
    </div>
</footer>
</div>
<?php wp_footer(); ?>
</body>
</html>`;
}

// ═══════════ page.php ═══════════

function buildPagePhp(isSpanish: boolean): string {
  return `<?php
/**
 * Default page template.
 */
get_header();
?>

<div class="container mx-auto max-w-4xl px-4 py-24">
    <?php while (have_posts()) : the_post(); ?>
        <h1 class="text-4xl font-bold gradient-text mb-6"><?php the_title(); ?></h1>
        <div class="prose prose-invert max-w-none">
            <?php the_content(); ?>
        </div>
    <?php endwhile; ?>
</div>

<?php get_footer(); ?>
`;
}

// ═══════════ index.php ═══════════

function buildIndexPhp(isSpanish: boolean): string {
  return `<?php
/**
 * Fallback template — renders the front page with all sections.
 */
get_header();
?>

<?php if (is_front_page()) : ?>
    <?php get_template_part('front-page'); ?>
<?php else : ?>
    <div class="container mx-auto max-w-4xl px-4 py-24">
        <?php while (have_posts()) : the_post(); ?>
            <h1 class="text-4xl font-bold gradient-text mb-6"><?php the_title(); ?></h1>
            <div class="prose prose-invert max-w-none">
                <?php the_content(); ?>
            </div>
        <?php endwhile; ?>
    </div>
<?php endif; ?>

<?php get_footer(); ?>
`;
}

// ═══════════ Escaping helpers ────────────────────────────────────────
// ═══════════ CSS builder ─────────────────────────────────────────────

function buildWordPressCss(
  config: ThemeConfig,
  businessType: BusinessType,
  photos: ScrapedPhoto[],
  heroPhoto: string | null,
  aboutPhoto: string | null,
): string {
  const p = config.primaryColor;
  const s = config.secondaryColor;
  const a = config.accentColor;

  // Derive RGB values for rgba() usage
  const pRgb = hexToRgb(p);
  const sRgb = hexToRgb(s);

  return `/* ═══════════════════════════════════════════════════
   Rake CMS — Auto-generated Theme
   Primary: ${p}  Secondary: ${s}  Accent: ${a}
   ═══════════════════════════════════════════════════ */

:root {
    --color-primary: ${p};
    --color-primary-rgb: ${pRgb.r}, ${pRgb.g}, ${pRgb.b};
    --color-gold: ${s};
    --color-gold-light: ${s};
    --color-gold-rgb: ${sRgb.r}, ${sRgb.g}, ${sRgb.b};
    --color-bg-page: ${a};
    --color-bg-section: rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.4);
    --color-bg-card-inner: rgba(0, 0, 0, 0.4);
    --color-text-page: #ffffff;
    --color-text-heading: #ffffff;
    --color-text-secondary: rgba(255, 255, 255, 0.7);
    --color-text-tertiary: rgba(255, 255, 255, 0.5);
    --color-text-quaternary: rgba(255, 255, 255, 0.3);
    --color-header-bg: rgba(0, 0, 0, 0.6);
}

/* Reset & Base */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: var(--color-bg-page);
    color: var(--color-text-page);
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
}

/* Gradient text */
.gradient-text {
    background: linear-gradient(135deg, var(--color-gold) 0%, #ffffff 50%, var(--color-gold) 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}
.gradient-text-gold {
    background: linear-gradient(135deg, var(--color-gold), var(--color-gold-light));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

/* Background utilities */
.bg-page { background: var(--color-bg-page); }
.bg-section { background: var(--color-bg-section); }
.bg-header { background: var(--color-header-bg); }
.bg-card-inner { background: var(--color-bg-card-inner); }

/* Text utilities */
.text-page { color: var(--color-text-page); }
.text-heading { color: var(--color-text-heading); }
.text-secondary { color: var(--color-text-secondary); }
.text-tertiary { color: var(--color-text-tertiary); }
.text-quaternary { color: var(--color-text-quaternary); }

/* Layout */
.container { width: 100%; margin: 0 auto; }
.max-w-6xl { max-width: 72rem; }
.max-w-4xl { max-width: 56rem; }
.max-w-2xl { max-width: 42rem; }
.max-w-xl { max-width: 36rem; }
.max-w-sm { max-width: 24rem; }
.px-4 { padding-left: 1rem; padding-right: 1rem; }
.py-24 { padding-top: 6rem; padding-bottom: 6rem; }
.py-16 { padding-top: 4rem; padding-bottom: 4rem; }
.mx-auto { margin-left: auto; margin-right: auto; }

/* Grid */
.grid { display: grid; }
.gap-6 { gap: 1.5rem; }
.gap-10 { gap: 2.5rem; }
.gap-12 { gap: 3rem; }
.md\\:grid-cols-2 { }
.md\\:grid-cols-3 { }
.md\\:grid-cols-4 { }
@media (min-width: 768px) {
    .md\\:grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
    .md\\:grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
    .md\\:grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
    .md\\:flex { display: flex; }
    .md\\:hidden { display: none; }
    .md\\:text-4xl { font-size: 2.25rem; }
    .md\\:text-5xl { font-size: 3rem; }
}
@media (max-width: 767px) {
    .hidden { display: none; }
}

/* Flex */
.flex { display: flex; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.flex-col { flex-direction: column; }
.gap-3 { gap: 0.75rem; }
.gap-4 { gap: 1rem; }
.gap-8 { gap: 2rem; }
@media (min-width: 640px) {
    .sm\\:flex-row { flex-direction: row; }
}

/* Typography */
.text-xs { font-size: 0.75rem; }
.text-sm { font-size: 0.875rem; }
.text-base { font-size: 1rem; }
.text-lg { font-size: 1.125rem; }
.text-xl { font-size: 1.25rem; }
.text-2xl { font-size: 1.5rem; }
.text-3xl { font-size: 1.875rem; }
.text-4xl { font-size: 2.25rem; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
.font-black { font-weight: 900; }
.tracking-tight { letter-spacing: -0.025em; }
.tracking-wider { letter-spacing: 0.05em; }
.uppercase { text-transform: uppercase; }
.leading-tight { line-height: 1.25; }
.leading-relaxed { line-height: 1.625; }
.text-center { text-align: center; }
.antialiased { -webkit-font-smoothing: antialiased; }
.font-sans { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }

/* Buttons */
.shimmer-btn-gold {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    border: none;
    text-decoration: none;
}
.shimmer-btn-gold:hover {
    transform: scale(1.05);
    transition: all 0.3s ease;
}

/* Cards */
.rounded-xl { border-radius: 0.75rem; }
.rounded-2xl { border-radius: 1rem; }
.rounded-lg { border-radius: 0.5rem; }
.rounded-full { border-radius: 9999px; }
.border { border: 1px solid; }
.border-white\\/10 { border-color: rgba(255, 255, 255, 0.1); }
.border-white\\/30 { border-color: rgba(255, 255, 255, 0.3); }

/* Card glow */
.glow-card {
    position: relative;
    background: linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02));
    border: 1px solid rgba(255,255,255,0.08);
}

/* Backdrop blur */
.backdrop-blur-sm { backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
.backdrop-blur-2xl { backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }

/* Overflow */
.overflow-hidden { overflow: hidden; }
.relative { position: relative; }
.absolute { position: absolute; }
.fixed { position: fixed; }
.z-10 { z-index: 10; }
.z-50 { z-index: 50; }
.inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
.top-0 { top: 0; }
.left-0 { left: 0; }
.right-0 { right: 0; }

/* Shadow */
.shadow-lg { box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); }
.shadow-black\\/5 { box-shadow: 0 0 0 1px rgba(0,0,0,0.05); }
.shadow-\\[0_0_20px_rgba\\(var\\(--color-gold-rgb\\),_0\\.3\\)\\] { box-shadow: 0 0 20px rgba(212, 160, 23, 0.3); }

/* Transitions */
.transition-all { transition: all 0.3s ease; }
.duration-300 { transition-duration: 0.3s; }
.hover\\:scale-105:hover { transform: scale(1.05); }
.hover\\:text-white:hover { color: white; }

/* WP overwrites */
a { color: inherit; text-decoration: none; }
img { max-width: 100%; height: auto; }

/* Form inputs */
input, textarea {
    background: rgba(0,0,0,0.3);
    color: white;
    border: 1px solid rgba(255,255,255,0.1);
}
input:focus, textarea:focus {
    border-color: var(--color-gold);
    outline: none;
    box-shadow: 0 0 20px rgba(212, 160, 23, 0.15);
}

/* Object fit */
.object-cover { object-fit: cover; }
.h-full { height: 100%; }
.w-full { width: 100%; }
.h-\\[75vh\\] { height: 75vh; }
.min-h-\\[500px\\] { min-height: 500px; }
.min-h-screen { min-height: 100vh; }
`;
}

// ═══════════ Docker Compose builder ─────────────────────────────────

function buildDockerCompose(name: string, slug: string, themeDir: string): string {
  const port = getPortForSlug(slug);
  const mysqlDb = `rake_cms_wp_${slug.replace(/-/g, '_')}`;
  return `version: '3.8'

services:
  db:
    image: mysql:8
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: wp_root_password
      MYSQL_DATABASE: ${mysqlDb}
      MYSQL_USER: wp_user
      MYSQL_PASSWORD: wp_password
    volumes:
      - db_data:/var/lib/mysql
    networks:
      - wp_network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  wordpress:
    depends_on:
      db:
        condition: service_healthy
    image: wordpress:6-apache
    restart: unless-stopped
    ports:
      - "127.0.0.1:${port}:80"
    environment:
      WORDPRESS_DB_HOST: db:3306
      WORDPRESS_DB_USER: wp_user
      WORDPRESS_DB_PASSWORD: wp_password
      WORDPRESS_DB_NAME: ${mysqlDb}
      WORDPRESS_CONFIG_EXTRA: |
        define('WP_AUTO_UPDATE_CORE', false);
        define('DISALLOW_FILE_EDIT', true);
        define('WP_HOME', 'https://${slug}.alexawebservers.com');
        define('WP_SITEURL', 'https://${slug}.alexawebservers.com');
    volumes:
      - wp_data:/var/www/html
    networks:
      - wp_network

volumes:
  db_data:
  wp_data:

networks:
  wp_network:
`;
}

// ═════════── Escaping helpers ────────────────────────────────────────

function escHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escAttr(str: string): string {
  return str.replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}
