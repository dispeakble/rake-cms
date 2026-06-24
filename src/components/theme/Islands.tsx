// ============================================================
//  Islands — SEO Text Blocks: Tenerife, Gran Canaria, Otras Islas
//  Replicates original marioviajes.com content with new design
// ============================================================

"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";

export default function Islands() {
  const { t } = useLanguage();
  const islands = [
    {
      title: "island_tenerife.title",
      img: "/media/marioviajes/img1.jpg",
      text: "island_tenerife.text",
      extra: "island_tenerife.extra",
    },
    {
      title: "island_grancanaria.title",
      img: "/media/marioviajes/grancanaria.jpeg",
      text: "island_grancanaria.text",
      extra: "island_grancanaria.extra",
    },
    {
      title: "island_other.title",
      img: "/media/marioviajes/img2.jpg",
      text: "island_other.text",
      extra: "island_other.extra",
    },
  ];

  return (
    <section className="relative px-4 py-24 overflow-hidden" data-lang="es">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0d] via-[#1a0a0a] to-[#0d0d0d]" />
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, rgba(var(--color-gold-rgb), 0.08), transparent 50%)" }} />
      <div className="relative z-10 container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl font-bold text-white md:text-4xl gradient-text">{t("islands.title")}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-gray-400">
            {t("islands.subtitle")}
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {islands.map((island, i) => (
            <motion.div
              key={island.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-[var(--color-gold)]/30 hover:shadow-[0_0_30px_rgba(var(--color-gold-rgb), 0.1)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                <div
                  className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundImage: `url(${island.img})` }}
                />
                <div className="absolute bottom-0 left-0 right-0 z-20 p-6">
                  <h3 className="text-xl font-bold text-white">{t(island.title)}</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm leading-relaxed text-gray-300">{t(island.text)}</p>
                <p className="mt-3 text-sm leading-relaxed text-gray-400 italic">{t(island.extra)}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* B2B and Excursions Links Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm text-center"
        >
          <p className="text-gray-300 leading-relaxed mb-6 max-w-3xl mx-auto">
            {t("b2b.text")}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://b2b.marioviajes.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-gold)] px-8 py-3 font-bold text-white shadow-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(var(--color-gold-rgb), 0.3)] hover:scale-105 cursor-pointer"
              style={{ cursor: "pointer" }}
            >
              {t("b2b.button")}
            </a>
            <a
              href="https://www.directotrips.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 px-8 py-3 font-bold text-white transition-all duration-300 hover:border-[var(--color-gold)] hover:bg-[var(--color-gold)]/10 cursor-pointer"
              style={{ cursor: "pointer" }}
            >
              {t("excursions.button")}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
