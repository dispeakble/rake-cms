// Auto-generated Header — framer-motion, section-anchor nav, scroll-aware
"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.2 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl supports-[backdrop-filter]:bg-black/50"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold tracking-tight text-white">
          Churrasquería Rodeo Grill, Tenerife
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/#about" className="block text-sm font-medium text-white/80 transition hover:text-white">About</Link>
          <Link href="/#services" className="block text-sm font-medium text-white/80 transition hover:text-white">Services</Link>
          <Link href="/#locations" className="block text-sm font-medium text-white/80 transition hover:text-white">Locations</Link>
          <Link href="/#menu" className="block text-sm font-medium text-white/80 transition hover:text-white">Menu</Link>
          <Link href="/#reviews" className="block text-sm font-medium text-white/80 transition hover:text-white">Reviews</Link>
          <Link href="/#contact" className="block text-sm font-medium text-white/80 transition hover:text-white">Contact</Link>
        </nav>
        <button
          className="text-white md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <span className="text-2xl">{open ? "✕" : "☰"}</span>
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-white/10 bg-black/90 backdrop-blur-xl"
          >
            <div className="flex flex-col gap-4 px-4 py-6">
              <Link href="/#about" className="text-base font-medium text-white/90" onClick={() => setOpen(false)}>About</Link>
          <Link href="/#services" className="text-base font-medium text-white/90" onClick={() => setOpen(false)}>Services</Link>
          <Link href="/#locations" className="text-base font-medium text-white/90" onClick={() => setOpen(false)}>Locations</Link>
          <Link href="/#menu" className="text-base font-medium text-white/90" onClick={() => setOpen(false)}>Menu</Link>
          <Link href="/#reviews" className="text-base font-medium text-white/90" onClick={() => setOpen(false)}>Reviews</Link>
          <Link href="/#contact" className="text-base font-medium text-white/90" onClick={() => setOpen(false)}>Contact</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
