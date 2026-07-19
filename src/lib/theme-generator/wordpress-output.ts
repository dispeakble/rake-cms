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
    content: buildFunctionsPhp(name, finalSlug, config),
  });

  // header.php
  files.push({
    name: "header.php",
    content: buildHeaderPhp(name, pageSlugs, sections, isSpanish, businessType, config),
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

  // Theme JavaScript for interactivity
  const themeJsDir = path.join(themeDir, "assets", "js");
  await fs.mkdir(themeJsDir, { recursive: true });
  const themeJsContent = buildThemeJs();
  await fs.writeFile(path.join(themeJsDir, "theme.js"), themeJsContent, "utf-8");
  console.log("   ✓ Wrote: wp-theme/assets/js/theme.js");

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

  const domain = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .replace(/-+/g, "-");
  const dockerCompose = buildDockerCompose(name, domain, themeDir);
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

// ─── Google Font URL builder ────────────────────────────────────────

const GOOGLE_FONT_URLS: Record<string, string> = {
  Inter: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap',
  Merriweather: 'https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700;900&display=swap',
  Lora: 'https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap',
  Poppins: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;900&display=swap',
};

function getGoogleFontUrl(fontFamily: string): string {
  return GOOGLE_FONT_URLS[fontFamily] || GOOGLE_FONT_URLS.Inter;
}

// ─── functions.php ──────────────────────────────────────────────────

function buildFunctionsPhp(name: string, slug: string, config?: ThemeConfig): string {
  const fontFamily = config?.fontFamily || 'Inter';
  const fontUrl = getGoogleFontUrl(fontFamily);

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

// Enqueue styles & scripts
add_action('wp_enqueue_scripts', function () {
    wp_enqueue_style('${slug}-theme', get_stylesheet_uri(), [], '1.0.0');
    // Enqueue Google Fonts
    wp_enqueue_style('${slug}-fonts', '${fontUrl}', [], null);
    // Enqueue theme.js for interactivity
    wp_enqueue_script('${slug}-theme-js', get_template_directory_uri() . '/assets/js/theme.js', [], '1.0.0', true);
    // Enqueue logo SVG
    wp_enqueue_style('${slug}-logo', get_template_directory_uri() . '/assets/images/generated/logo.svg', [], null);
});
`;
}

// ─── header.php ──────────────────────────────────────────────────────

function buildHeaderPhp(
  name: string,
  pageSlugs: SitePage[],
  sections: { id: string; label: string }[],
  isSpanish: boolean,
  businessType: BusinessType,
  config: ThemeConfig,
): string {
  const navItems = sections.map(s =>
    `<li><a href="#${s.id}" class="nav-link">${escHtml(s.label)}</a></li>`
  ).join("\n            ");

  // Business-type-specific nav link
  const extraNavLink = businessType === 'restaurant'
    ? `<li><a href="#menu" class="nav-link">${isSpanish ? 'Nuestra Carta' : 'Our Menu'}</a></li>`
    : '';

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
                <img src="<?php echo get_template_directory_uri(); ?>/assets/images/generated/logo.svg" alt="${escHtml(name)}" class="h-8 w-auto" onerror="this.style.display='none'" loading="eager">
                <span class="text-xl font-black text-white">${escHtml(name)}</span>
            </a>
            <div class="flex items-center gap-3">
                <!-- Language Toggle -->
                <div class="relative" id="lang-toggle-container">
                    <button id="lang-toggle" class="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/5 text-xs font-bold text-white transition-all duration-300 hover:border-white/40 hover:bg-white/10" aria-label="${isSpanish ? 'Cambiar idioma' : 'Toggle language'}">
                        ${isSpanish ? 'ES' : 'EN'}
                    </button>
                    <div id="lang-dropdown" class="absolute right-0 top-full mt-2 hidden w-28 rounded-lg border border-white/10 bg-black/90 p-1 backdrop-blur-xl shadow-lg" style="z-index:100;">
                        <a href="#" class="block rounded-md px-3 py-2 text-xs text-white transition hover:bg-white/10 ${isSpanish ? 'font-bold' : ''}" data-lang="es">Español</a>
                        <a href="#" class="block rounded-md px-3 py-2 text-xs text-white transition hover:bg-white/10 ${!isSpanish ? 'font-bold' : ''}" data-lang="en">English</a>
                    </div>
                </div>
                <!-- Theme Toggle -->
                <button id="theme-toggle" class="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/5 text-sm text-white transition-all duration-300 hover:border-white/40 hover:bg-white/10" aria-label="${isSpanish ? 'Cambiar tema' : 'Toggle theme'}">
                    <span class="theme-icon">🌙</span>
                </button>
                <!-- Desktop Navigation -->
                <nav class="hidden items-center gap-6 md:flex">
                    ${extraNavLink}
                    ${navItems}
                </nav>
                <!-- Mobile Hamburger (animated) -->
                <button class="relative flex h-10 w-10 flex-col items-center justify-center text-white md:hidden" id="mobile-menu-toggle" aria-label="${isSpanish ? 'Abrir menú' : 'Toggle menu'}">
                    <span class="block h-0.5 w-6 bg-white rounded-full transition-all duration-300 origin-center hamburger-line-1"></span>
                    <span class="block h-0.5 w-6 bg-white rounded-full transition-all duration-300 my-1 hamburger-line-2"></span>
                    <span class="block h-0.5 w-6 bg-white rounded-full transition-all duration-300 origin-center hamburger-line-3"></span>
                </button>
            </div>
        </div>
        <!-- Mobile Menu Panel -->
        <div id="mobile-menu" class="hidden border-t border-white/10 bg-header backdrop-blur-2xl md:hidden">
            <nav class="flex flex-col gap-1 px-4 py-4">
                ${extraNavLink ? `<a href="#menu" class="rounded-lg px-3 py-2.5 text-sm text-white transition hover:bg-white/10">${isSpanish ? 'Nuestra Carta' : 'Our Menu'}</a>` : ''}
                ${sections.map(s => `<a href="#${s.id}" class="rounded-lg px-3 py-2.5 text-sm text-white transition hover:bg-white/10">${escHtml(s.label)}</a>`).join('\n                ')}
            </nav>
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
  const imgDir = `<?php echo get_template_directory_uri(); ?>/assets/images`;

  // Business-type-specific CTA labels
  const primaryCtaLabel = businessType === 'restaurant'
    ? (isSpanish ? 'Reserva tu Mesa' : 'Reserve Your Table')
    : (isSpanish ? 'Contáctanos' : 'Get in Touch');
  const secondaryCtaLabel = businessType === 'restaurant'
    ? (isSpanish ? 'Ver Menú' : 'View Menu')
    : (isSpanish ? 'Nuestros Servicios' : 'Our Services');
  const secondaryCtaHref = businessType === 'restaurant' ? '#menu' : '#services';

  // About stats per business type
  const stats = businessType === 'restaurant'
    ? [
        { value: '15+', label: isSpanish ? 'Años de Experiencia' : 'Years Experience' },
        { value: '500+', label: isSpanish ? 'Platos Servidos' : 'Dishes Served' },
        { value: '98%', label: isSpanish ? 'Clientes Satisfechos' : 'Happy Clients' },
      ]
    : businessType === 'retail'
    ? [
        { value: '1000+', label: isSpanish ? 'Productos' : 'Products' },
        { value: '10+', label: isSpanish ? 'Años de Trayectoria' : 'Years in Business' },
        { value: '5000+', label: isSpanish ? 'Clientes Atendidos' : 'Customers Served' },
      ]
    : [
        { value: '99%', label: isSpanish ? 'Satisfacción' : 'Satisfaction' },
        { value: '50+', label: isSpanish ? 'Proyectos Completados' : 'Projects Done' },
        { value: '10+', label: isSpanish ? 'Años de Experiencia' : 'Years Exp.' },
      ];

  return `<?php
/**
 * Front Page — renders all sections on one page.
 * Template Name: Front Page
 */

get_header();
?>

<!-- ═══════════ HERO ═══════════ -->
<section class="relative flex h-[90vh] min-h-[600px] items-center justify-center overflow-hidden px-4" id="hero">
    <!-- Animated gradient background -->
    <div class="absolute inset-0 pointer-events-none animated-gradient"></div>

    <!-- Floating glow particles -->
    <div class="floating-particle" style="top:10%;left:5%;width:300px;height:300px;background:radial-gradient(circle, rgba(var(--color-gold-rgb),0.15), transparent 70%);--particle-duration:6s;--particle-delay:0s;"></div>
    <div class="floating-particle" style="top:60%;right:10%;width:250px;height:250px;background:radial-gradient(circle, rgba(var(--color-gold-rgb),0.10), transparent 70%);--particle-duration:8s;--particle-delay:1s;"></div>
    <div class="floating-particle" style="bottom:15%;left:40%;width:200px;height:200px;background:radial-gradient(circle, rgba(var(--color-primary-rgb),0.12), transparent 70%);--particle-duration:7s;--particle-delay:0.5s;"></div>

    <!-- Hero Carousel Background -->
    <div class="hero-carousel absolute inset-0">
        <?php
        // Priority 1: Generated carousel slides
        \$hero_files = glob(get_template_directory() . '/assets/images/generated/slide*.svg');
        if (empty(\$hero_files)) {
            // Priority 2: Website scraped images
            \$hero_files = glob(get_template_directory() . '/assets/images/website-*.{jpeg,jpg,png,webp,svg}');
            if (empty(\$hero_files)) {
                // Fallback: Unsplash SVGs (max 3)
                \$hero_files = glob(get_template_directory() . '/assets/images/unsplash-*.svg');
                if (!empty(\$hero_files)) {
                    sort(\$hero_files);
                    \$hero_files = array_slice(\$hero_files, 0, 3);
                }
            }
        }
        if (!empty(\$hero_files)):
            foreach (\$hero_files as \$idx => \$hf):
                \$active_class = \$idx === 0 ? 'active' : '';
        ?>
        <div class="slide <?php echo \$active_class; ?>" data-index="<?php echo \$idx; ?>">
            <div class="absolute inset-0" style="background-image:url(<?php echo str_replace(get_template_directory(), get_template_directory_uri(), \$hf); ?>);background-size:cover;background-position:center;"></div>
            <div class="absolute inset-0 bg-black/40"></div>
        </div>
        <?php endforeach; ?>
        <!-- Carousel Controls -->
        <button class="carousel-prev absolute left-4 top-1/2 z-20 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300" aria-label="Previous slide">&lsaquo;</button>
        <button class="carousel-next absolute right-4 top-1/2 z-20 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300" aria-label="Next slide">&rsaquo;</button>
        <?php endif; ?>
    </div>

    <!-- Hero Content -->
    <div class="relative z-10 mx-auto max-w-4xl text-center text-white pb-36 reveal fade-up">
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
                ${primaryCtaLabel}
            </a>
            <a href="${secondaryCtaHref}" class="inline-flex items-center rounded-xl border-2 border-white/30 px-10 py-4 font-bold text-white transition-all duration-300 hover:border-[${config.secondaryColor}] hover:bg-white/10 hover:scale-105">
                ${secondaryCtaLabel}
            </a>
        </div>
    </div>
</section>

<!-- ═══════════ ABOUT ═══════════ -->
<section id="about" class="relative px-4 py-24 overflow-hidden reveal fade-up">
    <div class="absolute inset-0 bg-section opacity-90"></div>
    <div class="relative z-10 container mx-auto max-w-6xl">
        <div class="grid items-center gap-12 md:grid-cols-2">
            <div>
                <span class="mb-4 block text-xs uppercase tracking-[0.3em] text-secondary/60">${escHtml(content.tagline || 'About')}</span>
                <h2 class="mb-6 text-3xl font-bold md:text-4xl gradient-text">${escHtml(content.aboutHeading || 'About Us')}</h2>
                ${content.aboutParagraphs.map(p => `<p class="mb-4 leading-relaxed text-secondary">${escHtml(p)}</p>`).join('\n                ')}

                <!-- About Stats -->
                <div class="mt-8 grid grid-cols-3 gap-4">
                    ${stats.map(s => `
                    <div class="stat-card">
                        <div class="animated-counter stat-number" data-target="${s.value.replace(/[^0-9+]/g, '')}">${s.value}</div>
                        <div class="stat-label">${s.label}</div>
                    </div>`).join('\n                    ')}
                </div>
            </div>
            <div>
                <div class="relative overflow-hidden rounded-2xl">
                    <img src="${imgDir}/${aboutImgPath || 'placeholder.svg'}" alt="About ${escHtml(name)}" class="h-full w-full object-cover" loading="lazy" onerror="this.src='data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" fill="' + config.secondaryColor + '"><rect width="800" height="600"/><text x="400" y="300" text-anchor="middle" fill="white" font-size="24">' + escHtml(name) + '</text></svg>')}'" />
                </div>
            </div>
        </div>
    </div>
</section>

<!-- ═══════════ SERVICES ═══════════ -->
<section id="services" class="relative px-4 py-24 overflow-hidden reveal fade-up">
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
<section id="reviews" class="relative px-4 py-24 overflow-hidden reveal fade-up">
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
<section id="contact" class="relative px-4 py-24 overflow-hidden reveal fade-up">
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
  const num = String(index + 1).padStart(2, '0');
  return `<div class="rounded-2xl p-[1px] glow-card group">
    <div class="relative rounded-2xl bg-card-inner p-8 h-full transition-all duration-300 hover:scale-[1.02]">
        <span class="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold" style="color:var(--color-gold);border:1px solid rgba(var(--color-gold-rgb),0.3);">${num}</span>
        <h3 class="mb-3 text-xl font-bold text-heading">${escHtml(service.title)}</h3>
        <p class="text-sm leading-relaxed text-secondary">${escHtml(service.description)}</p>
    </div>
</div>`;
}

// ═══════════ Helper: Review card HTML ═══════════

function buildReviewCardHtml(review: Review): string {
  const stars = Array(5).fill(0).map((_, i) =>
    i < review.rating
      ? `<span class="sparkle-star text-lg">★</span>`
      : `<span class="text-lg text-gray-600">☆</span>`
  ).join('');

  const source = review.source || 'Google';

  return `<div class="relative rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm hover-lift hover:border-white/30 group">
    <!-- SVG Quote Icon -->
    <div class="absolute -top-3 -left-3 text-4xl text-white/10 select-none leading-none">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
    </div>
    <div class="flex gap-1">${stars}</div>
    <p class="mt-3 text-sm leading-relaxed text-secondary relative z-10">&ldquo;${escHtml(review.text)}&rdquo;</p>
    <div class="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-tertiary">
        <span class="font-medium text-heading">&mdash; ${escHtml(review.author)}</span>
        <span class="font-semibold" style="color:var(--color-gold);">${escHtml(source)}</span>
    </div>
</div>`;
}

// ═══════════ Helper: Contact info HTML ═══════════

function buildContactInfoHtml(site: ScrapedSite | null, business: BusinessData | null, name: string, config: ThemeConfig): string {
  // FIX: ensure address never leaks the business/service name by using strict fallback chain
  const address = business?.address || site?.pages[0]?.contactInfo?.address?.[0] || '';
  const phone = site?.pages[0]?.contactInfo?.phone?.[0] || business?.phone || '';
  const email = site?.pages[0]?.contactInfo?.email?.[0] || '';
  const lat = business?.latitude || 0;
  const lng = business?.longitude || 0;
  const isSpanish = !!(name.match(/[áéíóúñ]/i));

  return `<div class="space-y-8">
    <div class="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm hover-lift">
        <h3 class="mb-4 text-lg font-bold text-heading"><span class="text-secondary">📍</span> ${escHtml(name)}</h3>
        <div class="space-y-3 text-sm text-secondary">
            ${address ? `<div class="flex items-start gap-3"><span>📍</span><span>${escHtml(address)}</span></div>` : ''}
            ${phone ? `<div class="flex items-start gap-3"><span>📞</span><a href="tel:${escAttr(phone)}" class="transition hover:underline" style="color:var(--color-gold);">${escHtml(phone)}</a></div>` : ''}
            ${email ? `<div class="flex items-start gap-3"><span>✉️</span><a href="mailto:${escAttr(email)}" class="transition hover:underline" style="color:var(--color-gold);">${escHtml(email)}</a></div>` : ''}
        </div>
    </div>
    ${lat && lng ? `<div class="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm overflow-hidden hover-lift">
        <iframe title="${escAttr(name)} - Location" src="https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01}%2C${lat - 0.01}%2C${lng + 0.01}%2C${lat + 0.01}&layer=mapnik&marker=${lat}%2C${lng}" width="100%" height="300" style="border:0;border-radius:12px" loading="lazy" allowfullscreen></iframe>
        <p class="mt-2 text-center text-[10px] text-quaternary"><a href="https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}" target="_blank" rel="noopener noreferrer" class="text-secondary hover:underline">View on OpenStreetMap</a></p>
    </div>` : ''}
</div>`;
}

// ═══════════ Helper: Contact form HTML ═══════════

function buildContactFormHtml(isSpanish: boolean, config: ThemeConfig): string {
  return `<div class="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm hover-lift">
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
        <!-- reCAPTCHA Container -->
        <div class="g-recaptcha" data-sitekey="YOUR_RECAPTCHA_SITE_KEY" style="border:1px solid rgba(var(--color-gold-rgb),0.15);border-radius:8px;padding:12px;background:rgba(0,0,0,0.2);"></div>
        <button type="submit" class="pulse-btn shimmer-btn-gold w-full rounded-lg bg-gradient-to-r from-[${config.primaryColor}] via-[${config.secondaryColor}] to-[${config.primaryColor}] px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:scale-105">
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
  const address = business?.address || site?.pages[0]?.contactInfo?.address?.[0] || '';
  const currentYear = '<?php echo date("Y"); ?>';
  const socialIconSize = '20';

  return `</main>
<footer class="relative px-4 py-16 overflow-hidden">
    <!-- Animated Gradient Background -->
    <div class="animated-mesh">
        <div class="mesh-blob"></div>
        <div class="mesh-blob"></div>
        <div class="mesh-blob"></div>
    </div>
    <div class="absolute inset-0 bg-section opacity-50"></div>
    <div class="absolute top-0 left-0 right-0 h-[2px]" style="background:linear-gradient(90deg, transparent, var(--color-gold), var(--color-primary), var(--color-gold), transparent);background-size:200% 100%;animation:gradient 4s linear infinite;"></div>
    <div class="relative z-10 container mx-auto max-w-6xl">
        <div class="grid gap-10 md:grid-cols-4">
            <div class="md:col-span-2">
                <h4 class="mb-4 text-lg font-semibold text-white"><span class="gradient-text-gold">${escHtml(name)}</span></h4>
                <p class="max-w-sm text-sm leading-relaxed text-tertiary">${escHtml(content.tagline || `Welcome to ${name}`)}</p>
                ${address ? `<p class="mt-3 text-xs text-tertiary">📍 ${escHtml(address)}</p>` : ''}
                <div class="mt-6 flex gap-4">
                    <!-- Facebook with glow -->
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" class="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm text-tertiary transition-all duration-300 hover:border-white/40 hover:bg-white/10 hover:text-white hover:shadow-[0_0_20px_rgba(var(--color-gold-rgb),0.3)]" aria-label="Facebook">
                        <svg width="${socialIconSize}" height="${socialIconSize}" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                    </a>
                    <!-- Instagram with glow -->
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" class="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm text-tertiary transition-all duration-300 hover:border-white/40 hover:bg-white/10 hover:text-white hover:shadow-[0_0_20px_rgba(var(--color-gold-rgb),0.3)]" aria-label="Instagram">
                        <svg width="${socialIconSize}" height="${socialIconSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                    </a>
                    <!-- Twitter/X with glow -->
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" class="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm text-tertiary transition-all duration-300 hover:border-white/40 hover:bg-white/10 hover:text-white hover:shadow-[0_0_20px_rgba(var(--color-gold-rgb),0.3)]" aria-label="Twitter">
                        <svg width="${socialIconSize}" height="${socialIconSize}" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    </a>
                </div>
            </div>
            <div>
                <h4 class="mb-4 text-sm font-semibold uppercase tracking-wider text-tertiary">${isSpanish ? 'Enlaces' : 'Links'}</h4>
                <div class="space-y-3 text-sm">
                    ${businessType === 'restaurant' ? `<a href="#menu" class="block text-sm text-tertiary transition-all duration-300 hover:text-white hover:translate-x-1">${isSpanish ? 'Nuestra Carta' : 'Our Menu'}</a>` : ''}
                    <a href="#about" class="block text-sm text-tertiary transition-all duration-300 hover:text-white hover:translate-x-1">${isSpanish ? 'Sobre nosotros' : 'About Us'}</a>
                    <a href="#services" class="block text-sm text-tertiary transition-all duration-300 hover:text-white hover:translate-x-1">${isSpanish ? 'Qué ofrecemos' : 'Services'}</a>
                    <a href="#contact" class="block text-sm text-tertiary transition-all duration-300 hover:text-white hover:translate-x-1">${isSpanish ? 'Contacto' : 'Contact'}</a>
                </div>
            </div>
        </div>
        <div class="mt-12 border-t border-white/10 pt-8 text-center text-xs text-quaternary leading-relaxed">
            <p>&copy; ${currentYear} ${escHtml(name)}. ${isSpanish ? 'Todos los derechos reservados.' : 'All rights reserved.'}</p>
            <p class="mt-1">Made with ❤️ by <a href="https://alexawebservers.com" target="_blank" rel="noopener noreferrer" class="text-secondary hover:text-white transition-colors">alexawebservers.com</a></p>
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
    --border-angle: 0deg;
}

/* ══════════════ KEYFRAMES ══════════════ */

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

@keyframes slide-in-left {
    from { opacity: 0; transform: translateX(-40px); }
    to { opacity: 1; transform: translateX(0); }
}

@keyframes slide-in-right {
    from { opacity: 0; transform: translateX(40px); }
    to { opacity: 1; transform: translateX(0); }
}

@keyframes fade-up {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}

/* ══════════════ RESET & BASE ══════════════ */

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: var(--color-bg-page);
    color: var(--color-text-page);
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
}

/* ══════════════ GRADIENT TEXT ══════════════ */

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

/* ══════════════ GLASSMORPHISM ══════════════ */

.glass {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.1);
}
.glass-strong {
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.15);
}

