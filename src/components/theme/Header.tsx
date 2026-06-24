// ============================================================
//  Header — Matte Glass Always On + Shimmer Nav Hover + Lang Toggle
//  MAXIMUM WOW EDITION
// ============================================================

"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langs = [{code:"es",flag:"🇪🇸",label:"ES"},{code:"en",flag:"🇬🇧",label:"EN"}];

  // Detect language from URL path on load
  const [lang, setLang] = useState(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      for (const l of langs) {
        if (path === "/" + l.code || path.startsWith("/" + l.code + "/")) return l.code;
      }
    }
    return langs[0]?.code || "es";
  });

  useEffect(() => {
    document.documentElement.setAttribute("lang", lang);
  }, [lang]);

  const switchLang = (next: string) => {
    setLang(next);
    setLangOpen(false);
    document.documentElement.setAttribute("lang", next);
    // Show/hide sections by data-lang
    document.querySelectorAll("[data-lang]").forEach(el => {
      (el as HTMLElement).style.display = el.getAttribute("data-lang") === next ? "" : "none";
    });
    // Update URL without reload
    window.history.pushState({}, "", "/" + next);
  };

  // ─── B2B Link ───
  const b2bHref = "https://b2b.marioviajes.com";

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 25, delay: 0.2 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="border-b border-white/30 bg-white/55 backdrop-blur-2xl shadow-lg shadow-black/5">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          {/* Logo with gradient glow */}
          <Link href="/" className="group relative flex items-center gap-3 cursor-pointer">
            <img src="https://marioviajes.com/images/logo2.png" alt="Mario Viajes" className="h-10 w-auto object-contain" />
            
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-8 md:flex">
            <Link href="/" className="relative text-sm font-medium text-white/70 transition-colors hover:text-white cursor-pointer after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[var(--color-gold)] after:to-[var(--color-gold-light)] after:transition-all after:duration-300 hover:after:w-full">Inicio</Link>
            <Link href="/#about" className="relative text-sm font-medium text-white/70 transition-colors hover:text-white cursor-pointer after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[var(--color-gold)] after:to-[var(--color-gold-light)] after:transition-all after:duration-300 hover:after:w-full">Sobre nosotros</Link>
          <Link href="/#services" className="relative text-sm font-medium text-white/70 transition-colors hover:text-white cursor-pointer after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[var(--color-gold)] after:to-[var(--color-gold-light)] after:transition-all after:duration-300 hover:after:w-full">Qué ofrecemos</Link>
          <Link href="/#excursions" className="relative text-sm font-medium text-white/70 transition-colors hover:text-white cursor-pointer after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[var(--color-gold)] after:to-[var(--color-gold-light)] after:transition-all after:duration-300 hover:after:w-full">Excursiones</Link>
          <Link href="/#contact" className="relative text-sm font-medium text-white/70 transition-colors hover:text-white cursor-pointer after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[var(--color-gold)] after:to-[var(--color-gold-light)] after:transition-all after:duration-300 hover:after:w-full">Contacto</Link>
            <a href="https://b2b.marioviajes.com" target="_blank" rel="noopener noreferrer" className="relative text-sm font-medium text-white/70 transition-colors hover:text-white cursor-pointer after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[var(--color-gold)] after:to-[var(--color-gold-light)] after:transition-all after:duration-300 hover:after:w-full">B2B</a>
            <a href="http://example.com" target="_blank" rel="noopener noreferrer" className="relative text-sm font-medium text-white/70 transition-colors hover:text-white cursor-pointer after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[var(--color-gold)] after:to-[var(--color-gold-light)] after:transition-all after:duration-300 hover:after:w-full">ES</a>
            <a href="https://www.directotrips.com/" target="_blank" rel="noopener noreferrer" className="relative text-sm font-medium text-white/70 transition-colors hover:text-white cursor-pointer after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[var(--color-gold)] after:to-[var(--color-gold-light)] after:transition-all after:duration-300 hover:after:w-full">excursiones.marioviajes.com.</a>
            {/* B2B external link */}
            <a href={b2bHref} target="_blank" rel="noopener noreferrer" className="relative text-sm font-medium text-white/70 transition-colors hover:text-white cursor-pointer after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[var(--color-gold)] after:to-[var(--color-gold-light)] after:transition-all after:duration-300 hover:after:w-full">B2B</a>
            <a href="/#contact" className="relative text-sm font-medium text-white/70 transition-colors hover:text-white cursor-pointer after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[var(--color-gold)] after:to-[var(--color-gold-light)] after:transition-all after:duration-300 hover:after:w-full">Contactar</a>
            {/* ─── Language Dropdown ─── */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                onBlur={() => setTimeout(() => setLangOpen(false), 200)}
                className="flex items-center gap-1 relative text-sm font-medium text-[var(--color-gold)] hover:text-[var(--color-gold-light)] transition-colors cursor-pointer bg-transparent border-none"
                style={{cursor:'pointer'}}
              >
                {lang.toUpperCase()}
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={langOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                </svg>
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-1 w-28 rounded-lg border border-white/10 bg-black/90 backdrop-blur-xl shadow-xl overflow-hidden z-50">
                  {langs.map(l => (
                    <button
                      key={l.code}
                      onClick={() => switchLang(l.code)}
                      className={`w-full px-3 py-2 text-xs font-medium text-left transition-colors hover:bg-white/10 cursor-pointer ${lang === l.code ? "text-[var(--color-gold)] bg-white/5" : "text-white/60"}`}
                      style={{cursor:'pointer'}}
                    >
                      {l.flag} {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Mobile Hamburger */}
          <button
            className="relative z-50 flex h-10 w-10 items-center justify-center text-white md:hidden cursor-pointer"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            style={{cursor:'pointer'}}
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
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0, backdropFilter: "blur(0px)" } }
            animate={{ height: "auto", opacity: 1, backdropFilter: "blur(24px)" } }
            exit={{ height: 0, opacity: 0, backdropFilter: "blur(0px)" } }
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
                <Link href="/" className="text-base font-medium text-white/80 transition hover:text-[var(--color-gold)] cursor-pointer" onClick={() => setOpen(false)}>Inicio</Link>
                <Link href="/#about" className="text-base font-medium text-white/80 transition hover:text-[var(--color-gold)] cursor-pointer" onClick={() => setOpen(false)}>Sobre nosotros</Link>
          <Link href="/#services" className="text-base font-medium text-white/80 transition hover:text-[var(--color-gold)] cursor-pointer" onClick={() => setOpen(false)}>Qué ofrecemos</Link>
          <Link href="/#excursions" className="text-base font-medium text-white/80 transition hover:text-[var(--color-gold)] cursor-pointer" onClick={() => setOpen(false)}>Excursiones</Link>
          <Link href="/#contact" className="text-base font-medium text-white/80 transition hover:text-[var(--color-gold)] cursor-pointer" onClick={() => setOpen(false)}>Contacto</Link>
                <a href="https://b2b.marioviajes.com" target="_blank" rel="noopener noreferrer" className="text-base font-medium text-white/80 transition hover:text-[var(--color-gold)] cursor-pointer" onClick={() => setOpen(false)}>B2B</a>
              <a href="http://example.com" target="_blank" rel="noopener noreferrer" className="text-base font-medium text-white/80 transition hover:text-[var(--color-gold)] cursor-pointer" onClick={() => setOpen(false)}>ES</a>
              <a href="https://www.directotrips.com/" target="_blank" rel="noopener noreferrer" className="text-base font-medium text-white/80 transition hover:text-[var(--color-gold)] cursor-pointer" onClick={() => setOpen(false)}>excursiones.marioviajes.com.</a>
                {/* B2B mobile link */}
                <a href={b2bHref} target="_blank" rel="noopener noreferrer" className="text-base font-medium text-white/80 transition hover:text-[var(--color-gold)] cursor-pointer" onClick={() => setOpen(false)} style={{cursor:'pointer'}}>B2B</a>
                <a href="/#contact" className="text-base font-medium text-white/80 transition hover:text-[var(--color-gold)] cursor-pointer" onClick={() => setOpen(false)}>Contactar</a>
                <div className="relative">
                  <button
                    onClick={() => setLangOpen(!langOpen)}
                    className="flex items-center gap-1 text-base font-medium text-[var(--color-gold)] hover:text-[var(--color-gold-light)] transition-colors bg-transparent border-none text-left cursor-pointer"
                    style={{cursor:'pointer'}}
                  >
                    {lang.toUpperCase()}
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={langOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                    </svg>
                  </button>
                  {langOpen && (
                    <div className="mt-1 w-28 rounded-lg border border-white/10 bg-black/90 backdrop-blur-xl shadow-xl overflow-hidden">
                      {langs.map(l => (
                        <button
                          key={l.code}
                          onClick={() => { switchLang(l.code); setOpen(false); }}
                          className={`w-full px-3 py-2 text-xs font-medium text-left transition-colors hover:bg-white/10 cursor-pointer ${lang === l.code ? "text-[var(--color-gold)] bg-white/5" : "text-white/60"}`}
                          style={{cursor:'pointer'}}
                        >
                          {l.flag} {l.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
