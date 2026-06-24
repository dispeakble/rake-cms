// ============================================================
//  Header — Matte Glass Always On + Shimmer Nav Hover + Lang Toggle
//  MAXIMUM WOW EDITION
// ============================================================

"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState("es");
  const { scrollY } = useScroll();

  // Always-on glass background — useTransform produces full CSS values directly
  // (never interpolate MotionValues into template literals — they become "[object Object]")
  const bgColorValue = useTransform(scrollY, [0, 80], ["rgba(0,0,0,0.7)", "rgba(0,0,0,0.9)"]);
  const backdropFilterValue = useTransform(scrollY, [0, 80], ["blur(12px)", "blur(24px)"]);
  const borderColorValue = useTransform(scrollY, [0, 80], ["rgba(255,255,255,0.08)", "rgba(255,255,255,0.15)"]);

  useEffect(() => {
    document.documentElement.setAttribute("lang", lang);
  }, [lang]);

  const toggleLang = () => {
    const next = lang === "es" ? "en" : "es";
    setLang(next);
  };

  return (
    <motion.header
      initial={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 25, delay: 0.2 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <motion.div
        style={{
          backgroundColor: bgColorValue,
          backdropFilter: backdropFilterValue,
          WebkitBackdropFilter: backdropFilterValue,
          borderColor: borderColorValue,
        }}
        className="border-b border-white/10 shadow-lg shadow-black/20 transition-shadow duration-500"
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          {/* Logo with gradient glow */}
          <Link href="/" className="group relative">
            <span className="text-xl font-black tracking-tight text-white transition-all duration-300 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[var(--color-gold)] group-hover:to-[var(--color-gold-light)]">
              Mario Viajes, Tenerife
            </span>
            <span className="absolute -bottom-0.5 left-0 h-[2px] w-0 bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-light)] transition-all duration-300 group-hover:w-full" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-8 md:flex">
            <Link href="/" className="relative text-sm font-medium text-white/70 transition-colors hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[var(--color-gold)] after:to-[var(--color-gold-light)] after:transition-all after:duration-300 hover:after:w-full">Inicio</Link>
            <Link href="/#about" className="relative text-sm font-medium text-white/70 transition-colors hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[var(--color-gold)] after:to-[var(--color-gold-light)] after:transition-all after:duration-300 hover:after:w-full">Sobre nosotros</Link>
            <Link href="/#services" className="relative text-sm font-medium text-white/70 transition-colors hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[var(--color-gold)] after:to-[var(--color-gold-light)] after:transition-all after:duration-300 hover:after:w-full">Qué ofrecemos</Link>
            <Link href="/#excursions" className="relative text-sm font-medium text-white/70 transition-colors hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[var(--color-gold)] after:to-[var(--color-gold-light)] after:transition-all after:duration-300 hover:after:w-full">Excursiones</Link>
            <Link href="/#contact" className="relative text-sm font-medium text-white/70 transition-colors hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[var(--color-gold)] after:to-[var(--color-gold-light)] after:transition-all after:duration-300 hover:after:w-full">Contacto</Link>
            <a href="/#contact" className="relative text-sm font-medium text-white/70 transition-colors hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[var(--color-gold)] after:to-[var(--color-gold-light)] after:transition-all after:duration-300 hover:after:w-full">Contactar</a>
            <button
              onClick={toggleLang}
              className="relative text-sm font-medium text-[var(--color-gold)] hover:text-[var(--color-gold-light)] transition-colors cursor-pointer bg-transparent border-none"
            >
              {lang === "es" ? "EN" : "ES"}
            </button>
          </nav>

          {/* Mobile Hamburger */}
          <button
            className="relative z-50 flex h-10 w-10 items-center justify-center text-white md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <motion.span
              animate={open ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              className="absolute h-[2px] w-6 bg-white rounded-full"
            />
            <motion.span
              animate={open ? { opacity: 0 } : { opacity: 1 }}
              className="absolute h-[2px] w-6 bg-white rounded-full"
            />
            <motion.span
              animate={open ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
              className="absolute h-[2px] w-6 bg-white rounded-full"
            />
          </button>
        </div>
      </motion.div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ height: "auto", opacity: 1, backdropFilter: "blur(24px)" }}
            exit={{ height: 0, opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.35 }}
            className="overflow-hidden border-b border-white/10 bg-black/90 backdrop-blur-2xl"
          >
            <div className="flex flex-col gap-4 px-4 py-8">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.06 } },
                }}
                className="flex flex-col gap-4"
              >
                <Link href="/" className="text-base font-medium text-white/80 transition hover:text-[var(--color-gold)]" onClick={() => setOpen(false)}>Inicio</Link>
                <Link href="/#about" className="text-base font-medium text-white/80 transition hover:text-[var(--color-gold)]" onClick={() => setOpen(false)}>Sobre nosotros</Link>
                <Link href="/#services" className="text-base font-medium text-white/80 transition hover:text-[var(--color-gold)]" onClick={() => setOpen(false)}>Qué ofrecemos</Link>
                <Link href="/#excursions" className="text-base font-medium text-white/80 transition hover:text-[var(--color-gold)]" onClick={() => setOpen(false)}>Excursiones</Link>
                <Link href="/#contact" className="text-base font-medium text-white/80 transition hover:text-[var(--color-gold)]" onClick={() => setOpen(false)}>Contacto</Link>
                <a href="/#contact" className="text-base font-medium text-white/80 transition hover:text-[var(--color-gold)]" onClick={() => setOpen(false)}>Contactar</a>
                <button
                  onClick={() => { toggleLang(); setOpen(false); }}
                  className="text-base font-medium text-[var(--color-gold)] cursor-pointer hover:text-[var(--color-gold-light)] transition-colors bg-transparent border-none text-left"
                >
                  {lang === "es" ? "EN" : "ES"}
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
