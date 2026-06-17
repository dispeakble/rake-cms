// Auto-generated Footer — section-anchor links, watermark
"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black px-4 py-16">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid gap-10 md:grid-cols-4"
        >
          <div className="md:col-span-2">
            <h4 className="mb-4 text-lg font-semibold text-white">Churrasquería Rodeo Grill, Tenerife</h4>
            <p className="max-w-sm text-sm leading-relaxed text-gray-400">
              Authentic Brazilian rodizio. Endless meat, bold flavors, unforgettable moments.
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">Quick Links</h4>
            <div className="space-y-3 text-sm">
              <Link href="/#about" className="block text-sm text-gray-400 transition hover:text-white">About</Link>
          <Link href="/#services" className="block text-sm text-gray-400 transition hover:text-white">Services</Link>
          <Link href="/#locations" className="block text-sm text-gray-400 transition hover:text-white">Locations</Link>
          <Link href="/#menu" className="block text-sm text-gray-400 transition hover:text-white">Menu</Link>
          <Link href="/#reviews" className="block text-sm text-gray-400 transition hover:text-white">Reviews</Link>
          <Link href="/#contact" className="block text-sm text-gray-400 transition hover:text-white">Contact</Link>
            </div>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">Follow Us</h4>
            <div className="space-y-3 text-sm text-gray-400">
              <p>Facebook</p>
              <p>Instagram</p>
              <p>Tripadvisor</p>
            </div>
          </div>
        </motion.div>
        <div className="mt-12 border-t border-white/10 pt-8 text-center text-sm text-gray-400">
          <p>
            Made with ❤️ by{" "}
            <Link href="https://alexawebservers.com" className="text-[#D4A017] hover:underline" target="_blank" rel="noopener noreferrer">
              alexawebservers.com
            </Link>
          </p>
          <p className="mt-1">&copy; 2026 Churrasquería Rodeo Grill, Tenerife. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
