// ============================================================
//  Footer — Gradient Background + Glow Links + Animated Border
//  MAXIMUM WOW EDITION — Full Legal + Transparencia + PDFs
// ============================================================

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useLanguage } from "@/lib/i18n";

export default function Footer() {
  const { t, lang } = useLanguage();
  const __ = (m: Record<string,string>) => m[lang] || m.es || "";
  return (
    <footer className="relative px-4 py-16 overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-section" />
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-gold) 50%, var(--color-primary) 100%)",
          backgroundSize: "400% 400%",
          animation: "gradient 6s ease infinite",
        }}
      />

      {/* Animated Border Top */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: "linear-gradient(90deg, transparent, var(--color-gold), var(--color-primary), var(--color-gold), transparent)",
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
              <span className="gradient-text-gold">Mario Viajes</span>
            </h4>
            <p className="max-w-sm text-sm leading-relaxed text-gray-400">
              {__({"es":"Tenerife es considerada como la isla de la \"primavera eterna\" con un clima suave durante todo el año. Es la isla más alta de las siete Islas Canarias debido al volcán Teide, que es 3718 metros de altura, siendo el pico más alto de España. [...]","en":"Tenerife is considered to be the island of \"eternal spring\" with a gentle climate throughout the year. It is the tallest island of the seven Canary Islands due to the Teide volcano, which is 3718 meters high, being the highest peak of Spain.[...]","hu":"Tenerifét az „örök tavasz” szigetének nevezik, hiszen egész évben enyhe klíma jellemzi. A hét Kanári-sziget közül a legmagasabb, itt található a Teide vulkán, ami 3718 m-es magasságával egyben Spanyolország legmagasabb pontja is. [...]","ro":"Tenerife este considerata a fi insula “ eternei primaveri” avand un climat bland pe tot parcursul anului. Ea este cea mai inalta insula dintre cele 7 insule canare datorita vulcanului Teide care are o inaltime de 3718 metri, fiind cel mai inalt varf al Spaniei . [...]"})}
            </p>
            {/* Address */}
            <p className="mt-4 text-xs text-gray-500 leading-relaxed">
              Mario Viajes, Calle Montana Clara nr.6, C.C. Laurisilva Local 6 I, 38679, Adeje, Tenerife
            </p>
            {/* Social / Watermark link with Glow Hover */}
            <div className="mt-6 flex gap-4">
              <motion.a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2, y: -2 }}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm text-gray-400 transition-all duration-300 hover:border-[var(--color-gold)]/50 hover:bg-[var(--color-gold)]/10 hover:text-[var(--color-gold)] hover:shadow-[0_0_15px_rgba(var(--color-gold-rgb), 0.3)] cursor-pointer"
                style={{cursor:'pointer'}}
              >
                f
              </motion.a>
              <motion.a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2, y: -2 }}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm text-gray-400 transition-all duration-300 hover:border-[var(--color-gold)]/50 hover:bg-[var(--color-gold)]/10 hover:text-[var(--color-gold)] hover:shadow-[0_0_15px_rgba(var(--color-gold-rgb), 0.3)] cursor-pointer"
                style={{cursor:'pointer'}}
              >
                ig
              </motion.a>
              <motion.a
                href="https://tripadvisor.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2, y: -2 }}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm text-gray-400 transition-all duration-300 hover:border-[var(--color-gold)]/50 hover:bg-[var(--color-gold)]/10 hover:text-[var(--color-gold)] hover:shadow-[0_0_15px_rgba(var(--color-gold-rgb), 0.3)] cursor-pointer"
                style={{cursor:'pointer'}}
              >
                ta
              </motion.a>
            </div>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">{t("footer.links")}</h4>
            <div className="space-y-3 text-sm">
              <Link href="/#about" className="block text-sm text-gray-400 transition-all duration-300 hover:text-[var(--color-gold)] hover:translate-x-1 cursor-pointer">Sobre nosotros</Link>
          <Link href="/#services" className="block text-sm text-gray-400 transition-all duration-300 hover:text-[var(--color-gold)] hover:translate-x-1 cursor-pointer">Qué ofrecemos</Link>
          <Link href="/#excursions" className="block text-sm text-gray-400 transition-all duration-300 hover:text-[var(--color-gold)] hover:translate-x-1 cursor-pointer">Excursiones</Link>
            </div>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">{t("footer.legal_heading")}</h4>
            <div className="space-y-3 text-sm text-gray-400">
              <a
                href="https://marioviajes.com/docs/Legal-Term-Mario-Viajes-Esp.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="block transition-all duration-200 hover:text-[var(--color-gold)] hover:translate-x-1 cursor-pointer"
                style={{cursor:'pointer'}}
              >{t("footer.legal")}</a>
              <a
                href="https://marioviajes.com/docs/MEMORIA-TRANSPARENCIA-MARIO-VIAJES.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="block transition-all duration-200 hover:text-[var(--color-gold)] hover:translate-x-1 cursor-pointer"
                style={{cursor:'pointer'}}
              >{t("footer.transparency")}</a>
              <Link
                href="/legal"
                className="block transition-all duration-200 hover:text-[var(--color-gold)] hover:translate-x-1 cursor-pointer"
                style={{cursor:'pointer'}}
              >{t("footer.legal_notice")}</Link>
              <Link
                href="/privacy"
                className="block transition-all duration-200 hover:text-[var(--color-gold)] hover:translate-x-1 cursor-pointer"
                style={{cursor:'pointer'}}
              >{t("footer.privacy")}</Link>
            </div>
          </div>
        </motion.div>

        {/* ── Full Legal Text Section (preserved from original site) ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-8 border-t border-white/10 pt-6"
        >
          <div className="max-w-full text-xs text-gray-500 leading-relaxed space-y-3">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
              <a
                href="https://marioviajes.com/docs/Legal-Term-Mario-Viajes-Esp.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 font-medium text-xs uppercase tracking-wider hover:text-[var(--color-gold)] transition-colors cursor-pointer"
              >{t("footer.legal")}</a>
              <span className="text-gray-600 text-xs">|</span>
              <a
                href="https://marioviajes.com/docs/MEMORIA-TRANSPARENCIA-MARIO-VIAJES.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 font-medium text-xs uppercase tracking-wider hover:text-[var(--color-gold)] transition-colors cursor-pointer"
              >{t("footer.transparency")}</a>
            </div>
            <p>
              {__({"es":"De conformidad con lo dispuesto en el artículo 10 de la Ley 34/2002, de 11 de julio, de servicios de la sociedad de la información y de comercio electrónico, se informa al usuario que el titular del presente sitio web es Mario Viajes S.L.U., con domicilio en la dirección registrada, con CIF/NIF correspondiente, Agencia de Viajes legalmente constituida. La actividad comprende la organización y comercialización de viajes combinados. Así mismo se informa que se encuentra a disposición de nuestros clientes las correspondientes hojas de reclamaciones debidamente autorizadas.","en":"In accordance with the provisions of Article 10 of Law 34/2002, of July 11, on information society services and electronic commerce, the user is informed that the owner of this website is Mario Viajes S.L.U., with registered address, with corresponding Tax ID, Travel Agency legally constituted. The activity includes the organization and marketing of package tours. Likewise, complaint forms duly authorized are available to our customers."})}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 border-t border-white/10 pt-8 text-center text-xs text-gray-500 leading-relaxed"
        >
          <p className="mt-4">&copy; 2026 Mario Viajes. {t("footer.copyright")}</p>
          <p className="mt-2">CIF: B-12345678 | I-AV: I-AV-0001234.4</p>
          <p className="mt-2">Mario Viajes, Calle Montana Clara nr.6, C.C. Laurisilva Local 6 I, 38679, Adeje, Tenerife</p>
          <p className="mt-2">{t("footer.made_with")} <a href="https://alexawebservers.com" target="_blank" rel="noopener noreferrer" className="text-[var(--color-gold)] hover:text-[var(--color-gold-light)] transition-colors cursor-pointer" style={{cursor:'pointer'}}>alexawebservers.com</a></p>
        </motion.div>
      </div>
    </footer>
  );
}
