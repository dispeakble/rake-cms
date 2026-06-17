// Auto-generated Services
export default function Services() {
  const services = [{"title":"Product Selection","description":"Browse our carefully curated collection of products. We pride ourselves on offering only the highest quality items."},{"title":"Personal Shopping","description":"Not sure what you're looking for? Our friendly staff are always on hand to help you find exactly what you need."},{"title":"Online Store","description":"Shop from the comfort of your home. Fast delivery and easy returns on all online purchases."}];
  return (
    <section id="services" className="bg-muted/50 px-4 py-20">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Our Services</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">Discover what we offer.</p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service: { title: string; description: string }, i: number) => (
            <div key={i} className="group rounded-xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#000000]/10 text-xl font-bold text-[#000000] transition group-hover:bg-[#000000] group-hover:text-white">{i + 1}</div>
              <h3 className="mb-2 text-lg font-semibold">{service.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
