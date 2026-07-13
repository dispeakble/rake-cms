// ============================================================
//  Services — 3D Perspective Tilt + Glowing Borders + Pulse Dots
//  MAXIMUM WOW EDITION
// ============================================================

"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { useRef } from "react";
import { useLanguage } from "@/lib/i18n";

// ─── Per-site services (embedded from scraped content) ───
const SERVICES = [{"title":{"es":"Tortillas Caseras","en":"Homemade Tortillas"},"description":{"es":"Nuestras tortillas son famosas en Adeje. Tortilla de patatas, tortilla de camarones y muchas variedades más. Hechas al momento con ingredientes frescos.","en":"Our tortillas are famous in Adeje. Potato tortilla, shrimp tortilla and many more varieties. Made to order with fresh ingredients."}},{"title":{"es":"Paellas y Arroces","en":"Paella & Rice Dishes"},"description":{"es":"Paella valenciana, arroz con mariscos y arroz a banda. Preparados con ingredientes de primera calidad y el toque tradicional de la cocina española.","en":"Valencian paella, seafood rice and arroz a banda. Prepared with top-quality ingredients and the traditional touch of Spanish cuisine."}},{"title":{"es":"Carnes a la Brasa","en":"Grilled Meats"},"description":{"es":"Selección de carnes a la brasa: entrecot, pollo, cerdo y nuestras brochetas caseras. Acompañadas de patatas fritas o ensalada.","en":"Selection of grilled meats: entrecote, chicken, pork and our homemade skewers. Served with fries or salad."}},{"title":{"es":"Pescados Frescos","en":"Fresh Fish"},"description":{"es":"Pescado fresco del día, preparado a la plancha o frito. Especialidad en cherne, dorada y calamares a la romana.","en":"Fresh fish of the day, grilled or fried. Specialty in sea bream, grouper and fried squid."}},{"title":{"es":"Tapas y Raciones","en":"Tapas & Sharing Plates"},"description":{"es":"Amplia variedad de tapas: croquetas, jamón ibérico, queso manchego, chorizo al vino, patatas bravas y mucho más para compartir.","en":"Wide variety of tapas: croquettes, Iberian ham, Manchego cheese, chorizo in wine, patatas bravas and more to share."}}];

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
  const __ = (m: Record<string,string>) => m[lang] || m.es || "";
  return (
    <section id="services" className="relative px-4 py-24 overflow-hidden">
      <div className="absolute inset-0 bg-section" />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(var(--color-primary-rgb), 0.3), transparent 40%),
            radial-gradient(circle at 80% 70%, rgba(var(--color-gold-rgb), 0.2), transparent 40%),
            radial-gradient(circle at 50% 50%, rgba(var(--color-primary-rgb), 0.15), transparent 50%)
          `,
          backgroundSize: "100% 100%",
          animation: "breathe 6s ease-in-out infinite",
        }}
      />

      <div className="relative z-10 container mx-auto max-w-6xl">
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
              Restaurante Casa Adolfo
            </motion.span>
            <h2 className="text-3xl font-bold text-white md:text-4xl gradient-text">{t("services.title")}</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {SERVICES.slice(0, 6).map((svc, i) => (
              <TiltCard key={i} className="rounded-2xl p-[1px] glow-card">
                <div className="relative rounded-2xl bg-card-inner p-8 h-full">
                  <span className="mb-2 inline-block rounded bg-[var(--color-gold)]/20 px-2 py-0.5 text-xs font-medium text-[var(--color-gold)]">#{(i + 1).toString().padStart(2, "0")}</span>
                  <h3 className="mb-3 text-xl font-bold text-white">{__(svc.title)}</h3>
                  <p className="text-sm leading-relaxed text-gray-300">{__(svc.description)}</p>
                </div>
              </TiltCard>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
