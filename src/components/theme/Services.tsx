// ============================================================
//  Services — 3D Perspective Tilt + Glowing Borders + Pulse Dots
//  MAXIMUM WOW EDITION
// ============================================================

"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { useRef } from "react";

const MEATS = [{"name":"Picanha","desc":"Prime rump cap — the crown jewel of churrasco"},{"name":"Alcatra","desc":"Tender top sirloin, grilled to juicy perfection"},{"name":"Costela","desc":"Succulent beef ribs, slow-roasted until fall-off-the-bone"},{"name":"Maminha","desc":"Flavorful bottom sirloin, beautifully marbled"},{"name":"Lomo","desc":"Premium pork tenderloin, seasoned and fire-grilled"},{"name":"Frango","desc":"Chicken thighs and drumsticks, marinated in citrus and herbs"},{"name":"Cordeiro","desc":"Herb-crusted lamb chops, smoky and tender"},{"name":"Linguica","desc":"Spicy Portuguese sausage with a perfect char"}];
const STARTERS = [{"name":"Pão de Queijo","desc":"Cheese bread — warm, chewy, and addictive"},{"name":"Polenta Frita","desc":"Crispy fried polenta sticks with garlic aioli"},{"name":"Azeitonas","desc":"Mixed marinated olives with herbs and olive oil"},{"name":"Salada Tropical","desc":"Fresh garden salad with hearts of palm"}];
const DESSERTS = [{"name":"Tres Leches","desc":"Three-milk sponge cake with vanilla whipped cream"},{"name":"Pudim","desc":"Classic Brazilian flan with caramel sauce"},{"name":"Mousse de Chocolate","desc":"Rich Belgian chocolate mousse"},{"name":"Tarta de Limón","desc":"Zesty lemon meringue pie with toasted meringue"},{"name":"Helado Artesanal","desc":"Artisan ice cream — vanilla, dulce de leche, or coconut"},{"name":"Fruta Fresca","desc":"Seasonal fresh fruit platter with honey-lime drizzle"}];

