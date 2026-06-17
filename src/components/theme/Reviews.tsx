// Auto-generated Reviews component — framer-motion staggered cards
"use client";

import { motion } from "framer-motion";

const REVIEWS: Array<{ author: string; text: string; rating: number; source: string }> = [{"author":"María G.","text":"Espectacular rodizio brasileño. La picanha estaba en su punto perfecto y los acompañamientos tradicionales son deliciosos. El personal muy atento y el ambiente acogedor. Volveremos sin duda.","rating":5,"source":"Google"},{"author":"Carlos R.","text":"Excelente relación calidad-precio. El rodizio no para de traer carnes hasta que dices basta. La caipirinha obligatoria. Muy recomendable para grupos grandes.","rating":5,"source":"Tripadvisor"},{"author":"Ana & Pedro","text":"Hemos ido varias veces y nunca defrauda. La costilla y el pollo a la brasa son espectaculares. El servicio es rápido y muy profesional.","rating":5,"source":"Google"},{"author":"James T.","text":"Best Brazilian BBQ in Tenerife! The meat keeps coming and everything is perfectly grilled. Great atmosphere and friendly staff. The garlic bread is amazing!","rating":5,"source":"Tripadvisor"},{"author":"Laura S.","text":"Fuimos a celebrar un cumpleaños y fue una experiencia increíble. El trato del personal, la calidad de la carne y el postre de pudim... todo perfecto.","rating":4,"source":"Restaurant Guru"},{"author":"David M.","text":"Increíble variedad de carnes. La alcatra y el lomo son mis favoritos. El pan de ajo que sirven de entrante ya es una experiencia. Los precios muy ajustados para la calidad.","rating":5,"source":"Google"}];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={`text-sm ${
          star <= rating ? "text-amber-400" : "text-gray-600"
        }`}>★</span>
      ))}
    </div>
  );
}

export default function Reviews() {
  return (
    <section id="reviews" className="relative px-4 py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0d] via-[#1a0a0a] to-[#0d0d0d]" />
      <div className="relative z-10 container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <span className="mb-4 block text-xs uppercase tracking-[0.3em] text-amber-500/60">Testimonials</span>
          <h2 className="text-3xl font-bold text-white md:text-4xl">What Our Guests Say</h2>
          <p className="mx-auto mt-3 max-w-xl text-gray-400">Real reviews from real guests across Tenerife.</p>
        </motion.div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {REVIEWS.map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="rounded-xl border border-white/10 bg-white/5 p-6 shadow-sm backdrop-blur-sm transition hover:border-amber-600/30 hover:bg-white/10"
            >
              <StarRating rating={review.rating} />
              <p className="mt-3 text-sm leading-relaxed text-gray-300">"{review.text}"</p>
              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-gray-400">
                <span className="font-medium text-white">— {review.author}</span>
                <span className="text-amber-400/80">{review.source}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
