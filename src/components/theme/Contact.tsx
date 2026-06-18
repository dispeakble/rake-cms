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
          <span className="mb-4 block text-xs uppercase tracking-[0.3em] text-[#D4A017]/60">Contacto</span>
          <h2 className="text-3xl font-bold text-white md:text-4xl gradient-text">Contacto</h2>
          <p className="mx-auto mt-3 max-w-xl text-gray-400">Para más informacin, rellene el siguiente formulario.</p>
        </motion.div>

        <div className="grid gap-10 md:grid-cols-2">
          {/* Contact Details */}
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
                <span className="text-[#D4A017]">📍</span> Blue Oasis Restaurant Tenerife
              </h3>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5">📍</span>
                  <span>Calle Montana Clara nr.6, C.C. Laurisilva Local 6 I, 38679, Adeje, Tenerife</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5">📞</span>
                  <a href="tel:+34922724642" className="text-[#D4A017] transition hover:text-[#F5D061]">0034-922724642</a>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5">✉️</span>
                  <a href="mailto:office@marioviajes.com" className="text-[#D4A017] transition hover:text-[#F5D061]">office@marioviajes.com</a>
                </div>
              </div>
            </motion.div>

            {/* Additional contact info — Hover Lift Card */}
            <motion.div
              whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(212,160,23,0.1)" }}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-[#D4A017]/30"
            >
              <h3 className="mb-4 text-lg font-bold text-white">
                <span className="text-[#D4A017]">📋</span> Informacin
              </h3>
              <div className="space-y-3 text-sm text-gray-300">
                <p>Estaremos encantados de atenderle. Si tiene alguna pregunta sobre nuestros servicios o necesita ayuda para planificar sus vacaciones, no dude en contactarnos.</p>
                <div className="mt-4 pt-3 border-t border-white/10">
                  <p className="text-xs text-gray-400">Le responderemos en un plazo de 24 horas.</p>
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
            <h3 className="mb-6 text-lg font-semibold text-white">Envanos un mensaje</h3>
            <form className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Nombre</label>
                <motion.input
                  type="text"
                  placeholder="Su nombre"
                  whileFocus={{ scale: 1.01 }}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-gray-500 transition-all duration-300 focus:border-[#D4A017] focus:outline-none focus:ring-[3px] focus:ring-[#D4A017]/20 focus:shadow-[0_0_20px_rgba(212,160,23,0.15)]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Apellido</label>
                <motion.input
                  type="text"
                  placeholder="Su apellido"
                  whileFocus={{ scale: 1.01 }}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-gray-500 transition-all duration-300 focus:border-[#D4A017] focus:outline-none focus:ring-[3px] focus:ring-[#D4A017]/20 focus:shadow-[0_0_20px_rgba(212,160,23,0.15)]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Correo electrnico</label>
                <motion.input
                  type="email"
                  placeholder="email@ejemplo.com"
                  whileFocus={{ scale: 1.01 }}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-gray-500 transition-all duration-300 focus:border-[#D4A017] focus:outline-none focus:ring-[3px] focus:ring-[#D4A017]/20 focus:shadow-[0_0_20px_rgba(212,160,23,0.15)]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Telfono</label>
                <motion.input
                  type="tel"
                  placeholder="+34 123 456 789"
                  whileFocus={{ scale: 1.01 }}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-gray-500 transition-all duration-300 focus:border-[#D4A017] focus:outline-none focus:ring-[3px] focus:ring-[#D4A017]/20 focus:shadow-[0_0_20px_rgba(212,160,23,0.15)]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Mensaje</label>
                <motion.textarea
                  placeholder="Escriba su mensaje..."
                  rows={4}
                  whileFocus={{ scale: 1.01 }}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-gray-500 transition-all duration-300 focus:border-[#D4A017] focus:outline-none focus:ring-[3px] focus:ring-[#D4A017]/20 focus:shadow-[0_0_20px_rgba(212,160,23,0.15)]"
                />
              </div>
              {/* reCAPTCHA placeholder */}
              <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/30 px-4 py-3">
                <div className="flex h-6 w-6 items-center justify-center rounded border border-white/20 bg-white/5">
                  <input type="checkbox" className="h-4 w-4 accent-[#D4A017]" />
                </div>
                <span className="text-xs text-gray-400">No soy un robot</span>
                <div className="ml-auto flex items-center gap-1 text-xs text-gray-500">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#D4A017]">
                    <rect x="2" y="2" width="20" height="20" rx="4" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  reCAPTCHA
                </div>
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(212,160,23,0.4)" }}
                whileTap={{ scale: 0.97 }}
                animate={{ boxShadow: ["0 0 15px rgba(212,160,23,0.2)", "0 0 25px rgba(212,160,23,0.4)", "0 0 15px rgba(212,160,23,0.2)"] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="shimmer-btn shimmer-btn-gold relative w-full rounded-lg bg-gradient-to-r from-[#8B1A1A] via-[#D4A017] to-[#8B1A1A] px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:from-[#D4A017] hover:via-[#F5D061] hover:to-[#D4A017]"
              >
                <span className="relative z-10">Enviar mensaje</span>
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
