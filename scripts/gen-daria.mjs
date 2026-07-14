import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const DIR = 'src/components/theme';
mkdirSync(DIR, { recursive: true });

const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/'/g,"&#x27;").replace(/"/g,"&quot;");

const name = "Daria's Bakery & Bistro | Breakfast & Lunch";
const nameShort = "Daria's Bakery & Bistro";
const taglineEs = "Desayuno y almuerzo artesanal en Costa Adeje";
const taglineEn = "Homemade breakfast & lunch in Costa Adeje";

// --- Header ---
writeFileSync(join(DIR,'Header.tsx'), `// Header
"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { useState } from "react";

export default function Header() {
  const { t, lang } = useLanguage();
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-header backdrop-blur-xl">
      <div className="container mx-auto flex items-center justify-between px-4 py-3 max-w-6xl">
        <Link href="/" className="text-lg font-bold gradient-text-gold tracking-tight">${esc(nameShort)}</Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/#about" className="text-tertiary hover:text-white transition-colors">{t("nav.about")}</Link>
          <Link href="/#services" className="text-tertiary hover:text-white transition-colors">{t("nav.services")}</Link>
          <Link href="/#menu" className="text-tertiary hover:text-white transition-colors">{t("nav.menu")}</Link>
          <Link href="/#contact" className="text-tertiary hover:text-white transition-colors">{t("nav.contact")}</Link>
        </nav>
        <button onClick={() => setOpen(!open)} className="md:hidden text-white p-2">MENU</button>
      </div>
      {open && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="md:hidden border-t border-white/10 bg-header px-4 py-4">
          <Link href="/#about" className="block py-2 text-tertiary">{t("nav.about")}</Link>
          <Link href="/#services" className="block py-2 text-tertiary">{t("nav.services")}</Link>
          <Link href="/#menu" className="block py-2 text-tertiary">{t("nav.menu")}</Link>
          <Link href="/#contact" className="block py-2 text-tertiary">{t("nav.contact")}</Link>
        </motion.div>
      )}
    </header>
  );
}
`);
console.log('Header.tsx');

// --- Hero ---
writeFileSync(join(DIR,'Hero.tsx'), `// Hero
"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";

export default function Hero() {
  const { t, lang } = useLanguage();
  const __ = (m) => m[lang] || m.es || "";
  return (
    <section className="relative min-h-screen flex items-center px-4 pt-20 overflow-hidden">
      <div className="absolute inset-0 bg-hero opacity-90" />
      <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 70% 30%, rgba(var(--color-gold-rgb), 0.08), transparent 60%)" }} />
      <div className="relative z-10 container mx-auto max-w-4xl text-center">
        <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mb-6 text-4xl font-black tracking-tight md:text-5xl lg:text-6xl leading-tight gradient-text-gold">
          ${esc(name)}
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="mx-auto mb-10 max-w-2xl text-lg text-tertiary leading-relaxed">
          {__({es: "${esc(taglineEs)}", en: "${esc(taglineEn)}"})}
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="flex flex-wrap justify-center gap-4">
          <Link href="/#menu" className="rounded-lg bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-gold)] px-8 py-3 text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all">{t("hero.cta_menu")}</Link>
          <Link href="/#contact" className="rounded-lg border border-white/20 px-8 py-3 text-sm font-medium text-tertiary hover:border-white/40 hover:text-white transition-all">{t("hero.cta_contact")}</Link>
        </motion.div>
      </div>
    </section>
  );
}
`);
console.log('Hero.tsx');

