import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold">
            Rake CMS
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
              Sign In
            </Link>
            <Link
              href="/admin"
              className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
            >
              Admin
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-24 text-center">
          <div className="container mx-auto px-4">
            <h1 className="mb-6 text-5xl font-bold tracking-tight">
              Welcome to <span className="text-primary">Rake CMS</span>
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
              A modern content management system built with Next.js 15.
              Fast, secure, and fully extensible — just like WordPress, but for the modern web.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/admin"
                className="rounded-lg bg-primary px-6 py-3 text-primary-foreground hover:bg-primary/90"
              >
                Dashboard
              </Link>
              <Link
                href="/blog"
                className="rounded-lg border px-6 py-3 text-foreground hover:bg-muted"
              >
                View Blog
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t py-16">
          <div className="container mx-auto grid gap-8 px-4 md:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-lg border p-6">
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-4">
          &copy; {new Date().getFullYear()} Rake CMS. Built with Next.js.
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    title: "Block Editor",
    description: "A powerful Gutenberg-like block editor for creating rich content with drag-and-drop.",
  },
  {
    title: "Multi-Dialect DB",
    description: "Supports both PostgreSQL and MariaDB/MySQL through a unified Drizzle ORM layer.",
  },
  {
    title: "Role-Based Access",
    description: "Full WordPress-compatible role and capability system with Auth.js v5 integration.",
  },
  {
    title: "Media Library",
    description: "Upload, manage, and serve media with automatic thumbnail generation and S3 support.",
  },
  {
    title: "WP Migration",
    description: "Built-in CLI tools to import existing WordPress sites — database, files, and themes.",
  },
  {
    title: "Custom Post Types",
    description: "Extend content beyond posts and pages with custom post types, taxonomies, and fields.",
  },
];
