// Auto-generated Services — locations, menu, meat types, starters, desserts
"use client";

import { motion } from "framer-motion";

const MEATS = [{"name":"Picanha","desc":"Prime rump cap — the crown jewel of churrasco"},{"name":"Alcatra","desc":"Tender top sirloin, grilled to juicy perfection"},{"name":"Costela","desc":"Succulent beef ribs, slow-roasted until fall-off-the-bone"},{"name":"Maminha","desc":"Flavorful bottom sirloin, beautifully marbled"},{"name":"Lomo","desc":"Premium pork tenderloin, seasoned and fire-grilled"},{"name":"Frango","desc":"Chicken thighs and drumsticks, marinated in citrus and herbs"},{"name":"Cordeiro","desc":"Herb-crusted lamb chops, smoky and tender"},{"name":"Linguica","desc":"Spicy Portuguese sausage with a perfect char"}];
const STARTERS = [{"name":"Pão de Queijo","desc":"Cheese bread — warm, chewy, and addictive"},{"name":"Polenta Frita","desc":"Crispy fried polenta sticks with garlic aioli"},{"name":"Azeitonas","desc":"Mixed marinated olives with herbs and olive oil"},{"name":"Salada Tropical","desc":"Fresh garden salad with hearts of palm"}];
const DESSERTS = [{"name":"Tres Leches","desc":"Three-milk sponge cake with vanilla whipped cream"},{"name":"Pudim","desc":"Classic Brazilian flan with caramel sauce"},{"name":"Mousse de Chocolate","desc":"Rich Belgian chocolate mousse"},{"name":"Tarta de Limón","desc":"Zesty lemon meringue pie with toasted meringue"},{"name":"Helado Artesanal","desc":"Artisan ice cream — vanilla, dulce de leche, or coconut"},{"name":"Fruta Fresca","desc":"Seasonal fresh fruit platter with honey-lime drizzle"}];

export default function Services() {
  return (
    <section id="services" className="relative px-4 py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0d] via-[#1a0808] to-[#0d0d0d]" />
      <div className="relative z-10 container mx-auto max-w-6xl">

        {/* ── Locations ── */}
        <motion.div
          id="locations"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <div className="mb-12 text-center">
            <span className="mb-4 block text-xs uppercase tracking-[0.3em] text-amber-500/60">Our Locations</span>
            <h2 className="text-3xl font-bold text-white md:text-4xl">Find Your Nearest Rodeo Grill</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            {/* SUR */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="group rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition hover:border-amber-600/40 hover:bg-white/10"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20 text-lg">📍</span>
                <h3 className="text-xl font-bold text-white">Rodeo Grill <span className="text-amber-400">SUR</span></h3>
              </div>
              <div className="space-y-3 text-sm text-gray-300">
                <p className="font-medium text-white">Costa Adeje</p>
                <p>C. Dublin 1, 38660 Costa Adeje</p>
                <p>📞 <a href="tel:+34922713255" className="text-amber-400 transition hover:text-amber-300">922 713 255</a></p>
                <p className="text-gray-400">Wed — Sun: 14:00 – 23:00</p>
                <a href="https://maps.google.com/?q=C.+Dublin+1,+38660+Costa+Adeje" target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-amber-500 underline transition hover:text-amber-400">View on Google Maps →</a>
              </div>
            </motion.div>
            {/* NORTE */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="group rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition hover:border-amber-600/40 hover:bg-white/10"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20 text-lg">📍</span>
                <h3 className="text-xl font-bold text-white">Rodeo Grill <span className="text-amber-400">NORTE</span></h3>
              </div>
              <div className="space-y-3 text-sm text-gray-300">
                <p className="font-medium text-white">La Esperanza</p>
                <p>Carr. de la Esperanza Km4.8, La Esperanza</p>
                <p>📞 <a href="tel:+34922443900" className="text-amber-400 transition hover:text-amber-300">922 443 900</a></p>
                <div className="text-gray-400">
                  <p>Mon &amp; Thu: 13:00 – 18:00</p>
                  <p>Fri: 13:00 – 23:00</p>
                  <p>Sat: 12:00 – 23:00</p>
                  <p>Sun: 12:00 – 20:00</p>
                </div>
                <a href="https://maps.google.com/?q=Carr.+de+la+Esperanza+Km4.8,+La+Esperanza" target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-amber-500 underline transition hover:text-amber-400">View on Google Maps →</a>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* ── Menu & Pricing ── */}
        <motion.div
          id="menu"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <div className="mb-12 text-center">
            <span className="mb-4 block text-xs uppercase tracking-[0.3em] text-amber-500/60">Menu &amp; Prices</span>
            <h2 className="text-3xl font-bold text-white md:text-4xl">Our Rodizio Experience</h2>
            <p className="mx-auto mt-4 max-w-xl text-gray-400">All-you-can-eat rodizio including hot &amp; cold buffet and traditional sides.</p>
          </div>

          {/* Pricing cards */}
          <div className="mb-16 grid gap-6 md:grid-cols-3">
            {[
              { label: "Adults", price: "31.90", desc: "Full rodizio + buffet", popular: true },
              { label: "Kids", price: "17.90", desc: "Ages 4–12, rodizio + buffet", popular: false },
              { label: "Desserts", price: "4.90", desc: "Homemade desserts per portion", popular: false },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className={`relative rounded-2xl border p-8 text-center backdrop-blur-sm ${
                  item.popular
                    ? "border-amber-500/50 bg-amber-500/10 shadow-lg shadow-amber-500/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                {item.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-500 px-4 py-1 text-xs font-semibold text-black">
                    Most Popular
                  </span>
                )}
                <h3 className="mb-2 text-lg font-semibold text-white">{item.label}</h3>
                <p className="mb-4 text-4xl font-black text-white">
                  <span className="text-lg font-normal text-gray-400">€</span>{item.price}
                </p>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Meat selection */}
          <h3 className="mb-8 text-center text-2xl font-bold text-white">Premium Cuts</h3>
          <div className="mb-16 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {MEATS.map((meat, i) => (
              <motion.div
                key={meat.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                className="group rounded-xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-amber-600/30 hover:bg-white/[0.06]"
              >
                <span className="mb-2 inline-block rounded bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-400">#{i + 1}</span>
                <h4 className="text-base font-semibold text-white">{meat.name}</h4>
                <p className="mt-1 text-xs text-gray-400">{meat.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Starters */}
          <h3 className="mb-8 text-center text-2xl font-bold text-white">Starters &amp; Sides</h3>
          <div className="mb-16 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {STARTERS.map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-amber-600/30 hover:bg-white/[0.06]"
              >
                <h4 className="text-base font-semibold text-white">{item.name}</h4>
                <p className="mt-1 text-xs text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Desserts */}
          <h3 className="mb-8 text-center text-2xl font-bold text-white">Homemade Desserts</h3>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {DESSERTS.map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-5 text-center transition hover:border-amber-600/30 hover:bg-white/[0.06]"
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
