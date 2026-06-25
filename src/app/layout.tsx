import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@/components/theme/theme.css";
import { auth } from "@/auth";
import AdminToolbar from "@/components/admin/AdminToolbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Default metadata — per-site titles are set via generateMetadata on the home page
export const metadata: Metadata = {
  title: {
    default: "Mario Viajes, Tenerife",
    template: "%s",
  },
  description: "A modern CMS like WordPress built with Next.js",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  icons: {
    icon: "/media/marioviajes/favicon.png",
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {isLoggedIn && <AdminToolbar />}
        {children}
      </body>
    </html>
  );
}
