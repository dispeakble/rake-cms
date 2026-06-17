// Auto-generated Services component

export default function Services() {
  const services = [
  "Service 1",
  "Service 2",
  "Service 3"
];

  return (
    <section id="services" className="bg-muted/50 px-4 py-20">
      <div className="container mx-auto max-w-5xl">
        <h2 className="mb-12 text-center text-3xl font-bold">Our Services</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {services.map((service: string, i: number) => (
            <div key={i} className="rounded-xl border bg-card p-6 transition-shadow hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#3b82f6]/10 text-xl font-bold text-[#3b82f6]">
                {i + 1}
              </div>
              <h3 className="mb-2 text-lg font-semibold">{service}</h3>
              <p className="text-sm text-muted-foreground">
                Learn more about our {service.toLowerCase()} offerings.
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