/* ══════════════ GLOW CARD ══════════════ */

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

/* ══════════════ SHIMMER BUTTON ══════════════ */

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

/* ══════════════ ANIMATED BACKGROUND MESH ══════════════ */

.animated-mesh {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    z-index: 0;
}
.animated-mesh .mesh-blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.15;
    animation: breathe 6s ease-in-out infinite;
}
.animated-mesh .mesh-blob:nth-child(1) {
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(var(--color-gold-rgb), 0.4), transparent 70%);
    top: -10%;
    left: -5%;
    animation-delay: 0s;
}
.animated-mesh .mesh-blob:nth-child(2) {
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(var(--color-primary-rgb), 0.3), transparent 70%);
    bottom: -5%;
    right: -5%;
    animation-delay: 2s;
}
.animated-mesh .mesh-blob:nth-child(3) {
    width: 250px;
    height: 250px;
    background: radial-gradient(circle, rgba(var(--color-gold-rgb), 0.25), transparent 70%);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation-delay: 4s;
}

/* ══════════════ DRIFT PATTERN ══════════════ */

.drift-pattern {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    z-index: 0;
}
.drift-pattern .drift-shape {
    position: absolute;
    border-radius: 50%;
    opacity: 0.08;
    animation: drift 12s linear infinite;
}
.drift-pattern .drift-shape:nth-child(1) {
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(var(--color-gold-rgb), 0.5), transparent 70%);
    top: 20%;
    left: 10%;
    animation-duration: 14s;
}
.drift-pattern .drift-shape:nth-child(2) {
    width: 150px;
    height: 150px;
    background: radial-gradient(circle, rgba(var(--color-primary-rgb), 0.4), transparent 70%);
    top: 60%;
    right: 15%;
    animation-duration: 18s;
    animation-delay: -3s;
}
.drift-pattern .drift-shape:nth-child(3) {
    width: 100px;
    height: 100px;
    background: radial-gradient(circle, rgba(var(--color-gold-rgb), 0.3), transparent 70%);
    bottom: 10%;
    left: 30%;
    animation-duration: 10s;
    animation-delay: -6s;
}

