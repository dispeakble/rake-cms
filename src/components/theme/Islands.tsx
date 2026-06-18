// ============================================================
//  Islands — Destination Cards with Images and Descriptions
//  MAXIMUM WOW EDITION
// ============================================================

"use client";

import { motion } from "framer-motion";

const ISLANDS = [
  {
    title: "Sobre Tenerife",
    description: "Tenerife es considerada como la isla de la 'primavera eterna' con un clima suave durante todo el ao. Es la isla más alta de las siete Islas Canarias debido al volcán Teide, que es 3718 metros de altura, siendo el pico más alto de España.",
    image: "https://placehold.co/800x600/1a0a0a/D4A017?text=Tenerife",
  },
  {
    title: "Sobre Gran Canaria",
    description: "Si usted deja ir su imaginación durante su visita a Gran Canaria, tendr la sensación de que en lugar de una isla, en realidad visitar tres continentes: frica, Europa y América. Es la tercera isla más grande del archipiélago canario.",
    image: "https://placehold.co/800x600/1a0a0a/D4A017?text=Tenerife",
  },
  {
    title: "Otras Islas Canarias",
    description: "La Gomera, Lanzarote, Fuerteventura, La Palma y El Hierro no son sólo nombres. Son 5 islas hermosas y vale la pena visitar. Cada uno tiene características diferentes: La Gomera es considerada como la última selva en Europa.",
    image: "https://placehold.co/800x600/1a0a0a/D4A017?text=Canarias",
  },
];

export default function Islands() {
  return (
    <section id="excursions" className="relative px-4 py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0d] via-[#1a0a0a] to-[#0d0d0d]" />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: "radial-gradient(circle at 30% 50%, rgba(212,160,23,0.08), transparent 50%)",
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
          <span className="mb-4 block text-xs uppercase tracking-[0.3em] text-[#D4A017]/60">Destinos</span>
          <h2 className="text-3xl font-bold text-white md:text-4xl gradient-text">Descubre las Islas Canarias</h2>
          <p className="mx-auto mt-3 max-w-xl text-gray-400">
            Te invitamos a descubrir juntos el encanto y la singularidad de las Islas Canarias! Desde el pico del volcán, hasta 30 metros de profundidad en el Atlántico, ofrecemos una amplia gama de actividades y excursiones que representan el superlativo de la diversidad para cualquier persona, logrando satisfacer incluso los gustos más exigentes.
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
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-[#D4A017]/30 hover:shadow-[0_0_30px_rgba(212,160,23,0.1)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                <div
                  className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundImage: `url(${island.image})` }}
                />
                <div className="absolute bottom-0 left-0 right-0 z-20 p-6">
                  <span className="mb-2 inline-block rounded-full bg-[#D4A017]/20 px-3 py-1 text-xs font-medium text-[#D4A017]">
                    Isla Canaria
                  </span>
                  <h3 className="text-xl font-bold text-white">{island.title}</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm leading-relaxed text-gray-300">
                  {island.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
