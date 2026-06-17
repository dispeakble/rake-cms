// Auto-generated Footer component
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t bg-card px-4 py-12">
      <div className="container mx-auto max-w-5xl">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h4 className="mb-3 font-semibold">La Tajea, Pje. Cabezos Sau 10, 38679 Adeje, Santa Cruz de Tenerife</h4>
            <p className="text-sm text-muted-foreground">
              Serving our community with excellence.
            </p>
          </div>
          <div>
            <h4 className="mb-3 font-semibold">Quick Links</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <Link href="/" className="block hover:text-foreground">Home</Link>
              <Link href="/about" className="block hover:text-foreground">About</Link>
              <Link href="/services" className="block hover:text-foreground">Services</Link>
              <Link href="/contact" className="block hover:text-foreground">Contact</Link>
            </div>
          </div>
          <div>
            <h4 className="mb-3 font-semibold">Contact</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>Made with ❤️ by{' '}
            <Link href="https://alexawebservers.com" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
              alexawebservers.com
            </Link>
          </p>
          <p className="mt-1">&copy; 2026 La Tajea, Pje. Cabezos Sau 10, 38679 Adeje, Santa Cruz de Tenerife. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
