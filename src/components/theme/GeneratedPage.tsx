// ============================================================
//  GeneratedPage — Smooth Page Transition with AnimatePresence
//  MAXIMUM WOW EDITION
// ============================================================

"use client";

import "./theme.css";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/theme/Header";
import Footer from "@/components/theme/Footer";
import Hero from "@/components/theme/Hero";
import About from "@/components/theme/About";
import Services from "@/components/theme/Services";
import Reviews from "@/components/theme/Reviews";
import Contact from "@/components/theme/Contact";

export default function GeneratedPage() {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="page"
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.98 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex min-h-screen flex-col bg-black text-white"
      >
        <Header />
        <main className="flex-1">
          <Hero />
          <About />
          <Services />
          <Reviews />
          <Contact />
        </main>
        <Footer />
      </motion.div>
    </AnimatePresence>
  );
}
