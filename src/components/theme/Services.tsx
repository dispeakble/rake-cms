// ============================================================
//  Services — 3D Perspective Tilt + Glowing Borders + Pulse Dots
//  MAXIMUM WOW EDITION
// ============================================================

"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { useRef } from "react";
import { useLanguage } from "@/lib/i18n";

// ─── Per-site services (embedded from scraped content) ───
const SERVICES = [{"title":"Identidad de Marca","description":"Destaque con una identidad de marca coherente. Desde logotipos hasta guías de marca completas."},{"title":"Diseño Gráfico","description":"Diseños impactantes para medios impresos y digitales. Materiales de marketing que captan la atención."},{"title":"Fotografía y Video","description":"Contenido visual profesional que muestra su marca bajo la mejor luz."}];

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
              Karting Las Américas
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
