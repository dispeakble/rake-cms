// ============================================================
	  	  //  Footer — Gradient Background + Glow Links + Animated Border
	  	  //  MAXIMUM WOW EDITION
// ============================================================

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useLanguage } from "@/lib/i18n";

export default function Footer() {
  const { t, lang } = useLanguage();
  const __ = (m: Record<string,string>) => m[lang] || m.es || "";
  return (
    <footer className="relative px-4 py-16 overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-section" />
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-gold) 50%, var(--color-primary) 100%)",
          backgroundSize: "400% 400%",
          animation: "gradient 6s ease infinite",
        }}
      />

      {/* Animated Border Top */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: "linear-gradient(90deg, transparent, var(--color-gold), var(--color-primary), var(--color-gold), transparent)",
          backgroundSize: "200% 100%",
          animation: "gradient 3s linear infinite",
        }}
      />

      <div className="relative z-10 container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 80, damping: 15 }}
          className="grid gap-10 md:grid-cols-4"
        >
          <div className="md:col-span-2">
            <h4 className="mb-4 text-lg font-semibold text-white">
              <span className="gradient-text-gold">Daria&#x27;s Bakery &amp; Bistro | Breakfast &amp; Lunch</span>
            </h4>
            <p className="max-w-sm text-sm leading-relaxed text-tertiary">
              {__({es: "We are Daria's Bakery & Bistro | Breakfast & Lunch, serving the local area.", en: "We are Daria's Bakery & Bistro | Breakfast & Lunch, serving the local area."})}
            </p>
            {/* Address */}
            <p className="mt-4 text-xs text-quaternary leading-relaxed">
              Daria&#x27;s Bakery &amp; Bistro | Breakfast &amp; Lunch
            </p>
            {/* Social / Watermark link with Glow Hover */}
            <div className="mt-6 flex gap-4">
              <motion.a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2, y: -2 }}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm text-tertiary transition-all duration-300 hover:border-[var(--color-gold)]/50 hover:bg-[var(--color-gold)]/10 hover:text-[var(--color-gold)] hover:shadow-[0_0_15px_rgba(var(--color-gold-rgb), 0.3)] cursor-pointer"
                style={{cursor:'pointer'}}
              >
                f
              </motion.a>
              <motion.a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2, y: -2 }}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm text-tertiary transition-all duration-300 hover:border-[var(--color-gold)]/50 hover:bg-[var(--color-gold)]/10 hover:text-[var(--color-gold)] hover:shadow-[0_0_15px_rgba(var(--color-gold-rgb), 0.3)] cursor-pointer"
                style={{cursor:'pointer'}}
              >
                ig
              </motion.a>
              <motion.a
                href="https://tripadvisor.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2, y: -2 }}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm text-tertiary transition-all duration-300 hover:border-[var(--color-gold)]/50 hover:bg-[var(--color-gold)]/10 hover:text-[var(--color-gold)] hover:shadow-[0_0_15px_rgba(var(--color-gold-rgb), 0.3)] cursor-pointer"
                style={{cursor:'pointer'}}
              >
                ta
              </motion.a>
            </div>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-tertiary">{t("footer.links")}</h4>
            <div className="space-y-3 text-sm">
              <Link href="/#about" className="block text-sm text-tertiary transition-all duration-300 hover:text-[var(--color-gold)] hover:translate-x-1 cursor-pointer">{t("nav.about")}</Link>
          <Link href="/#services" className="block text-sm text-tertiary transition-all duration-300 hover:text-[var(--color-gold)] hover:translate-x-1 cursor-pointer">{t("nav.services")}</Link>
          <Link href="/#menu" className="block text-sm text-tertiary transition-all duration-300 hover:text-[var(--color-gold)] hover:translate-x-1 cursor-pointer">{t("nav.menu")}</Link>
    <p className="text-xs text-quaternary mt-4"></p><div className="mt-12 border-t border-white/10 pt-8 text-center text-xs text-quaternary leading-relaxed">
          <p className="mt-4"></p>
          <p className="mt-2">{t("footer.made_with")} <a href="https://alexawebservers.com" target="_blank" rel="noopener noreferrer" className="text-[var(--color-gold)] hover:text-[var(--color-gold-light)] transition-colors cursor-pointer" style={{cursor:"pointer"}}>alexawebservers.com</a></p>
        </div>
      </div>
      </div>
    </motion.div>
    </div>
    </footer>
  );
}
