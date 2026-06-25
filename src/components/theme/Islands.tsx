// ============================================================
//  Islands — Destination Cards with Images and Descriptions
//  MAXIMUM WOW EDITION
// ============================================================

"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { useLanguage } from "@/lib/i18n";

const ISLANDS = [
  { titleKey: "island_tenerife.title", descKey: "island_tenerife.text", extraKey: "island_tenerife.extra", image: "https://placehold.co/800x600/1a0a0a/D4A017?text=Tenerife" },
  { titleKey: "island_grancanaria.title", descKey: "island_grancanaria.text", extraKey: "island_grancanaria.extra", image: "https://placehold.co/800x600/1a0a0a/D4A017?text=Gran+Canaria" },
  { titleKey: "island_other.title", descKey: "island_other.text", extraKey: "island_other.extra", image: "https://placehold.co/800x600/1a0a0a/D4A017?text=Canarias" },
];

export default function Islands() {
  const { t } = useLanguage();
  return (
    <section id="excursions" className="relative px-4 py-24 overflow-hidden">
      <div className="absolute inset-0 bg-section" />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: "radial-gradient(circle at 30% 50%, rgba(var(--color-gold-rgb), 0.08), transparent 50%)",
        }}
      />

      <div className="relative z-10 container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 80, damping: 15 }}
          className="mb-12 text-center"
        >
          <span className="mb-4 block text-xs uppercase tracking-[0.3em] text-[var(--color-gold)]/60">{t("excursions.subtitle")}</span>
          <h2 className="text-3xl font-bold text-white md:text-4xl gradient-text">{t("islands.title")}</h2>
          <p className="mx-auto mt-3 max-w-xl text-gray-400">
            {t("excursions.text")}
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {ISLANDS.map((island, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 100, damping: 15 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-[var(--color-gold)]/30 hover:shadow-[0_0_30px_rgba(var(--color-gold-rgb), 0.1)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                <div
                  className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundImage: `url(${island.image})` }}
                />
                <div className="absolute bottom-0 left-0 right-0 z-20 p-6">
                  <span className="mb-2 inline-block rounded-full bg-[var(--color-gold)]/20 px-3 py-1 text-xs font-medium text-[var(--color-gold)]">
                    Isla Canaria
                  </span>
                  <h3 className="text-xl font-bold text-white">{t(island.titleKey)}</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm leading-relaxed text-gray-300">
                  {t(island.descKey)}
                </p>
                <div className="mt-4 border-t border-white/10 pt-4">
                  <p className="text-xs leading-relaxed text-gray-400 italic">
                    {t(island.extraKey)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
