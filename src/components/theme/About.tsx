// ============================================================
//  About — Spring Reveal + Animated Counters + Glassmorphism
//  MAXIMUM WOW EDITION
// ============================================================

"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n";

function AnimatedCounterWithDecimal({ end, suffix = "", decimals = 0 }: { end: number; suffix?: string; decimals?: number }) {
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
  const ABOUT_P1 = {"es":"Daria's Bakery & Bistro | Breakfast & Lunch is a beloved dining destination. We take pride in serving fresh, flavorful dishes made with locally sourced ingredients. Our welcoming atmosphere and friendly staff make every visit special.","en":"Daria's Bakery & Bistro | Breakfast & Lunch is a beloved dining destination. We take pride in serving fresh, flavorful dishes made with locally sourced ingredients. Our welcoming atmosphere and friendly staff make every visit special."};
  const ABOUT_P2 = {"es":"Whether you're joining us for a casual lunch, romantic dinner, or special celebration, our team is here to make your experience unforgettable.","en":"Whether you're joining us for a casual lunch, romantic dinner, or special celebration, our team is here to make your experience unforgettable."};
  const ABOUT_P3 = {"es":"","en":""};

  // ─── Stats ───
  
  const stats = [
    { value: 500, label: { es: "Clientes satisfechos", en: "Happy clients" }, suffix: "+", decimals: 0 },
    { value: 15, label: { es: "Años de experiencia", en: "Years experience" }, suffix: "+", decimals: 0 },
    { value: 99, label: { es: "Satisfacción", en: "Satisfaction" }, suffix: "%", decimals: 0 },
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
              {"About Daria&#x27;s Bakery &amp; Bistro | Breakfast &amp; Lunch"}
            </motion.span>
            <motion.h2
              variants={springUp}
              className="mb-6 text-3xl font-bold md:text-4xl gradient-text"
            >
              {t("about.title")}
            </motion.h2>
            <motion.p
              variants={springUp}
              className="mb-4 leading-relaxed text-secondary"
            >
              {__(ABOUT_P1)}
            </motion.p>
            <motion.p
              variants={springUp}
              className="mb-4 leading-relaxed text-secondary"
            >
              {__(ABOUT_P2)}
            </motion.p>
            <motion.p
              variants={springUp}
              className="leading-relaxed text-secondary"
            >
              {__(ABOUT_P3)}
            </motion.p>

            {/* ── 2. Animated Counter Stats ── */}
            <motion.div
              variants={springUp}
              className="mt-8 grid grid-cols-3 gap-4"
            >
              {stats.map((stat) => (
                <div
                  key={typeof stat.label === 'string' ? stat.label : stat.label.en}
                  className="rounded-xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-sm"
                >
                  <div className="text-2xl font-black text-[var(--color-gold)]">
                    {stat.decimals === 1 ? (
                      <span className="tabular-nums">{(stat.value / ((stat as any).divider || 1)).toFixed(1)}{stat.suffix}</span>
                    ) : (
                      <AnimatedCounterWithDecimal end={stat.value} suffix={stat.suffix} decimals={stat.decimals || 0} />
                    )}
                  </div>
                  <div className="mt-1 text-xs text-tertiary">{typeof stat.label === 'string' ? stat.label : __(stat.label)}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Image with Rotating Glow */}
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
                <img src="/media/scraped/unsplash-1783965197068-keyufb.svg" alt="About Daria&#x27;s Bakery &amp; Bistro | Breakfast &amp; Lunch" className="h-full w-full object-cover" />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
