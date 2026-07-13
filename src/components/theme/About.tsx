// ============================================================
//  About — Spring Reveal + Animated Counters + Glassmorphism
//  MAXIMUM WOW EDITION
// ============================================================

"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n";

function AnimatedCounter({ end, suffix = "", decimals = 0 }: { end: number; suffix?: string; decimals?: number }) {
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
        setCount(parseFloat(current.toFixed(decimals)));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, end, decimals]);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toFixed(decimals)}{suffix}
    </span>
  );
}

export default function About() {
  const { t, lang } = useLanguage();
  const __ = (m: Record<string,string>) => m[lang] || m.es || "";
  const sectionRef = useRef<HTMLDivElement>(null);

  // ─── Per-site about content (embedded from scraped data) ───
  const ABOUT_P1 = {"es":"Restaurante Casa Adolfo es un bar-restaurante tradicional en Adeje, especializado en cocina casera española. Desde 1975 ofrecemos tortillas, paellas, carnes, pescados y tapas hechas con recetas de toda la vida.","en":"Restaurante Casa Adolfo is a traditional bar-restaurant in Adeje, specialized in Spanish home cooking. Since 1975 we offer tortillas, paella, meats, fish and tapas made with traditional recipes."};
  const ABOUT_P2 = {"es":"Nuestra especialidad son las tortillas y las paellas, pero también destacamos por nuestras carnes a la brasa y pescados frescos. Todo ello acompañado de un servicio cercano y un ambiente familiar.","en":"Our specialties are tortillas and paella, but we also excel at grilled meats and fresh fish. All served with friendly service and a family atmosphere."};
  const ABOUT_P3 = {"es":"Ven a disfrutar de nuestra terraza en Calle La Cruz y descubre por qué nuestros clientes nos eligen desde hace generaciones. Calidad-precio inmejorable y el sabor de siempre.","en":"Come enjoy our terrace on Calle La Cruz and discover why our customers have chosen us for generations. Great value for money and the taste you remember."};

  const stats = [
    { value: 446, label: { es: "Opiniones en Google", en: "Google reviews" }, suffix: "+", decimals: 0 },
    { value: 49, label: { es: "Años de tradición", en: "Years of tradition" }, suffix: "", decimals: 0 },
    { value: 45, label: { es: "Puntuación", en: "Rating" }, suffix: "/5", decimals: 1, divider: 10 },
  ];

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
      <div className="absolute inset-0 bg-section opacity-90" />
      <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, rgba(var(--color-gold-rgb), 0.05), transparent 50%)" }} />

      <div className="relative z-10 container mx-auto max-w-6xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid items-center gap-12 md:grid-cols-2"
        >
          <div>
            <motion.span
              variants={springUp}
              className="mb-4 block text-xs uppercase tracking-[0.3em] text-[var(--color-gold)]/80"
            >
              {"Restaurante Casa Adolfo"}
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

            <motion.div
              variants={springUp}
              className="mt-8 grid grid-cols-3 gap-4"
            >
              {stats.map((stat) => (
                <div
                  key={stat.label.en}
                  className="rounded-xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-sm"
                >
                  <div className="text-2xl font-black text-[var(--color-gold)]">
                    {stat.value === 45 ? (
                      <span className="tabular-nums">4.5/5</span>
                    ) : (
                      <AnimatedCounter end={stat.value} suffix={stat.suffix} decimals={stat.decimals} />
                    )}
                  </div>
                  <div className="mt-1 text-xs text-gray-400">{__(stat.label)}</div>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            variants={springUp}
          >
            <motion.div
              className="relative overflow-hidden rounded-2xl"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-[var(--color-gold)]/20 via-[var(--color-primary)]/20 to-[var(--color-gold)]/20 rounded-2xl animate-[spin-slow_8s_linear_infinite] blur-2xl" />
              <div className="relative overflow-hidden rounded-2xl">
                <img src="/media/scraped/generated/about.svg" alt="Restaurante Casa Adolfo" className="h-full w-full object-cover" />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
