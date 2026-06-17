// Auto-generated Contact — both locations, framer-motion
"use client";

import { motion } from "framer-motion";

export default function Contact() {
  return (
    <section id="contact" className="relative px-4 py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0d] via-black to-[#0d0d0d]" />
      <div className="relative z-10 container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <span className="mb-4 block text-xs uppercase tracking-[0.3em] text-amber-500/60">Contact</span>
          <h2 className="text-3xl font-bold text-white md:text-4xl">Get in Touch</h2>
          <p className="mx-auto mt-3 max-w-xl text-gray-400">Reserve your table or ask us anything.</p>
        </motion.div>

        <div className="grid gap-10 md:grid-cols-2">
          {/* Locations grid */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* SUR location */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <h3 className="mb-4 text-lg font-bold text-white">
                Rodeo Grill <span className="text-amber-400">SUR</span>
                <span className="ml-2 text-sm font-normal text-gray-400">— Costa Adeje</span>
              </h3>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5">📍</span>
                  <span>C. Dublin 1, 38660 Costa Adeje, Tenerife</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5">📞</span>
                  <a href="tel:+34922713255" className="text-amber-400 transition hover:text-amber-300">922 713 255</a>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5">✉️</span>
                  <a href="mailto:rodeosur@rodizio.com" className="text-amber-400 transition hover:text-amber-300">rodeosur@rodizio.com</a>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5">🕐</span>
                  <div>
                    <p>Wed — Sun: 14:00 – 23:00</p>
                    <p className="text-gray-500">Closed Mon &amp; Tue</p>
                  </div>
                </div>
              </div>
            </div>

            {/* NORTE location */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <h3 className="mb-4 text-lg font-bold text-white">
                Rodeo Grill <span className="text-amber-400">NORTE</span>
                <span className="ml-2 text-sm font-normal text-gray-400">— La Esperanza</span>
              </h3>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5">📍</span>
                  <span>Carr. de la Esperanza Km4.8, La Esperanza, Tenerife</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5">📞</span>
                  <a href="tel:+34922443900" className="text-amber-400 transition hover:text-amber-300">922 443 900</a>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5">✉️</span>
                  <a href="mailto:rodeonorte@rodizio.com" className="text-amber-400 transition hover:text-amber-300">rodeonorte@rodizio.com</a>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5">🕐</span>
                  <div>
                    <p>Mon &amp; Thu: 13:00 – 18:00</p>
                    <p>Fri: 13:00 – 23:00</p>
                    <p>Sat: 12:00 – 23:00</p>
                    <p>Sun: 12:00 – 20:00</p>
                    <p className="text-gray-500">Closed Tue &amp; Wed</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm"
          >
            <h3 className="mb-6 text-lg font-semibold text-white">Send Us a Message</h3>
            <form className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Your Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-gray-500 transition focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Your Email</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-gray-500 transition focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Preferred Location</label>
                <select className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-white transition focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20">
                  <option value="sur" className="bg-black">Rodeo Grill SUR — Costa Adeje</option>
                  <option value="norte" className="bg-black">Rodeo Grill NORTE — La Esperanza</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Your Message</label>
                <textarea
                  placeholder="Tell us about your reservation or inquiry..."
                  rows={4}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-gray-500 transition focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 px-6 py-3.5 text-sm font-semibold text-black shadow-lg transition hover:from-amber-500 hover:to-amber-400 hover:shadow-xl"
              >
                Send Message
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