// --- About ---
writeFileSync(join(DIR,'About.tsx'), `// About
"use client";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";

export default function About() {
  const { t, lang } = useLanguage();
  const __ = (m) => m[lang] || m.es || "";
  const stats = [
    { value: 500, label: { es: "Clientes satisfechos", en: "Happy clients" }, suffix: "+", decimals: 0 },
    { value: 8, label: { es: "Años de experiencia", en: "Years experience" }, suffix: "+", decimals: 0 },
    { value: 98, label: { es: "Satisfaccion", en: "Satisfaction" }, suffix: "%", decimals: 0 },
  ];
  return (
    <section id="about" className="relative px-4 py-24 overflow-hidden">
      <div className="absolute inset-0 bg-section opacity-90" />
      <div className="relative z-10 container mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mx-auto max-w-3xl text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)]">{t("about.label")}</p>
          <h2 className="mb-6 text-3xl font-bold md:text-4xl gradient-text">{t("about.title")}</h2>
          <p className="text-base leading-relaxed text-secondary">
            {__({es: "En Daria's Bakery & Bistro fusionamos la tradicion panadera europea con los sabores frescos de Canarias. Cada manana horneamos croissants, brioches y panes artesanales, mientras nuestra cocina prepara desayunos y almuerzos con ingredientes locales de temporada. Un espacio acogedor donde el aroma del cafe recien hecho y la reposteria recien horneada te invitan a disfrutar del momento.", en: "At Daria's Bakery & Bistro we blend European baking tradition with fresh Canarian flavours. Every morning we bake croissants, brioches, and artisan breads, while our kitchen prepares breakfasts and lunches with local seasonal ingredients. A cozy space where the aroma of freshly brewed coffee and just-baked pastries invites you to savour the moment."})}
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-12 grid grid-cols-3 gap-6">
          {stats.map((stat) => (
            <div key={typeof stat.label === 'string' ? stat.label : stat.label.en} className="rounded-xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm">
              <div className="text-3xl font-black text-[var(--color-gold)]">{stat.value}{stat.suffix}</div>
              <div className="mt-2 text-xs text-tertiary">{typeof stat.label === 'string' ? stat.label : __(stat.label)}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
`);
console.log('About.tsx');

// --- Services ---
writeFileSync(join(DIR,'Services.tsx'), `// Services
"use client";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";

export default function Services() {
  const { t, lang } = useLanguage();
  const __ = (m) => m[lang] || m.es || "";
  const services = [
    { icon: "C", title: { es: "Reposteria Artesanal", en: "Artisan Pastries" }, desc: { es: "Croissants, brioches, magdalenas y tartas horneadas cada manana con ingredientes naturales.", en: "Croissants, brioches, muffins, and cakes baked fresh every morning with natural ingredients." } },
    { icon: "C", title: { es: "Cafe de Especialidad", en: "Specialty Coffee" }, desc: { es: "Cafe de origen unico preparado por baristas expertos. Espresso, cappuccino, latte y mas.", en: "Single-origin coffee prepared by expert baristas. Espresso, cappuccino, latte, and more." } },
    { icon: "B", title: { es: "Brunch & Almuerzo", en: "Brunch & Lunch" }, desc: { es: "Bowls saludables, tostadas gourmet, sanduches artesanales y ensaladas frescas.", en: "Healthy bowls, gourmet toasts, artisan sandwiches, and fresh salads." } },
    { icon: "S", title: { es: "Smoothies & Zumos", en: "Smoothies & Juices" }, desc: { es: "Smoothies tropicales, zumos naturales y batidos proteinicos con fruta fresca de temporada.", en: "Tropical smoothies, fresh juices, and protein shakes with seasonal fruit." } },
    { icon: "C", title: { es: "Tartas Personalizadas", en: "Custom Cakes" }, desc: { es: "Tartas y pasteles para celebraciones, encargos especiales y eventos privados.", en: "Cakes and pastries for celebrations, special orders, and private events." } },
    { icon: "T", title: { es: "Take Away", en: "Take Away" }, desc: { es: "Todo nuestro menu disponible para llevar. Perfecto para disfrutar en casa o en la playa.", en: "Our full menu available to go. Perfect for enjoying at home or on the beach." } },
  ];
  return (
    <section id="services" className="relative px-4 py-24 overflow-hidden">
      <div className="absolute inset-0 bg-section" />
      <div className="relative z-10 container mx-auto max-w-6xl">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)]">{t("services.label")}</p>
          <h2 className="text-3xl font-bold md:text-4xl gradient-text">{t("services.title")}</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((svc, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="group rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-[var(--color-gold)]/40 hover:bg-white/[0.08] hover:shadow-[0_0_30px_rgba(var(--color-gold-rgb),0.08)]">
              <div className="mb-4 text-3xl">{svc.icon}</div>
              <h3 className="mb-2 text-lg font-semibold text-heading">{__(svc.title)}</h3>
              <p className="text-sm leading-relaxed text-secondary">{__(svc.desc)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
`);
console.log('Services.tsx');

