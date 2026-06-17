"use client";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Parallax Background */}
      <motion.div style={{ y }} className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/media/scraped/hero-bg.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--theme-accent)]/70 via-[var(--theme-accent)]/50 to-[var(--theme-dark)]" />
      </motion.div>

      {/* Decorative elements */}
      <div className="absolute left-10 top-1/4 h-64 w-64 animate-float rounded-full border border-[var(--theme-secondary)]/20" />
      <div className="absolute right-20 bottom-1/4 h-40 w-40 animate-float-delayed rounded-full border border-white/10" />
      <div className="absolute left-1/3 top-1/3 h-2 w-2 animate-pulse-glow rounded-full bg-[var(--theme-secondary)]" />
      <div className="absolute right-1/4 top-1/2 h-1 w-1 animate-pulse-glow rounded-full bg-[var(--theme-primary)]" />

      {/* Floating text elements */}
      <motion.div
        animate={{ rotate: [0, 5, 0, -5, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute right-[15%] top-[20%] hidden text-7xl font-black text-white/5 md:block"
      >
        RODIZIO
      </motion.div>
      <motion.div
        animate={{ rotate: [0, -5, 0, 5, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute left-[10%] bottom-[25%] hidden text-6xl font-black text-white/5 md:block"
      >
        GRILL
      </motion.div>

      {/* Main Content */}
      <motion.div style={{ opacity }} className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-4"
        >
          <span className="inline-block rounded-full border border-[var(--theme-secondary)]/40 px-5 py-1.5 text-xs uppercase tracking-[0.3em] text-[var(--theme-secondary)]">
            Desde 2010 en Tenerife
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-6 text-5xl font-black leading-tight tracking-tight text-white md:text-7xl lg:text-8xl"
        >
          Carne sin fin,
          <br />
          <span className="bg-gradient-to-r from-[var(--theme-secondary)] via-amber-300 to-[var(--theme-secondary)] bg-clip-text text-transparent">
            sabor sin límite
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mx-auto mb-12 max-w-2xl text-lg text-white/70 md:text-xl"
        >
          Descubre el auténtico rodizio brasileño en Tenerife. Dos ubicaciones, una experiencia inolvidable.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            href="/contacto"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-[var(--theme-secondary)] px-10 py-4 text-base font-bold text-[var(--theme-accent)] transition-all hover:shadow-2xl hover:shadow-[var(--theme-secondary)]/40"
          >
            <span className="relative z-10">Reservar Ahora</span>
            <span className="relative z-10">→</span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0"
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </Link>

          <Link
            href="/carta"
            className="group inline-flex items-center gap-2 rounded-full border-2 border-white/30 px-10 py-4 text-base font-semibold text-white transition-all hover:border-white/60 hover:bg-white/10"
          >
            Ver Carta
            <span className="transition group-hover:translate-x-1">→</span>
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-20 grid grid-cols-3 gap-8 border-t border-white/10 pt-12"
        >
          {[
            { value: "2", label: "Ubicaciones" },
            { value: "15+", label: "Años de tradición" },
            { value: "∞", label: "Carne sin fin" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl font-black text-[var(--theme-secondary)] md:text-5xl">
                {stat.value}
              </div>
              <div className="mt-1 text-xs uppercase tracking-widest text-white/50">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-xs uppercase tracking-[0.2em] text-white/30">Descubre</span>
          <div className="h-10 w-[1px] bg-gradient-to-b from-white/50 to-transparent" />
        </motion.div>
      </motion.div>
    </section>
  );
}
