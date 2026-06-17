"use client";
import { motion } from "framer-motion";
import { useRef } from "react";
import { useInView } from "framer-motion";

const LOCATIONS = [
  {
    name: "Rodeo Norte",
    subtitle: "La Esperanza",
    address: "Calle Principal, La Esperanza, Tenerife",
    phone: "+34 922 123 456",
    hours: ["Jue-Vie: 19:00 - 23:00", "Sáb-Dom: 13:00 - 23:00"],
  },
  {
    name: "Rodeo Sur",
    subtitle: "Costa Adeje",
    address: "Av. de Colón, Costa Adeje, Tenerife",
    phone: "+34 922 789 012",
    hours: ["Jue-Vie: 19:00 - 23:00", "Sáb-Dom: 13:00 - 23:00"],
  },
];

export default function Contact() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section id="contact" className="bg-[var(--theme-cream)] px-4 py-24 md:py-32">
      <div className="container mx-auto max-w-7xl">
        <div ref={ref} className="mb-16 text-center">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            className="mb-4 block text-xs uppercase tracking-[0.3em] text-[var(--theme-primary)]/60"
          >
            Visítanos
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="text-4xl font-black text-[var(--theme-accent)] md:text-5xl"
          >
            Dos ubicaciones,
            <br />
            <span className="text-[var(--theme-primary)]">una experiencia</span>
          </motion.h2>
        </div>

        {/* Locations Grid */}
        <div className="mb-20 grid gap-8 md:grid-cols-2">
          {LOCATIONS.map((loc, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.15 }}
              whileHover={{ y: -5 }}
              className="group relative overflow-hidden rounded-3xl bg-white p-8 shadow-xl"
            >
              <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-[var(--theme-primary)]/5 transition group-hover:scale-150" />
              <div className="relative">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-[var(--theme-accent)]">{loc.name}</h3>
                  <span className="rounded-full bg-[var(--theme-primary)]/10 px-3 py-1 text-xs font-medium text-[var(--theme-primary)]">
                    {loc.subtitle}
                  </span>
                </div>
                <div className="mt-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5">📍</span>
                    <p className="text-sm text-gray-600">{loc.address}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5">📞</span>
                    <p className="text-sm font-medium text-gray-700">{loc.phone}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5">🕐</span>
                    <div className="space-y-1">
                      {loc.hours.map((h, j) => (
                        <p key={j} className="text-sm text-gray-600">{h}</p>
                      ))}
                    </div>
                  </div>
                </div>
                <a
                  href={`tel:${loc.phone.replace(/\s/g, "")}`}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--theme-primary)] px-6 py-3 text-sm font-bold text-white transition hover:bg-[var(--theme-accent)]"
                >
                  Llamar ahora
                  <span>→</span>
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contact Form */}
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-[var(--theme-accent)] p-8 shadow-2xl md:p-12"
          >
            <h3 className="mb-8 text-center text-2xl font-bold text-white">
              Reserva tu mesa
            </h3>
            <form className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-white/60">Nombre</label>
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 transition focus:border-[var(--theme-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-secondary)]/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-white/60">Email</label>
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 transition focus:border-[var(--theme-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-secondary)]/20"
                  />
                </div>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-white/60">Teléfono</label>
                  <input
                    type="tel"
                    placeholder="+34 600 000 000"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 transition focus:border-[var(--theme-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-secondary)]/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-white/60">Personas</label>
                  <select className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition focus:border-[var(--theme-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-secondary)]/20">
                    {[1, 2, 3, 4, 5, 6, 7, 8, "8+"].map((n) => (
                      <option key={n} value={n} className="text-[var(--theme-accent)]">
                        {n} {n === 1 ? "persona" : "personas"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-white/60">Ubicación</label>
                <select className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition focus:border-[var(--theme-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-secondary)]/20">
                  {LOCATIONS.map((loc, i) => (
                    <option key={i} value={loc.name} className="text-[var(--theme-accent)]">
                      {loc.name} — {loc.subtitle}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-white/60">Mensaje</label>
                <textarea
                  placeholder="Alguna alergia o petición especial..."
                  rows={3}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 transition focus:border-[var(--theme-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-secondary)]/20 resize-none"
                />
              </div>
              <button
                type="submit"
                className="group relative w-full overflow-hidden rounded-full bg-[var(--theme-secondary)] px-8 py-4 text-base font-bold text-[var(--theme-accent)] transition hover:shadow-xl hover:shadow-[var(--theme-secondary)]/30"
              >
                <span className="relative z-10">Solicitar Reserva</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
