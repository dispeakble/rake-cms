// Auto-generated Header — links derived from seeded pages only
"use client";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Churrasquería Rodeo Grill, Tenerife
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/" className="block text-sm font-medium text-muted-foreground transition hover:text-foreground">Home</Link>
          <Link href="/about" className="block text-sm font-medium text-muted-foreground transition hover:text-foreground">About</Link>
          <Link href="/services" className="block text-sm font-medium text-muted-foreground transition hover:text-foreground">Services</Link>
          <Link href="/contact" className="block text-sm font-medium text-muted-foreground transition hover:text-foreground">Contact</Link>
          <Link href="/blog" className="block text-sm font-medium text-muted-foreground transition hover:text-foreground">Blog</Link>
        </nav>
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          <span className="text-2xl">{open ? "✕" : "☰"}</span>
        </button>
      </div>
      {open && (
        <div className="border-t px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            <Link href="/" className="text-sm font-medium" onClick={() => setOpen(false)}>Home</Link>
          <Link href="/about" className="text-sm font-medium" onClick={() => setOpen(false)}>About</Link>
          <Link href="/services" className="text-sm font-medium" onClick={() => setOpen(false)}>Services</Link>
          <Link href="/contact" className="text-sm font-medium" onClick={() => setOpen(false)}>Contact</Link>
          <Link href="/blog" className="text-sm font-medium" onClick={() => setOpen(false)}>Blog</Link>
          </div>
        </div>
      )}
    </header>
  );
}
