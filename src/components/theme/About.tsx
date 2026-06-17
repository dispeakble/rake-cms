"use client";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

function FadeInSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="relative overflow-hidden bg-[var(--theme-cream)] px-4 py-24 md:py-32">
      {/* Background decoration */}
      <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full border border-[var(--theme-primary)]/5" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-80 w-80 rounded-full border border-[var(--theme-secondary)]/5" />

      <div className="container relative mx-auto max-w-7xl">
        <FadeInSection className="mb-16 text-center">
          <span className="mb-4 block text-xs uppercase tracking-[0.3em] text-[var(--theme-primary)]/60">
            Nuestra Historia
          </span>
          <h2 className="text-4xl font-black text-[var(--theme-accent)] md:text-5xl">
            El auténtico rodizio
            <br />
            <span className="text-[var(--theme-primary)]">brasileño en Tenerife</span>
          </h2>
        </FadeInSection>

        <div className="grid items-center gap-16 md:grid-cols-2">
          {/* Image */}
          <FadeInSection>
            <div className="relative">
              <div className="relative overflow-hidden rounded-3xl">
                <img
                  src="/media/scraped/about.jpg"
                  alt="Rodizio de carnes"
                  className="h-[500px] w-full object-cover transition duration-700 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
              {/* Floating badge */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="absolute -bottom-6 -left-6 rounded-2xl bg-[var(--theme-accent)] p-6 shadow-2xl"
              >
                <div className="text-3xl font-black text-[var(--theme-secondary)]">15+</div>
                <div className="mt-1 text-xs uppercase tracking-wider text-white/70">Años de tradición</div>
              </motion.div>
            </div>
          </FadeInSection>

          {/* Text */}
          <div className="space-y-8" ref={ref}>
            <FadeInSection>
              <p className="text-lg leading-relaxed text-gray-700">
                En <strong>Churrasquería Rodeo Grill</strong> vivimos y respiramos la cultura del rodizio. 
                Nuestros maestros asadores preparan cada corte con la tradición brasileña que nos caracteriza, 
                llevando a tu mesa una experiencia culinaria única en Tenerife.
              </p>
            </FadeInSection>

            <FadeInSection>
              <p className="text-gray-600 leading-relaxed">
                Con dos ubicaciones estratégicas — <strong>Rodeo Norte en La Esperanza</strong> y{' '}
                <strong>Rodeo Sur en Costa Adeje</strong> — ofrecemos el auténtico rodizio brasileño 
                con carnes seleccionadas, acompañamientos tradicionales y un ambiente que invita a disfrutar.
              </p>
            </FadeInSection>

            <FadeInSection>
              <div className="grid grid-cols-2 gap-4 rounded-2xl bg-white p-6 shadow-lg">
                {[
                  { label: "Carnes seleccionadas", desc: "Cortes premium" },
                  { label: "Rodizio sin fin", desc: "Todo lo que puedas comer" },
                  { label: "Acompañamientos", desc: "Tradicionales brasileños" },
                  { label: "Ambiente único", desc: "Familia y amigos" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="rounded-xl border border-gray-100 p-4 text-center"
                  >
                    <div className="text-sm font-bold text-[var(--theme-primary)]">{item.label}</div>
                    <div className="text-xs text-gray-500">{item.desc}</div>
                  </motion.div>
                ))}
              </div>
            </FadeInSection>
          </div>
        </div>
      </div>
    </section>
  );
}
