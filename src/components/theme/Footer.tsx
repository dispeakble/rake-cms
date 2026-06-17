// ============================================================
//  Footer — Gradient Background + Glow Links + Animated Border
//  MAXIMUM WOW EDITION
// ============================================================

"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="relative px-4 py-16 overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0a0f] to-[#1a0a0a]" />
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          background: "linear-gradient(135deg, #8B1A1A 0%, #D4A017 50%, #8B1A1A 100%)",
          backgroundSize: "400% 400%",
          animation: "gradient 6s ease infinite",
        }}
      />

      {/* Animated Border Top */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: "linear-gradient(90deg, transparent, #D4A017, #8B1A1A, #D4A017, transparent)",
          backgroundSize: "200% 100%",
          animation: "gradient 3s linear infinite",
        }}
      />

      <div className="relative z-10 container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 80, damping: 15 }}
          className="grid gap-10 md:grid-cols-4"
        >
          <div className="md:col-span-2">
            <h4 className="mb-4 text-lg font-semibold text-white">
              <span className="gradient-text-gold">Churrasquería Rodeo Grill, Tenerife</span>
            </h4>
            <p className="max-w-sm text-sm leading-relaxed text-gray-400">
              Authentic Brazilian rodizio. Endless meat, bold flavors, unforgettable moments.
            </p>
            {/* Social / Watermark link with Glow Hover */}
            <div className="mt-6 flex gap-4">
              <motion.a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2, y: -2 }}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm text-gray-400 transition-all duration-300 hover:border-[#D4A017]/50 hover:bg-[#D4A017]/10 hover:text-[#D4A017] hover:shadow-[0_0_15px_rgba(212,160,23,0.3)]"
              >
                f
              </motion.a>
              <motion.a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2, y: -2 }}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm text-gray-400 transition-all duration-300 hover:border-[#D4A017]/50 hover:bg-[#D4A017]/10 hover:text-[#D4A017] hover:shadow-[0_0_15px_rgba(212,160,23,0.3)]"
              >
                ig
              </motion.a>
              <motion.a
                href="https://tripadvisor.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2, y: -2 }}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm text-gray-400 transition-all duration-300 hover:border-[#D4A017]/50 hover:bg-[#D4A017]/10 hover:text-[#D4A017] hover:shadow-[0_0_15px_rgba(212,160,23,0.3)]"
              >
                ta
              </motion.a>
            </div>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">Quick Links</h4>
            <div className="space-y-3 text-sm">
              <Link href="/#about" className="block text-sm text-gray-400 transition-all duration-300 hover:text-[#D4A017] hover:translate-x-1">About</Link>
          <Link href="/#services" className="block text-sm text-gray-400 transition-all duration-300 hover:text-[#D4A017] hover:translate-x-1">Services</Link>
          <Link href="/#locations" className="block text-sm text-gray-400 transition-all duration-300 hover:text-[#D4A017] hover:translate-x-1">Locations</Link>
          <Link href="/#menu" className="block text-sm text-gray-400 transition-all duration-300 hover:text-[#D4A017] hover:translate-x-1">Menu</Link>
          <Link href="/#reviews" className="block text-sm text-gray-400 transition-all duration-300 hover:text-[#D4A017] hover:translate-x-1">Reviews</Link>
          <Link href="/#contact" className="block text-sm text-gray-400 transition-all duration-300 hover:text-[#D4A017] hover:translate-x-1">Contact</Link>
            </div>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">Follow Us</h4>
            <div className="space-y-3 text-sm text-gray-400">
              <motion.a
                href="#"
                whileHover={{ x: 4 }}
                className="block transition-all duration-200 hover:text-[#D4A017]"
              >Facebook</motion.a>
              <motion.a
                href="#"
                whileHover={{ x: 4 }}
                className="block transition-all duration-200 hover:text-[#D4A017]"
              >Instagram</motion.a>
              <motion.a
                href="#"
                whileHover={{ x: 4 }}
                className="block transition-all duration-200 hover:text-[#D4A017]"
              >Tripadvisor</motion.a>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 border-t border-white/10 pt-8 text-center text-sm text-gray-400"
        >
          <p>
            Made with ❤️ by{" "}
            <Link
              href="https://alexawebservers.com"
              className="bg-gradient-to-r from-[#8B1A1A] to-[#D4A017] bg-clip-text text-transparent font-semibold transition-all duration-300 hover:from-[#D4A017] hover:to-[#F5D061] hover:drop-shadow-[0_0_8px_rgba(212,160,23,0.5)]"
              target="_blank"
              rel="noopener noreferrer"
            >
              alexawebservers.com
            </Link>
          </p>
          <p className="mt-1">&copy; 2026 Churrasquería Rodeo Grill, Tenerife. All rights reserved.</p>
        </motion.div>
      </div>
    </footer>
  );
}
