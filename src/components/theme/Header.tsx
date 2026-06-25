// ============================================================
	  //  Header — Matte Glass Always On + Shimmer Nav Hover + Lang Toggle
	  //  MAXIMUM WOW EDITION
	  // ============================================================

	  "use client";

	  import Link from "next/link";
	  import { useState } from "react";
	  import { motion, AnimatePresence } from "framer-motion";
	  import { useLanguage } from "@/lib/i18n";
	  import { useTheme } from "@/components/theme/ThemeProvider";
	  import type { Lang } from "@/lib/i18n";

	  export default function Header() {
	    const { lang, switchLang, t } = useLanguage();
	    const { theme, toggleTheme } = useTheme();
	    const [open, setOpen] = useState(false);
	    const [langOpen, setLangOpen] = useState(false);
	    const langs = [{code:"en",flag:"🇬🇧",label:"EN"},{code:"es",flag:"🇪🇸",label:"ES"}];

	    const doSwitchLang = (next: Lang) => {
	      setLangOpen(false);
	      switchLang(next);
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
      <div className="border-b border-white/30 bg-header backdrop-blur-2xl shadow-lg shadow-black/5">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          {/* Logo with gradient glow */}
          <Link href="/" className="group relative flex items-center gap-3 cursor-pointer">
            <img src="https://www.kartingamericas.com/wp-content/uploads/2024/09/cropped-logo-las-americas.png" alt="Karting Las Américas" className="h-10 w-auto object-contain" style={{minWidth:'120px'}} />
            
          </Link>

          {/* ── Spacer between logo and menu ── */}
          <div className="shrink-0" style={{width:'calc(var(--spacing)*8)'}} />

          {/* ── Desktop Nav with text-shadow ── */}
          <nav className="hidden items-center gap-8 md:flex" style={{textShadow:'1px 1px 3px rgba(0,0,0,0.5)'}}>
            <Link href="/" className="relative text-sm font-medium text-white/70 transition-colors hover:text-white cursor-pointer after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[var(--color-gold)] after:to-[var(--color-gold-light)] after:transition-all after:duration-300 hover:after:w-full">{t("nav.home")}</Link>
            <Link href="/#about" className="relative text-sm font-medium text-white/70 transition-colors hover:text-white cursor-pointer after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[var(--color-gold)] after:to-[var(--color-gold-light)] after:transition-all after:duration-300 hover:after:w-full">{t("nav.about")}</Link>
          <Link href="/#services" className="relative text-sm font-medium text-white/70 transition-colors hover:text-white cursor-pointer after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[var(--color-gold)] after:to-[var(--color-gold-light)] after:transition-all after:duration-300 hover:after:w-full">{t("nav.services")}</Link>
            <a href="https://www.kartingamericas.com" target="_blank" rel="noopener noreferrer" className="relative text-sm font-medium text-white/70 transition-colors hover:text-white cursor-pointer after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[var(--color-gold)] after:to-[var(--color-gold-light)] after:transition-all after:duration-300 hover:after:w-full">Circuitos Kart</a>
            <a href="https://www.kartingamericas.com/empresas/" target="_blank" rel="noopener noreferrer" className="relative text-sm font-medium text-white/70 transition-colors hover:text-white cursor-pointer after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[var(--color-gold)] after:to-[var(--color-gold-light)] after:transition-all after:duration-300 hover:after:w-full">Empresa</a>
            <a href="https://www.kartingamericas.com/karts/" target="_blank" rel="noopener noreferrer" className="relative text-sm font-medium text-white/70 transition-colors hover:text-white cursor-pointer after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[var(--color-gold)] after:to-[var(--color-gold-light)] after:transition-all after:duration-300 hover:after:w-full">Karts</a>
            <a href="https://www.kartingamericas.com/carreras/" target="_blank" rel="noopener noreferrer" className="relative text-sm font-medium text-white/70 transition-colors hover:text-white cursor-pointer after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[var(--color-gold)] after:to-[var(--color-gold-light)] after:transition-all after:duration-300 hover:after:w-full">Carreras</a>
            <a href="https://www.kartingamericas.com/tienda/" target="_blank" rel="noopener noreferrer" className="relative text-sm font-medium text-white/70 transition-colors hover:text-white cursor-pointer after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[var(--color-gold)] after:to-[var(--color-gold-light)] after:transition-all after:duration-300 hover:after:w-full">Tienda</a>
            <a href="https://www.kartingamericas.com/preguntas-frecuentes/" target="_blank" rel="noopener noreferrer" className="relative text-sm font-medium text-white/70 transition-colors hover:text-white cursor-pointer after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[var(--color-gold)] after:to-[var(--color-gold-light)] after:transition-all after:duration-300 hover:after:w-full">FAQS</a>
            <a href="https://www.kartingamericas.com/finalizar-compra/" target="_blank" rel="noopener noreferrer" className="relative text-sm font-medium text-white/70 transition-colors hover:text-white cursor-pointer after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[var(--color-gold)] after:to-[var(--color-gold-light)] after:transition-all after:duration-300 hover:after:w-full">0</a>
            <a href="https://www.kartingamericas.com/wp-content/uploads/2026/03/tarifa-de-precios-CAST-scaled.png" target="_blank" rel="noopener noreferrer" className="relative text-sm font-medium text-white/70 transition-colors hover:text-white cursor-pointer after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[var(--color-gold)] after:to-[var(--color-gold-light)] after:transition-all after:duration-300 hover:after:w-full">Tarifas</a>
            <a href="https://www.kartingamericas.com/producto/dia-del-kartista-miercoles-a-viernes/" target="_blank" rel="noopener noreferrer" className="relative text-sm font-medium text-white/70 transition-colors hover:text-white cursor-pointer after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[var(--color-gold)] after:to-[var(--color-gold-light)] after:transition-all after:duration-300 hover:after:w-full">Comprar tanda</a>
            <a href="https://www.kartingamericas.com/" target="_blank" rel="noopener noreferrer" className="relative text-sm font-medium text-white/70 transition-colors hover:text-white cursor-pointer after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[var(--color-gold)] after:to-[var(--color-gold-light)] after:transition-all after:duration-300 hover:after:w-full">Karting Las Américas</a>
            <a href="https://www.kartingcardedeu.com/" target="_blank" rel="noopener noreferrer" className="relative text-sm font-medium text-white/70 transition-colors hover:text-white cursor-pointer after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[var(--color-gold)] after:to-[var(--color-gold-light)] after:transition-all after:duration-300 hover:after:w-full">Karting cardedeu</a>
            <a href="https://www.kartingempuriabrava.com/" target="_blank" rel="noopener noreferrer" className="relative text-sm font-medium text-white/70 transition-colors hover:text-white cursor-pointer after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[var(--color-gold)] after:to-[var(--color-gold-light)] after:transition-all after:duration-300 hover:after:w-full">Karting Empuriabrava</a>
            <a href="http://kartingpinomontano.com" target="_blank" rel="noopener noreferrer" className="relative text-sm font-medium text-white/70 transition-colors hover:text-white cursor-pointer after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[var(--color-gold)] after:to-[var(--color-gold-light)] after:transition-all after:duration-300 hover:after:w-full">Karting Pino Montano</a>
            <a href="https://www.kartingamericas.com/sodikart-sr4/" target="_blank" rel="noopener noreferrer" className="relative text-sm font-medium text-white/70 transition-colors hover:text-white cursor-pointer after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[var(--color-gold)] after:to-[var(--color-gold-light)] after:transition-all after:duration-300 hover:after:w-full">saber más</a>
            <a href="https://www.kartingamericas.com/sodikart-lr5-junior/" target="_blank" rel="noopener noreferrer" className="relative text-sm font-medium text-white/70 transition-colors hover:text-white cursor-pointer after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[var(--color-gold)] after:to-[var(--color-gold-light)] after:transition-all after:duration-300 hover:after:w-full">saber más</a>
            <a href="https://www.kartingamericas.com/sodikart-doble/" target="_blank" rel="noopener noreferrer" className="relative text-sm font-medium text-white/70 transition-colors hover:text-white cursor-pointer after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[var(--color-gold)] after:to-[var(--color-gold-light)] after:transition-all after:duration-300 hover:after:w-full">saber más</a>
            <a href="https://www.kartingamericas.com/politica-privacidad/" target="_blank" rel="noopener noreferrer" className="relative text-sm font-medium text-white/70 transition-colors hover:text-white cursor-pointer after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[var(--color-gold)] after:to-[var(--color-gold-light)] after:transition-all after:duration-300 hover:after:w-full">Política de Privacidad</a>
            <a href="https://www.kartingamericas.com/terminos-y-condiciones-de-uso/" target="_blank" rel="noopener noreferrer" className="relative text-sm font-medium text-white/70 transition-colors hover:text-white cursor-pointer after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[var(--color-gold)] after:to-[var(--color-gold-light)] after:transition-all after:duration-300 hover:after:w-full">Términos y condiciones de uso</a>
            <a href="https://www.kartingamericas.com/normas-de-seguridad/" target="_blank" rel="noopener noreferrer" className="relative text-sm font-medium text-white/70 transition-colors hover:text-white cursor-pointer after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[var(--color-gold)] after:to-[var(--color-gold-light)] after:transition-all after:duration-300 hover:after:w-full">Normas de seguridad</a>
            <a href="https://www.kartingamericas.com/politica-de-cancelacion/" target="_blank" rel="noopener noreferrer" className="relative text-sm font-medium text-white/70 transition-colors hover:text-white cursor-pointer after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[var(--color-gold)] after:to-[var(--color-gold-light)] after:transition-all after:duration-300 hover:after:w-full">Política de cancelación</a>
            <a href="https://www.facebook.com/kartinglasamericas/" target="_blank" rel="noopener noreferrer" className="relative text-sm font-medium text-white/70 transition-colors hover:text-white cursor-pointer after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[var(--color-gold)] after:to-[var(--color-gold-light)] after:transition-all after:duration-300 hover:after:w-full">Facebook</a>
            <a href="https://www.instagram.com/kartinglasamericas/" target="_blank" rel="noopener noreferrer" className="relative text-sm font-medium text-white/70 transition-colors hover:text-white cursor-pointer after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[var(--color-gold)] after:to-[var(--color-gold-light)] after:transition-all after:duration-300 hover:after:w-full">Instagram</a>
            <a href="https://www.instagram.com/kartinglasamericas?utm_source=ig_web_button_share_sheet&amp;igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className="relative text-sm font-medium text-white/70 transition-colors hover:text-white cursor-pointer after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[var(--color-gold)] after:to-[var(--color-gold-light)] after:transition-all after:duration-300 hover:after:w-full">Instagram</a>
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
                      onClick={() => doSwitchLang(l.code as Lang)}
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
                <Link href="/" className="text-base font-medium text-white/80 transition hover:text-[var(--color-gold)] cursor-pointer" onClick={() => setOpen(false)}>{t("nav.home")}</Link>
                <Link href="/#about" className="text-base font-medium text-white/80 transition hover:text-[var(--color-gold)] cursor-pointer" onClick={() => setOpen(false)}>{t("nav.about")}</Link>
          <Link href="/#services" className="text-base font-medium text-white/80 transition hover:text-[var(--color-gold)] cursor-pointer" onClick={() => setOpen(false)}>{t("nav.services")}</Link>
                <a href="https://www.kartingamericas.com" target="_blank" rel="noopener noreferrer" className="text-base font-medium text-white/80 transition hover:text-[var(--color-gold)] cursor-pointer" onClick={() => setOpen(false)}>Circuitos Kart</a>
              <a href="https://www.kartingamericas.com/empresas/" target="_blank" rel="noopener noreferrer" className="text-base font-medium text-white/80 transition hover:text-[var(--color-gold)] cursor-pointer" onClick={() => setOpen(false)}>Empresa</a>
              <a href="https://www.kartingamericas.com/karts/" target="_blank" rel="noopener noreferrer" className="text-base font-medium text-white/80 transition hover:text-[var(--color-gold)] cursor-pointer" onClick={() => setOpen(false)}>Karts</a>
              <a href="https://www.kartingamericas.com/carreras/" target="_blank" rel="noopener noreferrer" className="text-base font-medium text-white/80 transition hover:text-[var(--color-gold)] cursor-pointer" onClick={() => setOpen(false)}>Carreras</a>
              <a href="https://www.kartingamericas.com/tienda/" target="_blank" rel="noopener noreferrer" className="text-base font-medium text-white/80 transition hover:text-[var(--color-gold)] cursor-pointer" onClick={() => setOpen(false)}>Tienda</a>
              <a href="https://www.kartingamericas.com/preguntas-frecuentes/" target="_blank" rel="noopener noreferrer" className="text-base font-medium text-white/80 transition hover:text-[var(--color-gold)] cursor-pointer" onClick={() => setOpen(false)}>FAQS</a>
              <a href="https://www.kartingamericas.com/finalizar-compra/" target="_blank" rel="noopener noreferrer" className="text-base font-medium text-white/80 transition hover:text-[var(--color-gold)] cursor-pointer" onClick={() => setOpen(false)}>0</a>
              <a href="https://www.kartingamericas.com/wp-content/uploads/2026/03/tarifa-de-precios-CAST-scaled.png" target="_blank" rel="noopener noreferrer" className="text-base font-medium text-white/80 transition hover:text-[var(--color-gold)] cursor-pointer" onClick={() => setOpen(false)}>Tarifas</a>
              <a href="https://www.kartingamericas.com/producto/dia-del-kartista-miercoles-a-viernes/" target="_blank" rel="noopener noreferrer" className="text-base font-medium text-white/80 transition hover:text-[var(--color-gold)] cursor-pointer" onClick={() => setOpen(false)}>Comprar tanda</a>
              <a href="https://www.kartingamericas.com/" target="_blank" rel="noopener noreferrer" className="text-base font-medium text-white/80 transition hover:text-[var(--color-gold)] cursor-pointer" onClick={() => setOpen(false)}>Karting Las Américas</a>
              <a href="https://www.kartingcardedeu.com/" target="_blank" rel="noopener noreferrer" className="text-base font-medium text-white/80 transition hover:text-[var(--color-gold)] cursor-pointer" onClick={() => setOpen(false)}>Karting cardedeu</a>
              <a href="https://www.kartingempuriabrava.com/" target="_blank" rel="noopener noreferrer" className="text-base font-medium text-white/80 transition hover:text-[var(--color-gold)] cursor-pointer" onClick={() => setOpen(false)}>Karting Empuriabrava</a>
              <a href="http://kartingpinomontano.com" target="_blank" rel="noopener noreferrer" className="text-base font-medium text-white/80 transition hover:text-[var(--color-gold)] cursor-pointer" onClick={() => setOpen(false)}>Karting Pino Montano</a>
              <a href="https://www.kartingamericas.com/sodikart-sr4/" target="_blank" rel="noopener noreferrer" className="text-base font-medium text-white/80 transition hover:text-[var(--color-gold)] cursor-pointer" onClick={() => setOpen(false)}>saber más</a>
              <a href="https://www.kartingamericas.com/sodikart-lr5-junior/" target="_blank" rel="noopener noreferrer" className="text-base font-medium text-white/80 transition hover:text-[var(--color-gold)] cursor-pointer" onClick={() => setOpen(false)}>saber más</a>
              <a href="https://www.kartingamericas.com/sodikart-doble/" target="_blank" rel="noopener noreferrer" className="text-base font-medium text-white/80 transition hover:text-[var(--color-gold)] cursor-pointer" onClick={() => setOpen(false)}>saber más</a>
              <a href="https://www.kartingamericas.com/politica-privacidad/" target="_blank" rel="noopener noreferrer" className="text-base font-medium text-white/80 transition hover:text-[var(--color-gold)] cursor-pointer" onClick={() => setOpen(false)}>Política de Privacidad</a>
              <a href="https://www.kartingamericas.com/terminos-y-condiciones-de-uso/" target="_blank" rel="noopener noreferrer" className="text-base font-medium text-white/80 transition hover:text-[var(--color-gold)] cursor-pointer" onClick={() => setOpen(false)}>Términos y condiciones de uso</a>
              <a href="https://www.kartingamericas.com/normas-de-seguridad/" target="_blank" rel="noopener noreferrer" className="text-base font-medium text-white/80 transition hover:text-[var(--color-gold)] cursor-pointer" onClick={() => setOpen(false)}>Normas de seguridad</a>
              <a href="https://www.kartingamericas.com/politica-de-cancelacion/" target="_blank" rel="noopener noreferrer" className="text-base font-medium text-white/80 transition hover:text-[var(--color-gold)] cursor-pointer" onClick={() => setOpen(false)}>Política de cancelación</a>
              <a href="https://www.facebook.com/kartinglasamericas/" target="_blank" rel="noopener noreferrer" className="text-base font-medium text-white/80 transition hover:text-[var(--color-gold)] cursor-pointer" onClick={() => setOpen(false)}>Facebook</a>
              <a href="https://www.instagram.com/kartinglasamericas/" target="_blank" rel="noopener noreferrer" className="text-base font-medium text-white/80 transition hover:text-[var(--color-gold)] cursor-pointer" onClick={() => setOpen(false)}>Instagram</a>
              <a href="https://www.instagram.com/kartinglasamericas?utm_source=ig_web_button_share_sheet&amp;igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className="text-base font-medium text-white/80 transition hover:text-[var(--color-gold)] cursor-pointer" onClick={() => setOpen(false)}>Instagram</a>
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
                          onClick={() => { doSwitchLang(l.code as Lang); setOpen(false); }}
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