/* ══════════════ FLOATING PARTICLES ══════════════ */

.floating-particle {
    position: absolute;
    border-radius: 9999px;
    background: radial-gradient(circle at center, rgba(var(--color-gold-rgb), 0.6), transparent 70%);
    pointer-events: none;
    animation: float var(--particle-duration, 3s) ease-in-out var(--particle-delay, 0s) infinite;
    width: var(--particle-size, 6px);
    height: var(--particle-size, 6px);
    top: var(--particle-y, 0);
    left: var(--particle-x, 0);
}

/* ══════════════ FLOATING ANIMATION UTILITIES ══════════════ */

.float {
    animation: float 3s ease-in-out infinite;
}
.float-delayed {
    animation: float 4s ease-in-out 1s infinite;
}
.float-slow {
    animation: float 5s ease-in-out 0.5s infinite;
}

/* ══════════════ PULSE GLOW ══════════════ */

.pulse-glow {
    animation: pulse-glow 2s ease-in-out infinite;
}

/* ══════════════ PULSE BUTTON ══════════════ */

.pulse-btn {
    animation: pulse 2s ease-in-out infinite;
}
.pulse-btn:hover {
    animation: none;
    transform: scale(1.05);
}

/* ══════════════ HOVER LIFT ══════════════ */

.hover-lift {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.hover-lift:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
}
.hover-lift-sm:hover {
    transform: translateY(-2px);
}
.hover-lift-lg:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

