// ============================================================
//  Header — Scroll-Aware Glassmorphism + Shimmer Nav Hover
//  MAXIMUM WOW EDITION
// ============================================================

"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  const bgOpacity = useTransform(scrollY, [0, 80], [0, 0.85]);
  const blurAmount = useTransform(scrollY, [0, 80], [0, 24]);
  const borderOpacity = useTransform(scrollY, [0, 80], [0, 0.15]);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 25, delay: 0.2 }}
      style={{
        backgroundColor: bgOpacity.get() === 0 ? "transparent" : undefined,
      }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <motion.div
        style={{
          backgroundColor: bgOpacity,
          backdropFilter: `blur(${blurAmount}px)`,
          WebkitBackdropFilter: `blur(${blurAmount}px)`,
          borderColor: `rgba(255,255,255,${borderOpacity})`,
        }}
        className="border-b transition-shadow duration-500"
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          {/* Logo with gradient glow */}
          <Link href="/" className="group relative">
            <span className="text-xl font-black tracking-tight text-white transition-all duration-300 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#D4A017] group-hover:to-[#F5D061]">
              Mario Viajes
            </span>
            <span className="absolute -bottom-0.5 left-0 h-[2px] w-0 bg-gradient-to-r from-[#D4A017] to-[#F5D061] transition-all duration-300 group-hover:w-full" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-8 md:flex">
            <Link href="/" className="relative text-sm font-medium text-white/70 transition-colors hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[#D4A017] after:to-[#F5D061] after:transition-all after:duration-300 hover:after:w-full">Inicio</Link>
            <Link href="/#about" className="relative text-sm font-medium text-white/70 transition-colors hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[#D4A017] after:to-[#F5D061] after:transition-all after:duration-300 hover:after:w-full">Sobre nosotros</Link>
          <Link href="/#services" className="relative text-sm font-medium text-white/70 transition-colors hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[#D4A017] after:to-[#F5D061] after:transition-all after:duration-300 hover:after:w-full">Qué ofrecemos</Link>
          <Link href="/#excursions" className="relative text-sm font-medium text-white/70 transition-colors hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[#D4A017] after:to-[#F5D061] after:transition-all after:duration-300 hover:after:w-full">Excursiones</Link>
          <Link href="/#contact" className="relative text-sm font-medium text-white/70 transition-colors hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[#D4A017] after:to-[#F5D061] after:transition-all after:duration-300 hover:after:w-full">Contacto</Link>
            <a href="https://b2b.marioviajes.com" target="_blank" rel="noopener noreferrer" className="relative text-sm font-medium text-white/70 transition-colors hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[#D4A017] after:to-[#F5D061] after:transition-all after:duration-300 hover:after:w-full">B2B</a>
            <span className="relative text-sm font-medium text-[#D4A017]">ES</span>
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
                <Link href="/" className="text-base font-medium text-white/80 transition hover:text-[#D4A017]" onClick={() => setOpen(false)}>Inicio</Link>
                <Link href="/#about" className="text-base font-medium text-white/80 transition hover:text-[#D4A017]" onClick={() => setOpen(false)}>Sobre nosotros</Link>
          <Link href="/#services" className="text-base font-medium text-white/80 transition hover:text-[#D4A017]" onClick={() => setOpen(false)}>Qué ofrecemos</Link>
          <Link href="/#excursions" className="text-base font-medium text-white/80 transition hover:text-[#D4A017]" onClick={() => setOpen(false)}>Excursiones</Link>
          <Link href="/#contact" className="text-base font-medium text-white/80 transition hover:text-[#D4A017]" onClick={() => setOpen(false)}>Contacto</Link>
                <a href="https://b2b.marioviajes.com" target="_blank" rel="noopener noreferrer" className="text-base font-medium text-white/80 transition hover:text-[#D4A017]" onClick={() => setOpen(false)}>B2B</a>
                <span className="text-base font-medium text-[#D4A017]">ES</span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
