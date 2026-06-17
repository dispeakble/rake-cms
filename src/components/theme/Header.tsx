"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/carta", label: "Carta" },
  { href: "/ubicaciones", label: "Ubicaciones" },
  { href: "/contacto", label: "Contacto" },
  { href: "/blog", label: "Blog" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[var(--theme-accent)]/95 backdrop-blur-xl shadow-2xl"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
            className="h-12 w-12 rounded-full border-2 border-[var(--theme-secondary)] flex items-center justify-center text-xl font-black text-[var(--theme-secondary)]"
          >
            RG
          </motion.div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white">
              Rodeo Grill
            </span>
            <span className="block text-[10px] uppercase tracking-[0.2em] text-[var(--theme-secondary)] font-medium">
              Churrasquería
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link, i) => (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
            >
              <Link
                href={link.href}
                className="relative px-4 py-2 text-sm font-medium text-white/80 transition hover:text-white group/link"
              >
                {link.label}
                <span className="absolute bottom-0 left-1/2 h-[2px] w-0 -translate-x-1/2 bg-[var(--theme-secondary)] transition-all duration-300 group-hover/link:w-3/4" />
              </Link>
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Link
              href="/contacto"
              className="ml-4 rounded-full bg-[var(--theme-secondary)] px-6 py-2.5 text-sm font-bold text-[var(--theme-accent)] transition hover:bg-white hover:shadow-lg hover:shadow-[var(--theme-secondary)]/30"
            >
              Reservar
            </Link>
          </motion.div>
        </nav>

        {/* Mobile menu button */}
        <button
          className="relative z-50 h-10 w-10 md:hidden"
          onClick={() => setOpen(!open)}
        >
          <motion.span
            animate={open ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
            className="absolute left-1/2 top-1/2 block h-[2px] w-6 -translate-x-1/2 -translate-y-1/2 bg-white"
          />
          <motion.span
            animate={open ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
            className="absolute left-1/2 top-1/2 block h-[2px] w-6 -translate-x-1/2 -translate-y-1/2 bg-white"
          />
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-white/10 bg-[var(--theme-accent)]/98 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/contacto"
                onClick={() => setOpen(false)}
                className="mt-4 rounded-full bg-[var(--theme-secondary)] px-6 py-3 text-center text-sm font-bold text-[var(--theme-accent)]"
              >
                Reservar
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
