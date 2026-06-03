import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { CategoryCard } from "@/components/marketing/CategoryCard";
import { FeaturedInventory } from "@/components/marketing/FeaturedInventory";
import { HeroProductStack } from "@/components/marketing/HeroProductStack";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { TrustPromise } from "@/components/marketing/TrustPromise";
import { Button } from "@/components/ui/Button";
import { getFeaturedProducts, getHeroShowcaseProducts } from "@/lib/products";
import { defaultDescription } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    absolute: "Rockin Rare Collectibles | Trading Card Games & Collectibles"
  },
  description: defaultDescription,
  alternates: {
    canonical: "/"
  }
};

const categories = [
  { title: "Pokemon", description: "Pokemon singles, sealed product, slabs, and collector favorites.", href: "/inventory?franchise=Pokemon" },
  { title: "One Piece", description: "One Piece sealed product, singles, and collector-ready inventory as it comes in.", href: "/inventory?franchise=One%20Piece" },
  { title: "Riftbound", description: "Riftbound cards, sealed product, and collector-ready inventory as the game grows.", href: "/inventory?franchise=Riftbound" },
  { title: "Magic: The Gathering", description: "Magic sealed product, singles, Commander staples, and collector pieces.", href: "/inventory?franchise=Magic%3A%20The%20Gathering" },
  { title: "Sealed, Slabs & Bundles", description: "Booster boxes, packs, graded cards, collector bundles, and curated lots.", href: "/inventory?category=sealed-slab-bundle" }
];

export default async function HomePage() {
  const [featured, heroProducts] = await Promise.all([getFeaturedProducts(8), getHeroShowcaseProducts(3)]);

  return (
    <Container>
      <section className="grid gap-10 py-10 lg:grid-cols-[1fr_0.9fr] lg:items-start lg:py-14">
        <div>
          <p className="text-sm font-semibold uppercase text-vault-gold">Pokemon / One Piece / Riftbound / Magic / Sealed / Slabs</p>
          <h1 className="mt-5 text-5xl font-black text-vault-text sm:text-6xl lg:text-7xl">Rockin Rare Collectibles</h1>
          <p className="mt-5 text-xl font-semibold text-vault-secondaryText">
            Collector-first trading card games, sealed product, slabs, and rare finds.
          </p>
          <p className="mt-6 max-w-2xl text-base leading-8 text-vault-secondaryText">
            Buy, sell, and trade collectibles with real product photos, transparent condition notes, secure packaging,
            and instant preliminary quotes for raw singles.
          </p>
          <div className="mt-7 flex items-center gap-4">
            <Image
              alt="Rockin Rare Collectibles rock hand logo"
              className="h-16 w-16 rounded-lg border border-vault-gold/40 bg-black object-cover shadow-gold"
              height={128}
              src="/brand/rockin-rare-logo.jpg"
              width={128}
            />
            <p className="max-w-md text-sm font-medium leading-6 text-vault-secondaryText">
              Southern California based, serving collectors with clear listings, careful packaging, and direct support
              for buying, selling, and trading.
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/inventory">Shop Current Inventory</Button>
            <Button href="/sell-trade" variant="secondary">
              Get Instant Quote
            </Button>
          </div>
          <p className="mt-4 text-sm leading-6 text-vault-muted">
            Want drop alerts and wishlist matching?{" "}
            <a className="font-semibold text-vault-secondaryText transition hover:text-vault-highlight" href="/collector-club">
              Join Collector Club
            </a>
            .
          </p>
        </div>
        <HeroProductStack products={heroProducts} />
      </section>

      <section className="rounded-2xl border border-vault-gold/30 bg-vault-elevated p-6 shadow-gold md:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.75fr)] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase text-vault-gold">Instant Quote Scanner</p>
            <h2 className="mt-3 text-3xl font-black text-vault-text">Get a preliminary cash or trade offer before you ship.</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-vault-secondaryText">
              Scan raw singles with your camera, upload front photos, or use the phone QR option. We&apos;ll match the cards,
              estimate cash and trade credit, and confirm the final offer after review.
            </p>
          </div>
          <div className="grid gap-3">
            <div className="rounded-xl border border-vault-border bg-vault-card p-4">
              <p className="text-sm font-semibold text-vault-text">1. Add front photos</p>
              <p className="mt-1 text-sm leading-6 text-vault-secondaryText">Camera, computer upload, or phone QR.</p>
            </div>
            <div className="rounded-xl border border-vault-border bg-vault-card p-4">
              <p className="text-sm font-semibold text-vault-text">2. Review the estimate</p>
              <p className="mt-1 text-sm leading-6 text-vault-secondaryText">See preliminary cash and trade-credit values.</p>
            </div>
            <Button href="/sell-trade" className="w-full">
              Start Instant Quote
            </Button>
          </div>
        </div>
      </section>

      <section className="py-8">
        <SectionHeader title="Collector Categories" description="Browse clean listings, clear condition details, and collector-focused card categories." />
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {categories.map((category) => (
            <CategoryCard key={category.title} {...category} />
          ))}
        </div>
      </section>

      <FeaturedInventory products={featured} />
      <TrustPromise />
    </Container>
  );
}