function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-8, 8]);

  function handleMouseMove(e: React.MouseEvent) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const width = rect.width;
    const height = rect.height;
    const mx = (e.clientX - rect.left) / width - 0.5;
    const my = (e.clientY - rect.top) / height - 0.5;
    x.set(mx);
    y.set(my);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      transition={{ type: "spring", stiffness: 150, damping: 20 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Services() {
  return (
    <section id="services" className="relative px-4 py-24 overflow-hidden">
      {/* Animated Background Mesh */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0d] via-[#1a0808] to-[#0d0d0d]" />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(139,26,26,0.3), transparent 40%),
            radial-gradient(circle at 80% 70%, rgba(212,160,23,0.2), transparent 40%),
            radial-gradient(circle at 50% 50%, rgba(139,26,26,0.15), transparent 50%)
          `,
          backgroundSize: "100% 100%",
          animation: "breathe 6s ease-in-out infinite",
        }}
      />

      <div className="relative z-10 container mx-auto max-w-6xl">
        {/* ── Locations ── */}
        <motion.div
          id="locations"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 80, damping: 15 }}
          className="mb-20"
        >
          <div className="mb-12 text-center">
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mb-4 block text-xs uppercase tracking-[0.3em] text-[#D4A017]/60"
            >
              Our Locations
            </motion.span>
            <h2 className="text-3xl font-bold text-white md:text-4xl gradient-text">Find Your Nearest Rodeo Grill</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            {/* SUR */}
            <TiltCard className="rounded-2xl p-[1px] glow-card">
              <div className="relative rounded-2xl bg-[#0a0a0f] p-8 h-full">
                {/* Pulse dot indicator */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4A017] opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#D4A017]" />
                  </span>
                  <span className="text-xs text-[#D4A017]/60">Open Now</span>
                </div>
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D4A017]/20 text-lg">📍</span>
                  <h3 className="text-xl font-bold text-white">Rodeo Grill <span className="text-[#D4A017]">SUR</span></h3>
                </div>
                <div className="space-y-3 text-sm text-gray-300">
                  <p className="font-medium text-white">Costa Adeje</p>
                  <p>C. Dublin 1, 38660 Costa Adeje</p>
                  <p>📞 <a href="tel:+349****3255" className="text-[#D4A017] transition hover:text-[#F5D061]">922 713 255</a></p>
                  <p className="text-gray-400">Wed — Sun: 14:00 – 23:00</p>
                  <a href="https://maps.google.com/?q=C.+Dublin+1,+38660+Costa+Adeje" target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-[#D4A017] underline transition hover:text-[#F5D061]">View on Google Maps →</a>
                </div>
              </div>
            </TiltCard>
            {/* NORTE */}
            <TiltCard className="rounded-2xl p-[1px] glow-card">
              <div className="relative rounded-2xl bg-[#0a0a0f] p-8 h-full">
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4A017] opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#D4A017]" />
                  </span>
                  <span className="text-xs text-[#D4A017]/60">Open Now</span>
                </div>
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D4A017]/20 text-lg">📍</span>
                  <h3 className="text-xl font-bold text-white">Rodeo Grill <span className="text-[#D4A017]">NORTE</span></h3>
                </div>
                <div className="space-y-3 text-sm text-gray-300">
                  <p className="font-medium text-white">La Esperanza</p>
                  <p>Carr. de la Esperanza Km4.8, La Esperanza</p>
                  <p>📞 <a href="tel:+349****3900" className="text-[#D4A017] transition hover:text-[#F5D061]">922 443 900</a></p>
                  <div className="text-gray-400">
                    <p>Mon &amp; Thu: 13:00 – 18:00</p>
                    <p>Fri: 13:00 – 23:00</p>
                    <p>Sat: 12:00 – 23:00</p>
                    <p>Sun: 12:00 – 20:00</p>
                  </div>
                  <a href="https://maps.google.com/?q=Carr.+de+la+Esperanza+Km4.8,+La+Esperanza" target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-[#D4A017] underline transition hover:text-[#F5D061]">View on Google Maps →</a>
                </div>
              </div>
            </TiltCard>
          </div>
        </motion.div>

        {/* ── Menu & Pricing ── */}
        <motion.div
          id="menu"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 80, damping: 15 }}
          className="mb-20"
        >
          <div className="mb-12 text-center">
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mb-4 block text-xs uppercase tracking-[0.3em] text-[#D4A017]/60"
            >
              Menu &amp; Prices
            </motion.span>
            <h2 className="text-3xl font-bold text-white md:text-4xl gradient-text">Our Rodizio Experience</h2>
            <p className="mx-auto mt-4 max-w-xl text-gray-400">All-you-can-eat rodizio including hot &amp; cold buffet and traditional sides.</p>
          </div>

          {/* ── Glassmorphism Pricing Cards ── */}
          <div className="mb-16 grid gap-6 md:grid-cols-3">
            {[
              { label: "Adults", price: "31.90", desc: "Full rodizio + buffet", popular: true },
              { label: "Kids", price: "17.90", desc: "Ages 4–12, rodizio + buffet", popular: false },
              { label: "Desserts", price: "4.90", desc: "Homemade desserts per portion", popular: false },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, type: "spring", stiffness: 100, damping: 15 }}
                whileHover={{ y: -8, scale: 1.03 }}
                className={`relative rounded-2xl p-[1px] overflow-hidden ${
                  item.popular
                    ? "bg-gradient-to-b from-[#D4A017] via-[#8B1A1A] to-[#D4A017]"
                    : "bg-white/10"
                }`}
              >
                <div className={`relative rounded-2xl p-8 text-center h-full ${
                  item.popular
                    ? "bg-[#0a0a0f]"
                    : "glass"
                }`}>
                  {item.popular && (
                    <motion.span
                      initial={{ y: -20, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#D4A017] to-[#F5D061] px-4 py-1 text-xs font-bold text-black shadow-lg"
                    >
                      ★ Most Popular ★
                    </motion.span>
                  )}
                  <h3 className="mb-2 text-lg font-semibold text-white">{item.label}</h3>
                  {/* ── Animated Price Tag with Glow ── */}
                  <motion.p
                    className="mb-4 text-4xl font-black"
                    whileHover={{ scale: 1.1, textShadow: "0 0 20px rgba(212,160,23,0.6)" }}
                  >
                    <span className="text-lg font-normal text-gray-400">€</span>
                    <span className="gradient-text-gold">{item.price}</span>
                  </motion.p>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ── Gradient Divider ── */}
          <div className="mx-auto mb-12 h-[1px] max-w-2xl bg-gradient-to-r from-transparent via-[#D4A017]/40 to-transparent" />

          {/* Premium Cuts */}
          <h3 className="mb-8 text-center text-2xl font-bold text-white">🔥 Premium Cuts</h3>
          <div className="mb-16 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {MEATS.map((meat, i) => (
              <motion.div
                key={meat.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, type: "spring", stiffness: 100, damping: 12 }}
                whileHover={{ scale: 1.05, y: -4 }}
                className="glow-card rounded-xl p-5"
              >
                <span className="mb-2 inline-block rounded bg-[#D4A017]/20 px-2 py-0.5 text-xs font-medium text-[#D4A017]">#{(i + 1).toString().padStart(2, "0")}</span>
                <h4 className="text-base font-semibold text-white">{meat.name}</h4>
                <p className="mt-1 text-xs text-gray-400">{meat.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Gradient Divider */}
          <div className="mx-auto mb-12 h-[1px] max-w-2xl bg-gradient-to-r from-transparent via-[#D4A017]/30 to-transparent" />

          {/* Starters */}
          <h3 className="mb-8 text-center text-2xl font-bold text-white">🥟 Starters &amp; Sides</h3>
          <div className="mb-16 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {STARTERS.map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, type: "spring", stiffness: 100, damping: 12 }}
                whileHover={{ scale: 1.05, y: -4 }}
                className="glow-card rounded-xl p-5"
              >
                <h4 className="text-base font-semibold text-white">{item.name}</h4>
                <p className="mt-1 text-xs text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Gradient Divider */}
          <div className="mx-auto mb-12 h-[1px] max-w-2xl bg-gradient-to-r from-transparent via-[#D4A017]/30 to-transparent" />

          {/* Desserts */}
          <h3 className="mb-8 text-center text-2xl font-bold text-white">🍰 Homemade Desserts</h3>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {DESSERTS.map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, type: "spring", stiffness: 100, damping: 12 }}
                whileHover={{ scale: 1.08, y: -6 }}
                className="glow-card rounded-xl p-5 text-center"
              >
                <h4 className="text-sm font-semibold text-white">{item.name}</h4>
                <p className="mt-1 text-xs text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
