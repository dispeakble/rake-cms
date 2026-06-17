// Auto-generated Contact
export default function Contact() {
  return (
    <section id="contact" className="px-4 py-20">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Contact Us</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">We'd love to hear from you.</p>
        </div>
        <div className="grid gap-12 md:grid-cols-2">
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-lg bg-[#000000]/10 text-lg">📍</div>
              <div><h3 className="font-semibold">Address</h3><p className="text-muted-foreground">Visit us</p></div>
            </div>
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-lg bg-[#000000]/10 text-lg">📞</div>
              <div><h3 className="font-semibold">Phone</h3><p className="text-muted-foreground">922 713 255</p></div>
            </div>
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-lg bg-[#000000]/10 text-lg">✉️</div>
              <div><h3 className="font-semibold">Email</h3><p className="text-muted-foreground">sur@churrasqueriarodeo.com</p></div>
            </div>
            
          </div>
          <div className="rounded-xl border bg-card p-8 shadow-sm">
            <form className="space-y-5">
              <div><label className="mb-1 block text-sm font-medium">Your Name</label><input type="text" placeholder="John Doe" className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm transition focus:border-[#000000] focus:outline-none focus:ring-2 focus:ring-[#000000]/20" /></div>
              <div><label className="mb-1 block text-sm font-medium">Your Email</label><input type="email" placeholder="john@example.com" className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm transition focus:border-[#000000] focus:outline-none focus:ring-2 focus:ring-[#000000]/20" /></div>
              <div><label className="mb-1 block text-sm font-medium">Your Message</label><textarea placeholder="Tell us about your needs..." rows={4} className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm transition focus:border-[#000000] focus:outline-none focus:ring-2 focus:ring-[#000000]/20" /></div>
              <button type="submit" className="w-full rounded-lg bg-[#000000] px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:opacity-90 hover:shadow-md">Send Message</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
