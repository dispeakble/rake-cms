// ============================================================
//  Islands — Restaurant Ambiance Cards with Images
//  MAXIMUM WOW EDITION
// ============================================================

"use client";

import { motion } from "framer-motion";

const FEATURES = [
  {
    title: "Terraza con Vistas al Mar",
    description: "Disfrute de nuestra terraza panorámica con vistas al océano Atlántico. El lugar perfecto para una cena romántica al atardecer o una comida familiar con las mejores vistas de Costa Adeje.",
    image: "https://placehold.co/800x600/1a0a0a/D4A017?text=Terraza",
  },
  {
    title: "Cocina Mediterránea",
    description: "Nuestros chefs preparan cada plato con ingredientes frescos y de temporada. Pescados del Atlántico, verduras ecológicas y aceite de oliva virgen extra son la base de nuestra cocina.",
    image: "https://placehold.co/800x600/1a0a0a/D4A017?text=Cocina",
  },
  {
    title: "Eventos y Celebraciones",
    description: "Celebre sus momentos especiales con nosotros. Bodas, cumpleaños, aniversarios y eventos corporativos. Contamos con espacios privados y menús personalizados para cada ocasión.",
    image: "https://placehold.co/800x600/1a0a0a/D4A017?text=Eventos",
  },
];

export default function Islands() {
  return (
    <section id="excursions" className="relative px-4 py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0d] via-[#1a0a0a] to-[#0d0d0d]" />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: "radial-gradient(circle at 30% 50%, rgba(var(--color-gold-rgb), 0.08), transparent 50%)",
        }}
      />

      <div className="relative z-10 container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 80, damping: 15 }}
          className="mb-12 text-center"
        >
          <span className="mb-4 block text-xs uppercase tracking-[0.3em] text-[var(--color-gold)]/60">Blue Oasis</span>
          <h2 className="text-3xl font-bold text-white md:text-4xl gradient-text">Nuestro Restaurante</h2>
          <p className="mx-auto mt-3 max-w-xl text-gray-400">
            Blue Oasis Restaurant Tenerife le ofrece el mejor ambiente para disfrutar de una experiencia gastronómica inolvidable en Costa Adeje.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 1, y: 0, scale: 1 }}
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
                  style={{ backgroundImage: `url(${feature.image})` }}
                />
                <div className="absolute bottom-0 left-0 right-0 z-20 p-6">
                  <span className="mb-2 inline-block rounded-full bg-[var(--color-gold)]/20 px-3 py-1 text-xs font-medium text-[var(--color-gold)]">
                    Blue Oasis
                  </span>
                  <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm leading-relaxed text-gray-300">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
