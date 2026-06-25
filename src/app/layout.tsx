import type { Metadata } from "next";
import "./globals.css";
import "@/components/theme/theme.css";
import { auth } from "@/auth";
import AdminToolbar from "@/components/admin/AdminToolbar";

// Default metadata — per-site titles are set via generateMetadata on the home page
export const metadata: Metadata = {
  title: {
    default: "Rake CMS",
    template: "%s",
  },
  description: "A modern CMS like WordPress built with Next.js",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased font-sans">
        {isLoggedIn && <AdminToolbar />}
        {children}
      </body>
    </html>
  );
}
