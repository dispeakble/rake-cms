// ============================================================
//  Header — Matte Glass Always On + Shimmer Nav Hover + Lang Toggle
//  MAXIMUM WOW EDITION
// ============================================================

"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { useTheme } from "@/components/theme/ThemeProvider";

export default function Header() {
  const { lang, switchLang, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langs: {code: Lang; flag: string; label: string}[] = [{code:"es" as Lang,flag:"🇪🇸",label:"ES"},{code:"en" as Lang,flag:"🇬🇧",label:"EN"}];

  const doSwitchLang = (next: Lang) => {
    setLangOpen(false);
    switchLang(next);
  };

  const navLinkClass = "relative text-sm font-medium text-white/70 transition-colors hover:text-white cursor-pointer after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[var(--color-gold)] after:to-[var(--color-gold-light)] after:transition-all after:duration-300 hover:after:w-full";
  const mobileLinkClass = "text-base font-medium text-white/80 transition hover:text-[var(--color-gold)] cursor-pointer";

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
            <Link href="/" className={navLinkClass}>{t("nav.home")}</Link>
            <Link href="/#about" className={navLinkClass}>Sobre nosotros</Link>
            <Link href="/#services" className={navLinkClass}>Qué ofrecemos</Link>
            <Link href="/#excursions" className={navLinkClass}>Excursiones</Link>
            <Link href="/#contact" className={navLinkClass}>Contactar</Link>
            <a href="https://b2b.marioviajes.com" target="_blank" rel="noopener noreferrer" className={navLinkClass}>B2B</a>
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
                      onClick={() => doSwitchLang(l.code)}
                      className={`w-full px-3 py-2 text-xs font-medium text-left transition-colors hover:bg-white/10 cursor-pointer ${lang === l.code ? "text-[var(--color-gold)] bg-white/5" : "text-white/60"}`}
                      style={{cursor:'pointer'}}
                    >
                      {l.flag} {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* ── Theme Toggle ── */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 hover:bg-white/10 cursor-pointer bg-transparent border-none"
              style={{cursor:'pointer'}}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <svg className="w-4 h-4 text-[var(--color-gold)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-[var(--color-gold)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
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
                <Link href="/" className={mobileLinkClass} onClick={() => setOpen(false)}>{t("nav.home")}</Link>
                <Link href="/#about" className={mobileLinkClass} onClick={() => setOpen(false)}>Sobre nosotros</Link>
                <Link href="/#services" className={mobileLinkClass} onClick={() => setOpen(false)}>Qué ofrecemos</Link>
                <Link href="/#excursions" className={mobileLinkClass} onClick={() => setOpen(false)}>Excursiones</Link>
                <Link href="/#contact" className={mobileLinkClass} onClick={() => setOpen(false)}>Contactar</Link>
                <a href="https://b2b.marioviajes.com" target="_blank" rel="noopener noreferrer" className={mobileLinkClass} onClick={() => setOpen(false)}>B2B</a>
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
                          onClick={() => { doSwitchLang(l.code); setOpen(false); }}
                          className={`w-full px-3 py-2 text-xs font-medium text-left transition-colors hover:bg-white/10 cursor-pointer ${lang === l.code ? "text-[var(--color-gold)] bg-white/5" : "text-white/60"}`}
                          style={{cursor:'pointer'}}
                        >
                          {l.flag} {l.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {/* Mobile Theme Toggle */}
                <button
                  onClick={() => { toggleTheme(); setOpen(false); }}
                  className="flex items-center gap-2 text-base font-medium cursor-pointer bg-transparent border-none text-left"
                  style={{cursor:'pointer'}}
                >
                  <span className="text-[var(--color-gold)]">
                    {theme === 'dark' ? '☀️' : '🌙'}
                  </span>
                  <span className="text-white/80">
                    {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
                  </span>
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
