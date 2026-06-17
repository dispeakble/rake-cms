// Auto-generated Contact component

export default function Contact() {
  return (
    <section id="contact" className="px-4 py-20">
      <div className="container mx-auto max-w-5xl">
        <h2 className="mb-12 text-center text-3xl font-bold">Contact Us</h2>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="mt-1">📍</div>
              <div>
                <h3 className="font-semibold">Address</h3>
                <p className="text-muted-foreground">Visit us</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="mt-1">📞</div>
              <div>
                <h3 className="font-semibold">Phone</h3>
                <p className="text-muted-foreground">Call us</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="mt-1">✉️</div>
              <div>
                <h3 className="font-semibold">Email</h3>
                <p className="text-muted-foreground">Email us</p>
              </div>
            </div>
            
          </div>
          <div className="rounded-xl border bg-card p-6">
            <form className="space-y-4">
              <input type="text" placeholder="Your Name" className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm" />
              <input type="email" placeholder="Your Email" className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm" />
              <textarea placeholder="Your Message" rows={4} className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm" />
              <button type="submit" className="w-full rounded-lg bg-[#3b82f6] px-4 py-2 text-sm font-medium text-white hover:opacity-90">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
