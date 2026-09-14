import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: {
    template: "%s | Meridian Verified Marketplace",
    default: "Meridian | Verified Local Classifieds & Marketplace",
  },
  description:
    "Discover verified local classifieds, vehicles, real estate, professional services, and community listings. Built for safe, fast, transparent local trade.",
  keywords: [
    "classifieds",
    "local marketplace",
    "verified sellers",
    "cars for sale",
    "apartments for rent",
    "freelance services",
    "electronics",
  ],
  authors: [{ name: "Meridian Marketplace" }],
  creator: "Meridian Marketplace",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://meridianmarketplace.local",
    title: "Meridian | The Verified Classifieds & Local Marketplace",
    description:
      "Connecting local buyers and verified sellers across vehicles, properties, services, and merchandise with zero hidden fees.",
    siteName: "Meridian Marketplace",
  },
  twitter: {
    card: "summary_large_image",
    title: "Meridian | Verified Local Classifieds",
    description:
      "Trade safely with verified local sellers across cars, housing, jobs, and equipment.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased overflow-x-hidden">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