// --- Reviews ---
writeFileSync(join(DIR,'Reviews.tsx'), `// Reviews
"use client";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";

export default function Reviews() {
  const { t, lang } = useLanguage();
  const __ = (m) => m[lang] || m.es || "";
  const reviews = [
    { name: "Sarah M.", text: { es: "El mejor desayuno de Costa Adeje. Los croissants son increibles y el cafe de especialidad es espectacular.", en: "Best breakfast in Costa Adeje. The croissants are incredible and the specialty coffee is outstanding." }, rating: 5 },
    { name: "Carlos G.", text: { es: "Un lugar encantador con un ambiente acogedor. El brunch de fin de semana es imperdible.", en: "A charming place with a cozy atmosphere. The weekend brunch is a must." }, rating: 5 },
    { name: "Emma W.", text: { es: "Autentica reposteria europea en Tenerife. Las tartas son deliciosas y el servicio es excelente.", en: "Authentic European baking in Tenerife. The cakes are delicious and the service is excellent." }, rating: 5 },
    { name: "Miguel A.", text: { es: "Perfecto para un almuerzo ligero. Las ensaladas son frescas y los sandwiches gourmet.", en: "Perfect for a light lunch. The salads are fresh and the sandwiches gourmet." }, rating: 4 },
  ];
  return (
    <section id="reviews" className="relative px-4 py-24 overflow-hidden">
      <div className="absolute inset-0 bg-section opacity-90" />
      <div className="relative z-10 container mx-auto max-w-6xl">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)]">{t("reviews.label")}</p>
          <h2 className="text-3xl font-bold md:text-4xl gradient-text">{t("reviews.title")}</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {reviews.map((r, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <div className="mb-2 flex gap-1 text-[var(--color-gold)]">{'*'.repeat(r.rating)}{'o'.repeat(5 - r.rating)}</div>
              <p className="mb-3 text-sm leading-relaxed text-secondary">{__(r.text)}</p>
              <p className="text-xs font-semibold text-heading">-- {r.name}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
`);
console.log('Reviews.tsx');

