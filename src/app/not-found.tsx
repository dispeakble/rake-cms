import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
      <p className="mt-4 text-lg text-muted-foreground">Page not found</p>
      <Link href="/" className="mt-6 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">Go Home</Link>
    </div>
  );
}
