// ============================================================
//  Hero — Carousel with Auto-Rotation + Prev/Next + Parallax
//  PROPER SIZE EDITION (no full screen)
// ============================================================

"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/lib/i18n";

export default function Hero() {
  const { t, lang } = useLanguage();
  const __ = (m: Record<string,string>) => m[lang] || m.es || "";
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);

  // ─── Per-site content (embedded from scraped data) ───
  const TAGLINE = { es: "Restaurante Casa Adolfo — Cocina casera tradicional en Adeje desde 1975. Tortillas, paellas, carnes y pescados hechos con amor.", en: "Restaurante Casa Adolfo — Traditional home cooking in Adeje since 1975. Tortillas, paella, meats and fish made with love." };
  const HERO_SUBTITLE = { es: "Bienvenido a Restaurante Casa Adolfo", en: "Welcome to Restaurante Casa Adolfo" };

  // ─── Carousel State ───
  const slides = ["/media/scraped/generated/slide1.svg","/media/scraped/generated/slide2.svg","/media/scraped/generated/slide3.svg"];
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Auto-rotation every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => nextSlide(), 6000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 },
    },
  };

  const childVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
  };

  return (
    <section
      ref={ref}
      className="relative flex h-[75vh] min-h-[500px] items-center justify-center overflow-hidden px-4"
    >
      {/* ── Carousel Slides ── */}
      <AnimatePresence custom={direction} mode="wait">
        <motion.div
          key={current}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${slides[current]})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/45" />
        </motion.div>
      </AnimatePresence>

      {/* ── Warm Overlay ── */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, var(--color-primary) 0%, transparent 40%, transparent 60%, var(--color-primary) 100%)",
        }}
      />

      {/* ── Floating Glow Particles ── */}
      <motion.div
        className="absolute top-[15%] left-[10%] h-3 w-3 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(var(--color-gold-rgb), 0.6), transparent)" }}
        animate={{ y: [0, -25, 0], x: [0, 12, 0], opacity: [0.3, 0.8, 0.3] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[25%] right-[18%] h-4 w-4 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(var(--color-gold-rgb), 0.5), transparent)" }}
        animate={{ y: [0, -20, 0], x: [0, -8, 0], opacity: [0.2, 0.7, 0.2] }}
        transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.5 }}
      />
      <motion.div
        className="absolute bottom-[25%] left-[20%] h-2 w-2 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(var(--color-gold-rgb), 0.7), transparent)" }}
        animate={{ y: [0, -18, 0], x: [0, -10, 0], opacity: [0.4, 0.9, 0.4] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 1 }}
      />

      {/* ── Carousel Prev / Next Buttons ── */}
      <button
        onClick={prevSlide}
        className="absolute left-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md border border-white/20 transition-all duration-300 hover:bg-white/20 hover:border-[var(--color-gold)]/50 hover:scale-110"
        aria-label="Previous slide"
        style={{cursor:'pointer'}}
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md border border-white/20 transition-all duration-300 hover:bg-white/20 hover:border-[var(--color-gold)]/50 hover:scale-110"
        aria-label="Next slide"
        style={{cursor:'pointer'}}
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* ── Slide Indicators ── */}
      <div className="absolute bottom-20 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
            className={`h-2 rounded-full transition-all duration-300 ${i === current ? "w-6 bg-[var(--color-gold)]" : "w-2 bg-white/40"}`}
            aria-label={`Go to slide ${i + 1}`}
            style={{cursor:'pointer'}}
          />
        ))}
      </div>

      {/* ── Content ── */}
      <motion.div
        className="relative z-10 mx-auto max-w-4xl text-center text-white px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Subtitle badge */}
        <motion.div
          variants={childVariants}
          className="mb-4 inline-block"
        >
          <span className="inline-block rounded-full border border-[var(--color-gold)]/30 bg-[var(--color-gold)]/10 px-5 py-1.5 text-xs uppercase tracking-[0.3em] text-[var(--color-gold)] backdrop-blur-sm">
            {__(HERO_SUBTITLE) || __(TAGLINE)}
          </span>
        </motion.div>

        {/* ── Main Heading ── */}
        <motion.h1
          variants={childVariants}
          className="mb-4 text-4xl font-black tracking-tight md:text-5xl lg:text-6xl leading-tight"
        >
          {__(TAGLINE)}
        </motion.h1>

        {/* ── Subtitle ── */}
        <motion.p
          variants={childVariants}
          className="mx-auto mb-8 max-w-2xl text-base text-white/70 md:text-lg"
        >
          {__({"es":"Te garantizamos tortillas, paellas y cocina casera tradicional. Calidad-precio inmejorable en Adeje.","en":"We guarantee traditional homemade tortillas, paella and home cooking. Great value for money in Adeje."})}
        </motion.p>

        {/* ── Two CTA Buttons ── */}
        <motion.div
          variants={childVariants}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            href="/#services"
            className="shimmer-btn shimmer-btn-gold relative inline-flex items-center rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] px-8 py-3.5 font-bold text-white shadow-[0_0_20px_rgba(var(--color-gold-rgb), 0.3)] transition-all duration-300 hover:shadow-[0_0_40px_rgba(var(--color-gold-rgb), 0.5)] hover:scale-105 active:scale-95 cursor-pointer text-sm"
          >
            <span className="relative z-10">{t("hero.cta_services")}</span>
          </Link>
          <Link
            href="/#contact"
            className="shimmer-btn relative inline-flex items-center rounded-xl border-2 border-white/30 px-8 py-3.5 font-bold text-white transition-all duration-300 hover:border-[var(--color-gold)] hover:bg-[var(--color-gold)]/10 hover:shadow-[0_0_30px_rgba(var(--color-gold-rgb), 0.3)] hover:scale-105 active:scale-95 cursor-pointer text-sm"
          >
            <span className="relative z-10">{t("hero.cta_contact")}</span>
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-4 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      >
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/30">{t("hero.scroll")}</span>
          <div className="h-6 w-[1px] bg-gradient-to-b from-[var(--color-gold)] to-transparent" />
        </div>
      </motion.div>
    </section>
  );
}
