#!/usr/bin/env node
/**
 * Force-regenerate all theme files for Daria's Bakery & Bistro.
 * Reads site data from DB, generates fresh theme files.
 */
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/db/schema.js';
import { generateFooter, generateHeader, generateHero, generateAbout, generateServices, generateReviews, generateContact, generateCss } from '../src/lib/theme-generator/index.js';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';

const __dirname = new URL('.', import.meta.url).pathname;
const THEME_DIR = join(__dirname, '..', 'src', 'components', 'theme');
const slug = process.argv[2] || 'darias-bakery-bistro';

async function main() {
  const client = postgres(process.env.DATABASE_URL || 'postgres://postgres@localhost:5432/rake_cms');
  const db = drizzle(client, { schema });

  const sites = await db.select().from(schema.wpSites).where(
    (s) => s.slug === slug
  );
  
  if (!sites.length) {
    console.error(`Site "${slug}" not found`);
    process.exit(1);
  }

  const site = sites[0];
  console.log(`Regenerating theme for: ${site.name} (slug: ${site.slug})`);

  mkdirSync(THEME_DIR, { recursive: true });

  const name = site.name;
  const businessType = (site.businessType || 'restaurant');
  const themeConfig = site.themeConfig || {};

  // Build content object
  const content = {
    tagline: 'Breakfast & lunch in Costa Adeje',
    heroSubtitle: 'Delicious homemade breakfast and lunch in Costa Adeje',
  };

  const pageSlugs = [
    { slug: 'about', label: 'Sobre nosotros' },
    { slug: 'services', label: 'Qué ofrecemos' },
    { slug: 'menu', label: 'Nuestra Carta' },
    { slug: 'contact', label: 'Contacto' },
  ];

  // Generate all components
  const files = {
    'theme.css': () => generateCss(businessType, themeConfig),
    'Header.tsx': () => generateHeader(name, pageSlugs, businessType, content, null),
    'Hero.tsx': () => generateHero(name, businessType, content, null, [], businessType),
    'About.tsx': () => generateAbout(name, businessType, content, null, [], businessType),
    'Services.tsx': () => generateServices(businessType, content, businessType),
    'Reviews.tsx': () => generateReviews(name, businessType, content, null, [], businessType),
    'Contact.tsx': () => generateContact(name, '', '', '', null, null, businessType, content, null, []),
    'Footer.tsx': () => generateFooter(null, name, pageSlugs, content, businessType, null),
    'GeneratedPage.tsx': () => `// Auto-generated page component
import Header from "./Header";
import Hero from "./Hero";
import About from "./About";
import Services from "./Services";
import Reviews from "./Reviews";
import Contact from "./Contact";
import Footer from "./Footer";

export default function GeneratedPage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <Services />
        <Reviews />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
`,
  };

  for (const [filename, generator] of Object.entries(files)) {
    const filepath = join(THEME_DIR, filename);
    console.log(`  Generating ${filename}...`);
    const content = generator();
    writeFileSync(filepath, content, 'utf-8');
  }

  console.log('✅ All theme files regenerated');
  await client.end();
}

main().catch(console.error);
