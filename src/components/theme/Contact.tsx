// ============================================================
//  Contact — Animated Gradient Fields + Pulse Button + Hover Lift
//  MAXIMUM WOW EDITION
// ============================================================

"use client";

import { motion } from "framer-motion";

export default function Contact() {
  return (
    <section id="contact" className="relative px-4 py-24 overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0d] via-black to-[#0d0d0d]" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #D4A017 1px, transparent 1px),
            radial-gradient(circle at 75% 75%, #8B1A1A 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          animation: "drift 20s linear infinite",
        }}
      />

      <div className="relative z-10 container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 80, damping: 15 }}
          className="mb-14 text-center"
        >
          <span className="mb-4 block text-xs uppercase tracking-[0.3em] text-[#D4A017]/60">Contact</span>
          <h2 className="text-3xl font-bold text-white md:text-4xl gradient-text">Get in Touch</h2>
          <p className="mx-auto mt-3 max-w-xl text-gray-400">Get in touch with us for inquiries or bookings.</p>
        </motion.div>

        <div className="grid gap-10 md:grid-cols-2">
          {/* Locations grid */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 80, damping: 15 }}
            className="space-y-8"
          >
            {/* Business location — Hover Lift Card */}
            <motion.div
              whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(212,160,23,0.1)" }}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-[#D4A017]/30"
            >
              <h3 className="mb-4 text-lg font-bold text-white">
                <span className="text-[#D4A017]">📍</span> Mario Viajes
              </h3>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5">📍</span>
                  <span>Contact us for our exact location and directions.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5">📞</span>
                  <a href="tel:" className="text-[#D4A017] transition hover:text-[#F5D061]">Call us for more information</a>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5">✉️</span>
                  <a href="mailto:" className="text-[#D4A017] transition hover:text-[#F5D061]">Email us for inquiries</a>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5">🕐</span>
                  <div>
                    <p>Mon — Fri: 09:00 – 18:00</p>
                    <p className="text-gray-500">Weekend hours may vary</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Additional contact info — Hover Lift Card */}
            <motion.div
              whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(212,160,23,0.1)" }}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-[#D4A017]/30"
            >
              <h3 className="mb-4 text-lg font-bold text-white">
                <span className="text-[#D4A017]">📋</span> Get in Touch
              </h3>
              <div className="space-y-3 text-sm text-gray-300">
                <p>We'd love to hear from you! Whether you have a question about our services, need assistance planning your visit, or just want to say hello, feel free to reach out.</p>
                <div className="mt-4 pt-3 border-t border-white/10">
                  <p className="text-xs text-gray-400">We typically respond within 24 hours.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Contact form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 80, damping: 15, delay: 0.2 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm"
          >
            <h3 className="mb-6 text-lg font-semibold text-white">Send Us a Message</h3>
            <form className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Your Name</label>
                <motion.input
                  type="text"
                  placeholder="John Doe"
                  whileFocus={{ scale: 1.01 }}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-gray-500 transition-all duration-300 focus:border-[#D4A017] focus:outline-none focus:ring-[3px] focus:ring-[#D4A017]/20 focus:shadow-[0_0_20px_rgba(212,160,23,0.15)]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Your Email</label>
                <motion.input
                  type="email"
                  placeholder="john@example.com"
                  whileFocus={{ scale: 1.01 }}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-gray-500 transition-all duration-300 focus:border-[#D4A017] focus:outline-none focus:ring-[3px] focus:ring-[#D4A017]/20 focus:shadow-[0_0_20px_rgba(212,160,23,0.15)]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Subject</label>
                <motion.select
                  whileFocus={{ scale: 1.01 }}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-white transition-all duration-300 focus:border-[#D4A017] focus:outline-none focus:ring-[3px] focus:ring-[#D4A017]/20 focus:shadow-[0_0_20px_rgba(212,160,23,0.15)]"
                >
                  <option value="general" className="bg-black">General Inquiry</option>
                  <option value="booking" className="bg-black">Booking / Reservation</option>
                  <option value="support" className="bg-black">Customer Support</option>
                </motion.select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Your Message</label>
                <motion.textarea
                  placeholder="Tell us about your reservation or inquiry..."
                  rows={4}
                  whileFocus={{ scale: 1.01 }}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-gray-500 transition-all duration-300 focus:border-[#D4A017] focus:outline-none focus:ring-[3px] focus:ring-[#D4A017]/20 focus:shadow-[0_0_20px_rgba(212,160,23,0.15)]"
                />
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(212,160,23,0.4)" }}
                whileTap={{ scale: 0.97 }}
                animate={{ boxShadow: ["0 0 15px rgba(212,160,23,0.2)", "0 0 25px rgba(212,160,23,0.4)", "0 0 15px rgba(212,160,23,0.2)"] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="shimmer-btn shimmer-btn-gold relative w-full rounded-lg bg-gradient-to-r from-[#8B1A1A] via-[#D4A017] to-[#8B1A1A] px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:from-[#D4A017] hover:via-[#F5D061] hover:to-[#D4A017]"
              >
                <span className="relative z-10">✨ Send Message ✨</span>
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
