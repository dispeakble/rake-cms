// ============================================================
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
  const ABOUT_P1 = {"es":"Te garantizamos eventos, competiciones y cursos de máxima calidad.","en":"We guarantee top-quality events, competitions, and courses."};
  const ABOUT_P2 = {"es":"Precio especial para residentes","en":"Special price for residents"};
  const ABOUT_P3 = {"es":"Events Karts es una empresa que lleva más de 20 años en el mercado y se está expandiendo buscando nuevos retos.","en":"We are a fun, exciting family-owned business, and we help you develop your driving skills."};

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
              {"Karting Las Américas"}
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
              {__(ABOUT_P1)}
            </motion.p>
            <motion.p
              variants={springUp}
              className="mb-4 leading-relaxed text-gray-300"
            >
              {__(ABOUT_P2)}
            </motion.p>
            <motion.p
              variants={springUp}
              className="leading-relaxed text-gray-300"
            >
              {__(ABOUT_P3)}
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
            <motion.div
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
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