/* ══════════════ SCROLL REVEAL ══════════════ */

.reveal {
    opacity: 0;
    transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}
.reveal.fade-up {
    transform: translateY(30px);
}
.reveal.fade-left {
    transform: translateX(-30px);
}
.reveal.fade-right {
    transform: translateX(30px);
}
.reveal.revealed {
    opacity: 1;
    transform: translateX(0) translateY(0);
}

/* ══════════════ SPARKLE STARS ══════════════ */

.sparkle-star {
    display: inline-block;
    color: #FFD700;
    animation: sparkle 1.5s ease-in-out infinite;
}
.sparkle-star:nth-child(2) { animation-delay: 0.2s; }
.sparkle-star:nth-child(3) { animation-delay: 0.4s; }
.sparkle-star:nth-child(4) { animation-delay: 0.6s; }
.sparkle-star:nth-child(5) { animation-delay: 0.8s; }

/* ══════════════ COUNTER STAT CARDS ══════════════ */

.stat-card {
    text-align: center;
    padding: 2rem 1.5rem;
}
.stat-card .stat-number {
    font-size: 3rem;
    font-weight: 900;
    background: linear-gradient(135deg, var(--color-gold), #FFD700, var(--color-gold));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    line-height: 1.1;
    margin-bottom: 0.5rem;
}
.stat-card .stat-label {
    font-size: 1rem;
    color: var(--color-text-secondary);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

/* ══════════════ HERO CAROUSEL ══════════════ */

.hero-carousel {
    position: relative;
    overflow: hidden;
    width: 100%;
}
.hero-carousel .slide {
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 0.8s ease, transform 0.8s ease;
}
.hero-carousel .slide.active {
    opacity: 1;
    position: relative;
    animation: fade-up 0.8s ease forwards;
}
.hero-carousel .slide.slide-in-left {
    animation: slide-in-left 0.8s ease forwards;
}
.hero-carousel .slide.slide-in-right {
    animation: slide-in-right 0.8s ease forwards;
}
.carousel-prev,
.carousel-next {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: white;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 1.25rem;
}
.carousel-prev:hover,
.carousel-next:hover {
    background: rgba(var(--color-gold-rgb), 0.3);
    border-color: rgba(var(--color-gold-rgb), 0.5);
    box-shadow: 0 0 20px rgba(var(--color-gold-rgb), 0.2);
}
.carousel-prev { left: 1rem; }
.carousel-next { right: 1rem; }
.carousel-indicators {
    position: absolute;
    bottom: 1.5rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 0.5rem;
    z-index: 10;
}
.carousel-indicator {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.35);
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
}
.carousel-indicator.active {
    background: var(--color-gold);
    box-shadow: 0 0 10px rgba(var(--color-gold-rgb), 0.5);
    width: 28px;
    border-radius: 5px;
}

/* ══════════════ MOBILE MENU ══════════════ */

#mobile-menu-toggle {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 36px;
    height: 36px;
    cursor: pointer;
    background: none;
    border: none;
    gap: 5px;
    padding: 6px;
    z-index: 100;
}
#mobile-menu-toggle span {
    display: block;
    width: 22px;
    height: 2px;
    background: white;
    border-radius: 2px;
    transition: all 0.3s ease;
    transform-origin: center;
}
#mobile-menu-toggle.is-active span:nth-child(1) {
    transform: translateY(7px) rotate(45deg);
}
#mobile-menu-toggle.is-active span:nth-child(2) {
    opacity: 0;
    transform: scaleX(0);
}
#mobile-menu-toggle.is-active span:nth-child(3) {
    transform: translateY(-7px) rotate(-45deg);
}

