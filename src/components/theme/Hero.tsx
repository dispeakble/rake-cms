// Auto-generated Hero — framer-motion parallax, floating decorations, staggered entrance
"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0.3]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.3 },
    },
  };

  const childVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section
      ref={ref}
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4"
      style={{ backgroundImage: 'url(/media/scraped/website-1781702958966-8al11e.avif)', backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      {/* Parallax background layer */}
      <motion.div
        className="absolute inset-0 bg-black/55"
        style={{ y, opacity }}
      />

      {/* Floating decorative circles */}
      <motion.div
        className="absolute top-20 left-10 h-40 w-40 rounded-full border border-white/10"
        animate={{ y: ["-10px", "10px", "-10px"] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 right-10 h-32 w-32 rounded-full border border-white/10"
        animate={{ y: ["10px", "-10px", "10px"] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute top-1/3 right-1/4 h-24 w-24 rounded-full border border-white/5"
        animate={{ y: ["-8px", "8px", "-8px"] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 0.5 }}
      />

      {/* Content */}
      <motion.div
        className="relative z-10 mx-auto max-w-4xl text-center text-white"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.span
          variants={childVariants}
          className="mb-6 inline-block text-xs uppercase tracking-[0.4em] text-white/60"
        >
          Brazilian Rodizio
        </motion.span>

        <motion.h1
          variants={childVariants}
          className="mb-6 text-5xl font-black tracking-tight md:text-7xl lg:text-8xl"
        >
          CARNE SIN FIN,<br />
          <span className="text-[#abb8c3]">SABOR SIN LÍMITE</span>
        </motion.h1>

        <motion.p
          variants={childVariants}
          className="mx-auto mb-12 max-w-2xl text-lg text-white/70 md:text-xl"
        >
          Bienvenido a Churrasquería Rodeo Grill, donde el auténtico rodizio brasileño cobra vida en Costa Adeje. Déjese llevar por el incesante desfile de carnes premium asadas a la perfección por nuestros gauchos.
        </motion.p>

        <motion.div
          variants={childVariants}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            href="/#menu"
            className="inline-flex items-center rounded-xl bg-white px-10 py-4 font-semibold text-[#000000] shadow-lg transition hover:bg-white/90 hover:shadow-xl"
          >
            See Menu &amp; Prices
          </Link>
          <Link
            href="/#contact"
            className="inline-flex items-center rounded-xl border-2 border-white/40 px-10 py-4 font-semibold text-white transition hover:border-white/70 hover:bg-white/10"
          >
            Reserve Your Table
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
