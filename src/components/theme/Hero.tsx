// Auto-generated Hero
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-4"
      style={{ backgroundImage: 'url(/media/scraped/website-1781702197950-4aq4jf.avif)', backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 mx-auto max-w-4xl text-center text-white">
        <h1 className="mb-4 text-5xl font-bold tracking-tight md:text-7xl">
          We are Churrasquería Rodeo Grill, Tenerife, serving the local area.
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-lg text-white/80 md:text-xl">
          We are Churrasquería Rodeo Grill, Tenerife, serving the local area.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/contact"
            className="inline-flex items-center rounded-xl bg-white px-8 py-3.5 font-semibold text-[#000000] shadow-lg transition hover:bg-white/90 hover:shadow-xl"
          >
            Get in Touch
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center rounded-xl border-2 border-white/40 px-8 py-3.5 font-semibold text-white transition hover:border-white/70 hover:bg-white/10"
          >
            Learn More
          </Link>
        </div>
      </div>
    </section>
  );
}