#mobile-menu {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 280px;
    max-width: 85vw;
    background: rgba(0, 0, 0, 0.95);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    z-index: 90;
    padding: 5rem 2rem 2rem;
    transform: translateX(100%);
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    overflow-y: auto;
}
#mobile-menu.open {
    transform: translateX(0);
}
#mobile-menu-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 80;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.4s ease;
}
#mobile-menu-overlay.open {
    opacity: 1;
    pointer-events: auto;
}

/* ══════════════ LANGUAGE DROPDOWN ══════════════ */

.lang-dropdown {
    position: relative;
    display: inline-block;
}
.lang-dropdown-toggle {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: white;
    padding: 0.375rem 0.75rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.375rem;
}
.lang-dropdown-toggle:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(var(--color-gold-rgb), 0.4);
}
.lang-dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 0.5rem;
    background: rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 0.5rem;
    min-width: 120px;
    opacity: 0;
    transform: translateY(-8px);
    pointer-events: none;
    transition: all 0.3s ease;
    z-index: 60;
}
.lang-dropdown:hover .lang-dropdown-menu,
.lang-dropdown-menu.open {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
}
.lang-dropdown-item {
    display: block;
    width: 100%;
    padding: 0.5rem 1rem;
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
    border-radius: 4px;
    font-size: 0.875rem;
    transition: all 0.2s ease;
    cursor: pointer;
    background: none;
    border: none;
    text-align: left;
}
.lang-dropdown-item:hover {
    background: rgba(var(--color-gold-rgb), 0.15);
    color: white;
}
.lang-dropdown-item.active {
    color: var(--color-gold);
    font-weight: 600;
}

