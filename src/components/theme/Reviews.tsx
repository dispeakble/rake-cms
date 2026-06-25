// ============================================================
//  Reviews — 3D Perspective Cards + Sparkle Stars + Gradient Quotes
//  MAXIMUM WOW EDITION
// ============================================================

"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { useLanguage } from "@/lib/i18n";

const REVIEWS: Array<{ author: string; text: string; rating: number; source: string }> = [{"author":"María G.","text":"Contratamos una excursión a Tenerife con Mario Viajes y fue una experiencia increíble. El guía conocía todos los rincones del Teide y nos llevó a sitios espectaculares que nunca habríamos encontrado solos. Muy recomendable.","rating":5,"source":"Google"},{"author":"Carlos R.","text":"Excelente servicio para organizar nuestro viaje a Gran Canaria. Los traslados fueron puntuales, el alojamiento perfecto y las excursiones muy bien organizadas. Repetiremos sin duda.","rating":5,"source":"Tripadvisor"},{"author":"Ana & Pedro","text":"Hicimos la ruta interinsular de 10 días y fue perfecta. Todo estaba coordinado al detalle, los hoteles excelentes y las excursiones muy variadas. Una forma maravillosa de conocer Canarias.","rating":5,"source":"Google"},{"author":"James T.","text":"Booked the Tenerife and La Gomera tour package with Mario Viajes. Absolutely stunning! The guide was knowledgeable and passionate about the islands. The boat trip to La Gomera was unforgettable.","rating":5,"source":"Tripadvisor"},{"author":"Laura S.","text":"Fuimos en familia con dos niños y todo fue genial. El alquiler de coches nos permitió movernos con libertad y las recomendaciones de restaurantes y playas fueron excelentes. Volveremos el año que viene.","rating":4,"source":"Restaurant Guru"},{"author":"David M.","text":"Increíble variedad de excursiones para elegir. Desde rutas de senderismo por el Teide hasta paseos en barco avistando delfines. La atención al cliente es excepcional, siempre dispuestos a ayudar.","rating":5,"source":"Google"}];

function SparkleStar({ filled, delay }: { filled: boolean; delay: number }) {
  return (
    <motion.span
      className={`relative inline-block text-lg ${
        filled ? "text-[var(--color-gold)]" : "text-gray-600"
      }`}
      initial={{ opacity: 0, scale: 0, rotate: -180 }}
      whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
      viewport={{ once: true }}
      transition={{ delay, type: "spring", stiffness: 200, damping: 10 }}
    >
      {filled ? "★" : "☆"}
      {filled && (
        <motion.span
          className="absolute -top-1 -right-1 text-[8px] text-[var(--color-gold-light)]"
          animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0], rotate: [0, 180, 360] }}
          transition={{ repeat: Infinity, duration: 2, delay: delay + 0.5, ease: "easeInOut" }}
        >
          ✦
        </motion.span>
      )}
    </motion.span>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <SparkleStar key={star} filled={star <= rating} delay={star * 0.1} />
      ))}
    </div>
  );
}

export default function Reviews() {
  const { t } = useLanguage();
  return (
    <section id="reviews" className="relative px-4 py-24 overflow-hidden">
      <div className="absolute inset-0 bg-section" />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: "radial-gradient(circle at 70% 30%, rgba(var(--color-gold-rgb), 0.15), transparent 50%)",
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
          <span className="mb-4 block text-xs uppercase tracking-[0.3em] text-[var(--color-gold)]/60">{t("reviews.subtitle")}</span>
          <h2 className="text-3xl font-bold text-heading md:text-4xl gradient-text">{t("reviews.title")}</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">{t("reviews.tagline")}</p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {REVIEWS.map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40, rotateX: 10, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                delay: i * 0.1,
                type: "spring",
                stiffness: 80,
                damping: 12,
              }}
              whileHover={{
                y: -8,
                scale: 1.02,
                boxShadow: "0 20px 60px rgba(var(--color-gold-rgb), 0.15)",
              }}
              className="relative rounded-xl border border-card bg-card p-6 backdrop-blur-sm hover:border-[var(--color-gold)]/30"
              style={{ transformPerspective: 800 }}
            >
              {/* Gradient Quote Decoration */}
              <div className="absolute -top-2 -left-2 text-4xl text-[var(--color-gold)]/20 select-none leading-none" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z"/>
                </svg>
              </div>

              <StarRating rating={review.rating} />
              <p className="mt-3 text-sm leading-relaxed text-muted relative z-10">"{review.text}"</p>
              <div className="mt-4 flex items-center justify-between border-t border-card pt-3 text-xs text-muted-lighter">
                <span className="font-medium text-heading">— {review.author}</span>
                <span className="text-[var(--color-gold)]/80">{review.source}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
