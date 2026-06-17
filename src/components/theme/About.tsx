// Auto-generated About — framer-motion fade-in, rodizio experience
"use client";

import { motion } from "framer-motion";

export default function About() {
  return (
    <section id="about" className="relative px-4 py-24">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#1a0a0a] to-black opacity-80" />
      <div className="relative z-10 container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid items-center gap-12 md:grid-cols-2"
        >
          <div>
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="mb-4 block text-xs uppercase tracking-[0.3em] text-amber-500/80"
            >
              Our Story
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-6 text-3xl font-bold text-white md:text-4xl"
            >
              La Experiencia Rodizio
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mb-4 leading-relaxed text-gray-300"
            >
              Step into La Experiencia Rodizio and experience the centuries-old gaucho tradition of rodizio — a continuous service of fire-grilled meats, carved directly onto your plate by our skilled passadores. Each cut is seasoned with coarse sea salt and grilled over open flames to perfection.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mb-4 leading-relaxed text-gray-300"
            >
              From the coveted picanha (prime rump cap) to succulent costela (beef ribs) and tender alcatra (top sirloin), our rotating selection features 12+ premium cuts brought to your table on skewers. Use the color-coded card — green means "keep them coming," red means "I need a moment."
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="leading-relaxed text-gray-300"
            >
              Complement your feast with our hot and cold buffet of traditional Brazilian sides — garlic bread, black beans, rice, farofa, fried bananas, and fresh salads. Save room for dessert and finish with a caipirinha, Brazil's national cocktail.
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            <motion.div className="overflow-hidden rounded-2xl" whileHover={{ scale: 1.02 }} transition={{ duration: 0.4 }}><img src="/media/scraped/unsplash-1781702959166-u3ct4c.svg+xml" alt="La Experiencia Rodizio" className="h-full w-full object-cover" /></motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