/* ══════════════ THEME TOGGLE ══════════════ */

.theme-toggle-btn {
    width: 36px !important;
    height: 36px !important;
    min-width: 36px !important;
    min-height: 36px !important;
    border-radius: 50% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    background: rgba(255, 255, 255, 0.08) !important;
    border: 1px solid rgba(255, 255, 255, 0.12) !important;
    cursor: pointer !important;
    transition: all 0.3s ease !important;
    position: relative !important;
    overflow: visible !important;
    color: white !important;
    font-size: 1rem !important;
}
.theme-toggle-btn:hover {
    background: rgba(255, 255, 255, 0.15) !important;
    border-color: rgba(${sRgb.r}, ${sRgb.g}, ${sRgb.b}, 0.4) !important;
    box-shadow: 0 0 12px rgba(${sRgb.r}, ${sRgb.g}, ${sRgb.b}, 0.25) !important;
}
.theme-toggle-btn:focus-visible {
    outline: none !important;
    box-shadow: 0 0 0 2px rgba(${sRgb.r}, ${sRgb.g}, ${sRgb.b}, 0.5) !important;
}
.theme-toggle-btn::after {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(${sRgb.r}, ${sRgb.g}, ${sRgb.b}, 0.15), transparent 70%);
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
}
.theme-toggle-btn:hover::after {
    opacity: 1;
}