// --- Contact ---
writeFileSync(join(DIR,'Contact.tsx'), `// Contact
"use client";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";

export default function Contact() {
  const { t, lang } = useLanguage();
  const __ = (m) => m[lang] || m.es || "";
  return (
    <section id="contact" className="relative px-4 py-24 overflow-hidden">
      <div className="absolute inset-0 bg-section" />
      <div className="relative z-10 container mx-auto max-w-6xl">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)]">{t("contact.label")}</p>
          <h2 className="text-3xl font-bold md:text-4xl gradient-text">{t("contact.title")}</h2>
        </div>
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-6">
            <div>
              <h3 className="mb-1 text-lg font-semibold text-heading">${esc(name)}</h3>
              <p className="text-sm text-secondary">C. el Sauce, 6, Costa Adeje</p>
            </div>
            <div className="h-64 w-full overflow-hidden rounded-xl border border-white/10">
              <iframe
                src="https://www.openstreetmap.org/export/embed.html?bbox=-16.7380%2C28.1000%2C-16.7250%2C28.1100&amp;layer=mapnik&amp;marker=28.1050%2C-16.7315"
                width="100%" height="100%" style={{border:"none"}}
                referrerPolicy="unsafe-url"
                title="${esc(name)} - Ubicacion"
              />
            </div>
            <p className="text-xs text-quaternary">
              <a href="https://www.openstreetmap.org/?mlat=28.1050&mlon=-16.7315&zoom=16" target="_blank" rel="noopener noreferrer" className="text-[var(--color-gold)] hover:underline">{t("contact.view_map")}</a>
            </p>
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="mb-1 text-lg font-semibold text-heading">{t("contact.info_title")}</h3>
              <p className="text-sm leading-relaxed text-secondary">{t("contact.info_text")}</p>
            </div>
            <div className="space-y-3 text-sm text-secondary">
              <p>${esc("C. el Sauce, 6, Costa Adeje, Santa Cruz de Tenerife")}</p>
              <p>${esc("Horario: Lun-Sab 8:00-16:00 / Dom 9:00-14:00")}</p>
            </div>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <input type="text" placeholder={t("contact.form_name")} className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 transition focus:border-[var(--color-gold)] focus:outline-none" />
              <input type="email" placeholder={t("contact.form_email")} className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 transition focus:border-[var(--color-gold)] focus:outline-none" />
              <textarea rows={4} placeholder={t("contact.form_message")} className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 transition focus:border-[var(--color-gold)] focus:outline-none" />
              <button type="submit" className="w-full rounded-lg bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-gold)] px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl">{t("contact.form_submit")}</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
`);
console.log('Contact.tsx');

// --- Footer ---
writeFileSync(join(DIR,'Footer.tsx'), `// Footer
"use client";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";

export default function Footer() {
  const { t, lang } = useLanguage();
  const __ = (m) => m[lang] || m.es || "";
  return (
    <footer className="relative px-4 py-12 overflow-hidden border-t border-white/10">
      <div className="absolute inset-0 bg-section" />
      <div className="relative z-10 container mx-auto max-w-6xl">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h4 className="mb-3 text-base font-bold gradient-text-gold">${esc(nameShort)}</h4>
            <p className="max-w-xs text-sm leading-relaxed text-tertiary">{__({es: "${esc(taglineEs)}", en: "${esc(taglineEn)}"})}</p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-tertiary">{t("footer.links")}</h4>
            <div className="space-y-2 text-sm">
              <Link href="/#about" className="block text-tertiary hover:text-[var(--color-gold)] transition-colors">{t("nav.about")}</Link>
              <Link href="/#services" className="block text-tertiary hover:text-[var(--color-gold)] transition-colors">{t("nav.services")}</Link>
              <Link href="/#menu" className="block text-tertiary hover:text-[var(--color-gold)] transition-colors">{t("nav.menu")}</Link>
              <Link href="/#contact" className="block text-tertiary hover:text-[var(--color-gold)] transition-colors">{t("nav.contact")}</Link>
            </div>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-tertiary">{t("footer.contact")}</h4>
            <p className="text-sm text-tertiary">C. el Sauce, 6<br/>Costa Adeje, Santa Cruz de Tenerife</p>
            <p className="mt-3 text-xs text-quaternary">${esc("2026 Daria's Bakery & Bistro")}</p>
            <p className="mt-1 text-xs text-quaternary">{t("footer.made_with")} <a href="https://alexawebservers.com" target="_blank" rel="noopener noreferrer" className="text-[var(--color-gold)] hover:underline">alexawebservers.com</a></p>
          </div>
        </div>
      </div>
    </footer>
  );
}
`);
console.log('Footer.tsx');

// --- GeneratedPage ---
writeFileSync(join(DIR,'GeneratedPage.tsx'), `// GeneratedPage
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
`);
console.log('GeneratedPage.tsx');

console.log('All theme files written with Daria Bakery content');
