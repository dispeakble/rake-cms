// ============================================================
//  Contact — Animated Gradient Fields + Pulse Button + Hover Lift
//  MAXIMUM WOW EDITION
// ============================================================

"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";

export default function Contact() {
  useEffect(() => {
    if (!document.querySelector('script[src*="recaptcha/api.js"]')) {
      const script = document.createElement("script");
      script.src = "https://www.google.com/recaptcha/api.js";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  return (
    <section id="contact" className="relative px-4 py-24 overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0d] via-black to-[#0d0d0d]" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, var(--color-gold) 1px, transparent 1px),
            radial-gradient(circle at 75% 75%, var(--color-primary) 1px, transparent 1px)`,
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
          <span className="mb-4 block text-xs uppercase tracking-[0.3em] text-[var(--color-gold)]/60">Contacto</span>
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
              whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(var(--color-gold-rgb), 0.1)" }}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-[var(--color-gold)]/30"
            >
              <h3 className="mb-4 text-lg font-bold text-white">
                <span className="text-[var(--color-gold)]">📍</span> Mario Viajes
              </h3>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5">📍</span>
                  <span>Calle Montana Clara nr.6, C.C. Laurisilva Local 6 I, 38679, Adeje, Tenerife</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5">📞</span>
                  <a href="tel:0034-922724642" className="text-[var(--color-gold)] transition hover:text-[var(--color-gold-light)]">0034-922724642</a>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5">✉️</span>
                  <a href="mailto:office@marioviajes.com" className="text-[var(--color-gold)] transition hover:text-[var(--color-gold-light)]">office@marioviajes.com</a>
                </div>
              </div>
            </motion.div>

            {/* Additional contact info — Hover Lift Card */}
            <motion.div
              whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(var(--color-gold-rgb), 0.1)" }}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-[var(--color-gold)]/30"
            >
              <h3 className="mb-4 text-lg font-bold text-white">
                <span className="text-[var(--color-gold)]">📋</span> Información
              </h3>
              <div className="space-y-3 text-sm text-gray-300">
                <p>Estaremos encantados de atenderle. Si tiene alguna pregunta sobre nuestros servicios, no dude en contactarnos.</p>
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
            <h3 className="mb-6 text-lg font-semibold text-white">Envíanos un mensaje</h3>
            <form className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Nombre</label>
                <motion.input
                  type="text"
                  placeholder="Su nombre"
                  whileFocus={{ scale: 1.01 }}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-gray-500 transition-all duration-300 focus:border-[var(--color-gold)] focus:outline-none focus:ring-[3px] focus:ring-[var(--color-gold)]/20 focus:shadow-[0_0_20px_rgba(var(--color-gold-rgb), 0.15)]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Apellido</label>
                <motion.input
                  type="text"
                  placeholder="Su apellido"
                  whileFocus={{ scale: 1.01 }}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-gray-500 transition-all duration-300 focus:border-[var(--color-gold)] focus:outline-none focus:ring-[3px] focus:ring-[var(--color-gold)]/20 focus:shadow-[0_0_20px_rgba(var(--color-gold-rgb), 0.15)]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Correo electrónico</label>
                <motion.input
                  type="email"
                  placeholder="email@ejemplo.com"
                  whileFocus={{ scale: 1.01 }}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-gray-500 transition-all duration-300 focus:border-[var(--color-gold)] focus:outline-none focus:ring-[3px] focus:ring-[var(--color-gold)]/20 focus:shadow-[0_0_20px_rgba(var(--color-gold-rgb), 0.15)]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Teléfono</label>
                <motion.input
                  type="tel"
                  placeholder="+34 123 456 789"
                  whileFocus={{ scale: 1.01 }}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-gray-500 transition-all duration-300 focus:border-[var(--color-gold)] focus:outline-none focus:ring-[3px] focus:ring-[var(--color-gold)]/20 focus:shadow-[0_0_20px_rgba(var(--color-gold-rgb), 0.15)]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Mensaje</label>
                <motion.textarea
                  placeholder="Escriba su mensaje..."
                  rows={4}
                  whileFocus={{ scale: 1.01 }}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-gray-500 transition-all duration-300 focus:border-[var(--color-gold)] focus:outline-none focus:ring-[3px] focus:ring-[var(--color-gold)]/20 focus:shadow-[0_0_20px_rgba(var(--color-gold-rgb), 0.15)]"
                />
              </div>
              {/* Real Google reCAPTCHA */}
              <div className="flex justify-center rounded-lg border border-white/10 bg-black/30 px-4 py-4">
                <div
                  className="g-recaptcha"
                  data-sitekey="6LdbHk0UAAAAAAJrcrI7qcHPVr7u3U-xHTVQy032"
                  data-theme="dark"
                />
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(var(--color-gold-rgb), 0.4)" }}
                whileTap={{ scale: 0.97 }}
                animate={{ boxShadow: ["0 0 15px rgba(var(--color-gold-rgb), 0.2)", "0 0 25px rgba(var(--color-gold-rgb), 0.4)", "0 0 15px rgba(var(--color-gold-rgb), 0.2)"] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="shimmer-btn shimmer-btn-gold relative w-full rounded-lg bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-gold)] to-[var(--color-primary)] px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:from-[var(--color-gold)] hover:via-[var(--color-gold-light)] hover:to-[var(--color-gold)]"
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