/* ══════════════ BACKGROUND UTILITIES ══════════════ */

.bg-page { background: var(--color-bg-page); }
.bg-section { background: var(--color-bg-section); }
.bg-header { background: var(--color-header-bg); }
.bg-card-inner { background: var(--color-bg-card-inner); }

/* ══════════════ TEXT UTILITIES ══════════════ */

.text-page { color: var(--color-text-page); }
.text-heading { color: var(--color-text-heading); }
.text-secondary { color: var(--color-text-secondary); }
.text-tertiary { color: var(--color-text-tertiary); }
.text-quaternary { color: var(--color-text-quaternary); }

/* ══════════════ LAYOUT ══════════════ */

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

/* ══════════════ GRID ══════════════ */

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

/* ══════════════ FLEX ══════════════ */

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

/* ══════════════ TYPOGRAPHY ══════════════ */

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

/* ══════════════ BUTTONS ══════════════ */

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

/* ══════════════ CARDS ══════════════ */

.rounded-xl { border-radius: 0.75rem; }
.rounded-2xl { border-radius: 1rem; }
.rounded-lg { border-radius: 0.5rem; }
.rounded-full { border-radius: 9999px; }
.border { border: 1px solid; }
.border-white\\/10 { border-color: rgba(255, 255, 255, 0.1); }
.border-white\\/30 { border-color: rgba(255, 255, 255, 0.3); }

/* ══════════════ BACKDROP BLUR ══════════════ */

.backdrop-blur-sm { backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
.backdrop-blur-2xl { backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }

/* ══════════════ OVERFLOW & POSITION ══════════════ */

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

/* ══════════════ SHADOW ══════════════ */

.shadow-lg { box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); }
.shadow-black\\/5 { box-shadow: 0 0 0 1px rgba(0,0,0,0.05); }
.shadow-\\[0_0_20px_rgba\\(var\\(--color-gold-rgb\\),0\\.3\\)\\] { box-shadow: 0 0 20px rgba(222, 102, 72, 0.3); }

/* ══════════════ TRANSITIONS ══════════════ */

.transition-all { transition: all 0.3s ease; }
.duration-300 { transition-duration: 0.3s; }
.hover\\:scale-105:hover { transform: scale(1.05); }
.hover\\:text-white:hover { color: white; }

/* ══════════════ WP OVERWRITES ══════════════ */

a { color: inherit; text-decoration: none; }
img { max-width: 100%; height: auto; }

/* ══════════════ FORM INPUTS ══════════════ */

input, textarea {
    background: rgba(0,0,0,0.3);
    color: white;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 0.5rem;
    padding: 0.75rem 1rem;
    transition: all 0.3s ease;
}
input:focus, textarea:focus {
    border-color: var(--color-gold);
    outline: none;
    box-shadow: 0 0 0 2px rgba(var(--color-gold-rgb), 0.15), 0 0 25px rgba(var(--color-gold-rgb), 0.15);
    background: rgba(0,0,0,0.4);
}
input:hover, textarea:hover {
    border-color: rgba(var(--color-gold-rgb), 0.3);
}

/* ══════════════ OBJECT FIT ══════════════ */

.object-cover { object-fit: cover; }
.h-full { height: 100%; }
.w-full { width: 100%; }
.h-\\[90vh\\] { height: 90vh; }
.min-h-\\[600px\\] { min-height: 600px; }
.min-h-screen { min-height: 100vh; }

/* ══════════════ ANIMATED GRADIENT BACKGROUND ══════════════ */

.animated-gradient {
    background: linear-gradient(135deg, ${p}, ${s}, ${p}, ${s});
    background-size: 400% 400%;
    animation: gradient 8s ease infinite;
}

/* ══════════════ SCROLLBAR ══════════════ */

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
::-webkit-scrollbar-thumb { background: linear-gradient(180deg, ${p}, ${s}); border-radius: 3px; }

/* ══════════════ SELECTION ══════════════ */

::selection { background: ${p}; color: white; }

/* ══════════════ MAP CONTAINER ══════════════ */

.map-container { width: 100%; height: 250px; border-radius: 0.75rem; overflow: hidden; }
.map-container iframe { width: 100%; height: 100%; border: 0; }
`;
}

// ═══════════ Docker Compose builder ─────────────────────────────────

function buildDockerCompose(name: string, domain: string, themeDir: string): string {
  // Derive the filesystem/slug name (strips possessive 's) for port/DB naming
  const slug = name
    .toLowerCase()
    .replace(/'s\b/g, "")
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .replace(/-+/g, "-");
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
        define('WP_HOME', 'https://${domain}.alexawebservers.com');
        define('WP_SITEURL', 'https://${domain}.alexawebservers.com');
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

// ═══════════ Theme JavaScript ─────────────────────────────────────────

function buildThemeJs(): string {
  return `/**
 * WordPress Theme JavaScript
 * Handles: Carousel, Mobile Menu, Language Dropdown, Theme Toggle,
 *          Animated Counters, Scroll Entrance Animations, Particles
 * Pure vanilla JS — no dependencies.
 */
