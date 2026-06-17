"use client";
import { motion } from "framer-motion";
import { useRef } from "react";
import { useInView } from "framer-motion";

const MENU_ITEMS = [
  {
    title: "Rodizio Premium",
    desc: "Carnes seleccionadas servidas en rodizio: picanha, alcatra, costela, linguica y más, preparadas a la brasa con la tradición brasileña.",
    icon: "🥩",
    price: "29.90€",
  },
  {
    title: "Acompañamientos",
    desc: "Arroz, feijoada, farofa, plátano frito, pan de ajo, ensaladas frescas y nuestros exclusivos vinagretes caseros.",
    icon: "🥗",
    price: "Incluido",
  },
  {
    title: "Bebidas & Cocktails",
    desc: "Caipirinha, cerveza artesanal, vinos seleccionados, refrescos y nuestra famosa limonada brasileña.",
    icon: "🍹",
    price: "Desde 3€",
  },
  {
    title: "Postres Caseros",
    desc: "Pastel de belém, pudim de leite condensado, mousse de maracuyá y nuestra tarta de chocolate brasileña.",
    icon: "🍰",
    price: "5.90€",
  },
  {
    title: "Menú Infantil",
    desc: "Pechuga de pollo a la parrilla, salchichas, patatas fritas y helado. Los más pequeños también disfrutan.",
    icon: "👶",
    price: "12.90€",
  },
  {
    title: "Eventos & Grupos",
    desc: "Celebra tu evento especial con nosotros. Menús personalizados para grupos de 10 a 100 personas.",
    icon: "🎉",
    price: "Consultar",
  },
];

function MenuCard({ item, index }: { item: typeof MENU_ITEMS[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="group rounded-3xl border border-gray-100 bg-white p-8 shadow-lg transition-shadow hover:shadow-2xl"
    >
      <div className="mb-6 flex items-center justify-between">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--theme-primary)]/5 text-2xl transition group-hover:bg-[var(--theme-primary)]/10">
          {item.icon}
        </span>
        <span className="rounded-full bg-[var(--theme-primary))]/10 px-4 py-1.5 text-sm font-bold text-[var(--theme-primary)]">
          {item.price}
        </span>
      </div>
      <h3 className="mb-3 text-xl font-bold text-[var(--theme-accent)]">{item.title}</h3>
      <p className="text-sm leading-relaxed text-gray-600">{item.desc}</p>
      <motion.div
        initial={{ width: 0 }}
        whileHover={{ width: "40%" }}
        className="mt-4 h-0.5 bg-[var(--theme-secondary)]"
      />
    </motion.div>
  );
}

export default function Services() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section id="services" className="relative bg-[var(--theme-accent)] px-4 py-24 md:py-32">
      {/* Background pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "radial-gradient(circle at 25px 25px, white 1px, transparent 0)", backgroundSize: "50px 50px" }}
      />

      <div className="container relative mx-auto max-w-7xl">
        <div ref={ref} className="mb-16 text-center">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            className="mb-4 block text-xs uppercase tracking-[0.3em] text-[var(--theme-secondary)]/70"
          >
            Nuestra Carta
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="text-4xl font-black text-white md:text-5xl"
          >
            Una experiencia{' '}
            <span className="text-[var(--theme-secondary)]">gastronómica</span>
            <br />
            que recordarás
          </motion.h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {MENU_ITEMS.map((item, i) => (
            <MenuCard key={i} item={item} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="mb-6 text-sm text-white/50">
            * Todos los precios incluyen IVA. Rodizio premium disponible de jueves a domingo.
          </p>
          <a
            href="/contacto"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--theme-secondary)] px-8 py-3.5 text-sm font-bold text-[var(--theme-accent)] transition hover:bg-white"
          >
            Reserva tu mesa
            <span>→</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
