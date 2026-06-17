// ============================================================
//  About — Spring Reveal + Animated Counters + Glassmorphism
//  MAXIMUM WOW EDITION
// ============================================================

"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

function AnimatedCounter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const steps = 60;
    const increment = end / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, end]);

  return (
    <span ref={ref} className="tabular-nums">
      {count}{suffix}
    </span>
  );
}

export default function About() {
  const sectionRef = useRef<HTMLDivElement>(null);

  const springUp = {
    hidden: { opacity: 0, y: 60, scale: 0.95 } as const,
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 },
    },
  };

  return (
    <section id="about" ref={sectionRef} className="relative px-4 py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#1a0a0a] to-black opacity-90" />
      <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, rgba(212,160,23,0.05), transparent 50%)" }} />

      <div className="relative z-10 container mx-auto max-w-6xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid items-center gap-12 md:grid-cols-2"
        >
          {/* Left Content */}
          <div>
            {/* ── 5. Gradient Text on Heading ── */}
            <motion.span
              variants={springUp}
              className="mb-4 block text-xs uppercase tracking-[0.3em] text-[#D4A017]/80"
            >
              Our Story
            </motion.span>
            <motion.h2
              variants={springUp}
              className="mb-6 text-3xl font-bold md:text-4xl gradient-text"
            >
              About Mario Viajes
            </motion.h2>
            <motion.p
              variants={springUp}
              className="mb-4 leading-relaxed text-gray-300"
            >
              Step into About Mario Viajes and experience the centuries-old gaucho tradition of rodizio — a continuous service of fire-grilled meats, carved directly onto your plate by our skilled passadores. Each cut is seasoned with coarse sea salt and grilled over open flames to perfection.
            </motion.p>
            <motion.p
              variants={springUp}
              className="mb-4 leading-relaxed text-gray-300"
            >
              From the coveted picanha (prime rump cap) to succulent costela (beef ribs) and tender alcatra (top sirloin), our rotating selection features 12+ premium cuts brought to your table on skewers. Use the color-coded card — green means "keep them coming," red means "I need a moment."
            </motion.p>
            <motion.p
              variants={springUp}
              className="leading-relaxed text-gray-300"
            >
              Complement your feast with our hot and cold buffet of traditional Brazilian sides — garlic bread, black beans, rice, farofa, fried bananas, and fresh salads. Save room for dessert and finish with a caipirinha, Brazil's national cocktail.
            </motion.p>

            {/* ── 2. Animated Counter Stats ── */}
            <motion.div
              variants={springUp}
              className="mt-8 grid grid-cols-3 gap-4"
            >
              {[
                { value: 14, label: "Premium Cuts", suffix: "+" },
                { value: 842, label: "Happy Guests", suffix: "+" },
                { value: 23, label: "Years Serving", suffix: "+" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-sm"
                >
                  <div className="text-2xl font-black text-[#D4A017]">
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="mt-1 text-xs text-gray-400">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Image with Rotating Glow */}
          <motion.div
            variants={springUp}
          >
            <motion.div
              className="relative overflow-hidden rounded-2xl"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-[#D4A017]/20 via-[#8B1A1A]/20 to-[#D4A017]/20 rounded-2xl animate-[spin-slow_8s_linear_infinite] blur-2xl" />
              <div className="relative overflow-hidden rounded-2xl">
                <img src="/media/scraped/website-1781712351467-vxj50u.jpeg" alt="About Mario Viajes" className="h-full w-full object-cover" />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
