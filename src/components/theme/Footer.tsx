"use client";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/5 bg-[var(--theme-dark)] px-4 pt-20 pb-8">
      {/* Background pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{ backgroundImage: "radial-gradient(circle at 25px 25px, white 1px, transparent 0)", backgroundSize: "50px 50px" }}
      />

      <div className="container relative mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[var(--theme-secondary)] text-lg font-black text-[var(--theme-secondary)]">
                RG
              </div>
              <div>
                <p className="text-lg font-bold text-white">Rodeo Grill</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--theme-secondary)]">
                  Churrasquería
                </p>
              </div>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-gray-500">
              El auténtico rodizio brasileño en Tenerife. Dos ubicaciones, una experiencia inolvidable.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-5 text-xs font-semibold uppercase tracking-widest text-gray-400">
              Navegación
            </h4>
            <div className="space-y-3 text-sm">
              {[
                { href: "/", label: "Inicio" },
                { href: "/carta", label: "Carta" },
                { href: "/ubicaciones", label: "Ubicaciones" },
                { href: "/contacto", label: "Contacto" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-gray-500 transition hover:text-[var(--theme-secondary)]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Locations */}
          <div>
            <h4 className="mb-5 text-xs font-semibold uppercase tracking-widest text-gray-400">
              Ubicaciones
            </h4>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-medium text-white">Rodeo Norte</p>
                <p className="text-gray-500">La Esperanza</p>
                <p className="text-[var(--theme-secondary)]">922 123 456</p>
              </div>
              <div>
                <p className="font-medium text-white">Rodeo Sur</p>
                <p className="text-gray-500">Costa Adeje</p>
                <p className="text-[var(--theme-secondary)]">922 789 012</p>
              </div>
            </div>
          </div>

          {/* Social / Hours */}
          <div>
            <h4 className="mb-5 text-xs font-semibold uppercase tracking-widest text-gray-400">
              Horarios
            </h4>
            <div className="space-y-2 text-sm text-gray-500">
              <p>Jueves - Viernes</p>
              <p className="text-white">19:00 - 23:00</p>
              <p className="mt-3">Sábado - Domingo</p>
              <p className="text-white">13:00 - 23:00</p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 border-t border-white/5 pt-8 text-center"
        >
          <p className="text-sm text-gray-500">
            Made with{' '}
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="inline-block"
            >
              ❤️
            </motion.span>{' '}
            by{' '}
            <Link
              href="https://alexawebservers.com"
              className="font-medium text-[var(--theme-secondary)] transition hover:text-white"
              target="_blank"
              rel="noopener noreferrer"
            >
              alexawebservers.com
            </Link>
          </p>
          <p className="mt-2 text-xs text-gray-600">
            &copy; {year} Churrasquería Rodeo Grill. Todos los derechos reservados.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