(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    initCarousel();
    initMobileMenu();
    initLangDropdown();
    initThemeToggle();
    initCounters();
    initScrollReveal();
    initParticles();
  }

  function initCarousel() {
    var container = document.querySelector('.hero-carousel');
    if (!container) return;
    var slides = container.querySelectorAll('.slide');
    if (slides.length === 0) return;
    var current = 0;
    var total = slides.length;
    var interval = null;
    var AUTO_DELAY = 5000;

    var indicatorsContainer = document.createElement('div');
    indicatorsContainer.className = 'carousel-indicators';
    container.appendChild(indicatorsContainer);
    var indicators = [];
    for (var i = 0; i < total; i++) {
      (function(idx) {
        var dot = document.createElement('button');
        dot.className = 'carousel-indicator' + (idx === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Go to slide ' + (idx + 1));
        dot.addEventListener('click', function () {
          goToSlide(idx);
          resetAutoRotation();
        });
        indicatorsContainer.appendChild(dot);
        indicators.push(dot);
      })(i);
    }

    var prevBtn = container.querySelector('.carousel-prev');
    var nextBtn = container.querySelector('.carousel-next');

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        goToSlide(current - 1 < 0 ? total - 1 : current - 1);
        resetAutoRotation();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        goToSlide(current + 1 >= total ? 0 : current + 1);
        resetAutoRotation();
      });
    }

    slides[0].classList.add('active');

    function goToSlide(index) {
      if (index === current) return;
      slides[current].classList.remove('active');
      slides[index].classList.add('active');
      if (indicators[current]) indicators[current].classList.remove('active');
      if (indicators[index]) indicators[index].classList.add('active');
      current = index;
    }

    function startAutoRotation() {
      stopAutoRotation();
      interval = setInterval(function () {
        goToSlide(current + 1 >= total ? 0 : current + 1);
      }, AUTO_DELAY);
    }
    function stopAutoRotation() { if (interval) { clearInterval(interval); interval = null; } }
    function resetAutoRotation() { stopAutoRotation(); startAutoRotation(); }

    container.addEventListener('mouseenter', stopAutoRotation);
    container.addEventListener('mouseleave', startAutoRotation);
    startAutoRotation();
  }

  function initMobileMenu() {
    var toggle = document.getElementById('mobile-menu-toggle');
    var menu = document.getElementById('mobile-menu');
    if (!toggle || !menu) return;
    toggle.addEventListener('click', function () {
      var isOpen = menu.classList.toggle('open');
      toggle.classList.toggle('is-active');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    var links = menu.querySelectorAll('a');
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener('click', function () {
        menu.classList.remove('open');
        toggle.classList.remove('is-active');
        document.body.style.overflow = '';
      });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('open')) {
        toggle.click();
      }
    });
  }

  function initLangDropdown() {
    var toggle = document.getElementById('lang-toggle');
    if (!toggle) return;
    var dropdown = document.getElementById('lang-dropdown');
    if (!dropdown) return;
    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      dropdown.classList.toggle('open');
    });
    document.addEventListener('click', function (e) {
      if (!toggle.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove('open');
      }
    });
  }

  function initThemeToggle() {
    var toggle = document.getElementById('theme-toggle');
    if (!toggle) return;
    var html = document.documentElement;
    var saved = localStorage.getItem('theme');
    if (saved === 'light') { html.classList.remove('dark'); }
    else if (saved === 'dark') { html.classList.add('dark'); }
    else {
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) html.classList.add('dark');
    }
    toggle.addEventListener('click', function () {
      var isDark = html.classList.toggle('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
  }

  function initCounters() {
    var counters = document.querySelectorAll('.animated-counter');
    if (counters.length === 0) return;
    if (!('IntersectionObserver' in window)) {
      for (var f = 0; f < counters.length; f++) {
        var t = parseInt(counters[f].getAttribute('data-target'), 10);
        if (!isNaN(t)) counters[f].textContent = t;
      }
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var targetVal = parseInt(el.getAttribute('data-target'), 10);
          if (isNaN(targetVal) || targetVal <= 0) return;
          if (el.dataset.counted === 'true') return;
          el.dataset.counted = 'true';
          var current = 0;
          var step = Math.ceil(targetVal / 40);
          var timer = setInterval(function () {
            current += step;
            if (current >= targetVal) { current = targetVal; clearInterval(timer); }
            el.textContent = current;
          }, 30);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    for (var i = 0; i < counters.length; i++) { observer.observe(counters[i]); }
  }

  function initScrollReveal() {
    var reveals = document.querySelectorAll('.reveal');
    if (reveals.length === 0) return;
    if (!('IntersectionObserver' in window)) {
      for (var f = 0; f < reveals.length; f++) { reveals[f].classList.add('revealed'); }
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    for (var i = 0; i < reveals.length; i++) { observer.observe(reveals[i]); }
  }

  function initParticles() {
    var particles = document.querySelectorAll('.floating-particle');
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.style.setProperty('--particle-delay', (Math.random() * 4).toFixed(2) + 's');
      p.style.setProperty('--particle-duration', (4 + Math.random() * 4).toFixed(2) + 's');
      p.style.setProperty('--particle-x', (20 + Math.random() * 40).toFixed(0) + 'px');
      p.style.setProperty('--particle-y', (20 + Math.random() * 40).toFixed(0) + 'px');
    }
  }

})();`;
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
