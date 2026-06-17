// Auto-generated Hero component for La Tajea, Pje. Cabezos Sau 10, 38679 Adeje, Santa Cruz de Tenerife
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#3b82f6] to-[#6b7280] px-4 py-24 text-white">
      <div className="container mx-auto max-w-5xl text-center">
        <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-6xl">
          La Tajea, Pje. Cabezos Sau 10, 38679 Adeje, Santa Cruz de Tenerife
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-white/80">
          We are La Tajea, Pje. Cabezos Sau 10, 38679 Adeje, Santa Cruz de Tenerife, serving the local area.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/contact"
            className="rounded-lg bg-white px-8 py-3 font-semibold text-[#3b82f6] hover:bg-white/90"
          >
            Get in Touch
          </Link>
          <Link
            href="/about"
            className="rounded-lg border border-white/30 px-8 py-3 font-semibold text-white hover:bg-white/10"
          >
            Learn More
          </Link>
        </div>
      </div>
    </section>
  );
}
