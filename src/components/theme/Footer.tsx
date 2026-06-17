// Auto-generated Footer — links derived from seeded pages only
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t bg-muted/30 px-4 py-16">
      <div className="container mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <h4 className="mb-4 text-lg font-semibold">Churrasquería Rodeo Grill, Tenerife</h4>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Serving our community with dedication and excellence.
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Quick Links</h4>
            <div className="space-y-3 text-sm">
              <Link href="/" className="block text-muted-foreground transition hover:text-foreground">Home</Link>
          <Link href="/about" className="block text-muted-foreground transition hover:text-foreground">About</Link>
          <Link href="/services" className="block text-muted-foreground transition hover:text-foreground">Services</Link>
          <Link href="/contact" className="block text-muted-foreground transition hover:text-foreground">Contact</Link>
          <Link href="/blog" className="block text-muted-foreground transition hover:text-foreground">Blog</Link>
            </div>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Contact</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              
              
            </div>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>Made with ❤️ by{" "}
            <Link href="https://alexawebservers.com" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
              alexawebservers.com
            </Link>
          </p>
          <p className="mt-1">&copy; 2026 Churrasquería Rodeo Grill, Tenerife. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
