import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rockinrarecollectibles.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Rockin Rare Collectibles | Trading Cards, Pokemon, Slabs & Sealed Product",
  description:
    "Collector-first trading cards, sealed product, slabs, Japanese cards, singles, and rare finds with real product photos and transparent condition notes.",
  icons: {
    icon: [
      {
        url: "/brand/rockin-rare-favicon.png",
        sizes: "512x512",
        type: "image/png"
      }
    ],
    apple: [
      {
        url: "/brand/rockin-rare-favicon.png",
        sizes: "512x512",
        type: "image/png"
      }
    ]
  },
  openGraph: {
    title: "Rockin Rare Collectibles",
    description:
      "Collector-first trading cards, sealed product, slabs, Japanese cards, singles, and rare finds.",
    images: [
      {
        url: "/brand/rockin-rare-logo.jpg",
        width: 1024,
        height: 1024,
        alt: "Rockin Rare Collectibles"
      }
    ],
    siteName: "Rockin Rare Collectibles",
    type: "website"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
