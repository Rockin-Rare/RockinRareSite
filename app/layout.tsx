import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { CartProvider } from "@/components/cart/CartProvider";
import { JsonLd } from "@/components/JsonLd";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { absoluteUrl, contactEmail, defaultDescription, instagramHandle, shortSiteName, siteName, siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  title: {
    default: "Rockin Rare Collectibles | Pokemon, One Piece, Magic & Trading Cards",
    template: `%s | ${siteName}`
  },
  description: defaultDescription,
  keywords: [
    "Pokemon cards",
    "One Piece cards",
    "Magic The Gathering cards",
    "trading cards",
    "graded cards",
    "sealed Pokemon",
    "Japanese Pokemon cards",
    "Southern California collectibles"
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  },
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "256x256",
        type: "image/x-icon"
      },
      {
        url: "/favicon.png",
        sizes: "256x256",
        type: "image/png"
      },
      {
        url: "/brand/rockin-rare-favicon.png",
        sizes: "512x512",
        type: "image/png"
      }
    ],
    shortcut: ["/favicon.ico"],
    apple: [
      {
        url: "/brand/rockin-rare-favicon.png",
        sizes: "512x512",
        type: "image/png"
      }
    ]
  },
  openGraph: {
    title: siteName,
    description: defaultDescription,
    url: siteUrl,
    images: [
      {
        url: "/brand/rockin-rare-logo.jpg",
        width: 1024,
        height: 1024,
        alt: "Rockin Rare Collectibles"
      }
    ],
    siteName,
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: defaultDescription,
    images: ["/brand/rockin-rare-logo.jpg"]
  }
};

export const viewport: Viewport = {
  themeColor: "#0b0b0f"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": absoluteUrl("/#store"),
    name: siteName,
    alternateName: shortSiteName,
    url: siteUrl,
    logo: absoluteUrl("/brand/rockin-rare-logo.jpg"),
    image: absoluteUrl("/brand/rockin-rare-logo.jpg"),
    email: contactEmail,
    areaServed: "Southern California",
    sameAs: [`https://www.instagram.com/${instagramHandle}/`],
    description: defaultDescription,
    knowsAbout: ["Pokemon cards", "One Piece cards", "Magic: The Gathering cards", "graded cards", "sealed trading card products"]
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    name: siteName,
    url: siteUrl,
    publisher: {
      "@id": absoluteUrl("/#store")
    }
  };

  return (
    <html lang="en">
      <body>
        <CartProvider>
          <JsonLd data={[organizationSchema, websiteSchema]} />
          <Navbar />
          <main>{children}</main>
          <Footer />
          <Analytics />
        </CartProvider>
      </body>
    </html>
  );
}
