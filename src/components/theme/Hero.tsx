// ============================================================
//  Hero — Animated Gradient Mesh + Floating Particles + Shimmer CTAs
//  MAXIMUM WOW EDITION
// ============================================================

"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0.2]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.4 },
    },
  };

  const childVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
  };

  return (
    <section
      ref={ref}
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4"
      style={{ backgroundImage: 'url(/media/scraped/website-1781712351449-tytfhj.jpeg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      {/* ── 1. Animated Mesh/Gradient Background ── */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background: "linear-gradient(135deg, #8B1A1A 0%, #D4A017 25%, #1a0a0a 50%, #8B1A1A 75%, #D4A017 100%)",
          backgroundSize: "400% 400%",
          animation: "gradient 8s ease infinite",
        }}
      />

      {/* ── 2. Floating Glow Particles / Embers (6+ circles) ── */}
      <motion.div
        className="absolute top-[15%] left-[10%] h-4 w-4 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(212,160,23,0.8), transparent)" }}
        animate={{ y: [0, -30, 0], x: [0, 15, 0], opacity: [0.4, 1, 0.4] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[25%] right-[15%] h-6 w-6 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(212,160,23,0.6), transparent)" }}
        animate={{ y: [0, -25, 0], x: [0, -10, 0], opacity: [0.3, 0.8, 0.3] }}
        transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.5 }}
      />
      <motion.div
        className="absolute bottom-[30%] left-[20%] h-3 w-3 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(139,26,26,0.8), transparent)" }}
        animate={{ y: [0, -20, 0], x: [0, -12, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute bottom-[20%] right-[25%] h-5 w-5 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(245,208,97,0.7), transparent)" }}
        animate={{ y: [0, -35, 0], x: [0, 8, 0], opacity: [0.2, 0.9, 0.2] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 0.2 }}
      />
      <motion.div
        className="absolute top-[40%] left-[40%] h-8 w-8 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(212,160,23,0.5), transparent)" }}
        animate={{ y: [0, -15, 0], x: [0, 20, 0], opacity: [0.1, 0.6, 0.1] }}
        transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1.5 }}
      />
      <motion.div
        className="absolute top-[60%] right-[10%] h-3 w-3 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(139,26,26,0.9), transparent)" }}
        animate={{ y: [0, -22, 0], x: [0, -5, 0], opacity: [0.3, 0.7, 0.3] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.8 }}
      />

      {/* ── 7. Decorative Radial Gradient Overlay (pulsing) ── */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(212,160,23,0.12), transparent 60%)",
        }}
        animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
      />

      {/* ── Parallax Background Layer ── */}
      <motion.div
        className="absolute inset-0 bg-black/50"
        style={{ y, opacity }}
      />

      {/* ── Content ── */}
      <motion.div
        className="relative z-10 mx-auto max-w-4xl text-center text-white"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Subtitle badge */}
        <motion.div
          variants={childVariants}
          className="mb-6 inline-block"
        >
          <span className="inline-block rounded-full border border-[#D4A017]/30 bg-[#D4A017]/10 px-6 py-2 text-xs uppercase tracking-[0.3em] text-[#D4A017] backdrop-blur-sm">
            ✦ Brazilian Rodizio ✦
          </span>
        </motion.div>

        {/* ── 3. Animated Gradient Text on Tagline ── */}
        <motion.h1
          variants={childVariants}
          className="mb-6 text-5xl font-black tracking-tight md:text-7xl lg:text-8xl"
        >
          CARNE SIN FIN,
          <br />
          <span className="gradient-text-gold inline-block">
            SABOR SIN LÍMITE
          </span>
        </motion.h1>

        {/* ── 4. Typewriter / Staggered Subtitle ── */}
        <motion.p
          variants={childVariants}
          className="mx-auto mb-12 max-w-2xl text-lg text-white/70 md:text-xl"
        >
          {"Vacaciones que mereces, experiencias que recordarás".split("").map((char, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.015, duration: 0.3 }}
              className="inline-block"
            >
              {char === " " ? " " : char}
            </motion.span>
          ))}
        </motion.p>

        {/* ── 5. Two Shimmer CTA Buttons ── */}
        <motion.div
          variants={childVariants}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            href="/#menu"
            className="shimmer-btn shimmer-btn-gold relative inline-flex items-center rounded-xl bg-gradient-to-r from-[#8B1A1A] to-[#D4A017] px-10 py-4 font-bold text-white shadow-[0_0_20px_rgba(212,160,23,0.3)] transition-all duration-300 hover:shadow-[0_0_40px_rgba(212,160,23,0.5)] hover:scale-105 active:scale-95"
          >
            <span className="relative z-10">Explore Menu &amp; Prices</span>
          </Link>
          <Link
            href="/#contact"
            className="shimmer-btn relative inline-flex items-center rounded-xl border-2 border-white/30 px-10 py-4 font-bold text-white transition-all duration-300 hover:border-[#D4A017] hover:bg-[#D4A017]/10 hover:shadow-[0_0_30px_rgba(212,160,23,0.3)] hover:scale-105 active:scale-95"
          >
            <span className="relative z-10">Reserve Your Table</span>
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs uppercase tracking-[0.2em] text-white/30">Scroll</span>
          <div className="h-8 w-[1px] bg-gradient-to-b from-[#D4A017] to-transparent" />
        </div>
      </motion.div>
    </section>
  );
}
