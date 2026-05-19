import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { CategoryCard } from "@/components/marketing/CategoryCard";
import { FeaturedInventory } from "@/components/marketing/FeaturedInventory";
import { HeroProductStack } from "@/components/marketing/HeroProductStack";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { SellTradeCTA } from "@/components/marketing/SellTradeCTA";
import { TrustPromise } from "@/components/marketing/TrustPromise";
import { Button } from "@/components/ui/Button";
import { getFeaturedProducts, getHeroShowcaseProducts } from "@/lib/products";
import { defaultDescription } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    absolute: "Rockin Rare Collectibles | Pokemon, One Piece, Magic & Trading Cards"
  },
  description: defaultDescription,
  alternates: {
    canonical: "/"
  }
};

const categories = [
  { title: "Pokemon", description: "Pokemon singles, Japanese cards, sealed product, slabs, and collector favorites.", href: "/inventory" },
  { title: "One Piece", description: "One Piece sealed product, singles, and collector-ready inventory as it comes in.", href: "/inventory" },
  { title: "Magic: The Gathering", description: "Magic sealed product, singles, Commander staples, and collector pieces.", href: "/inventory" },
  { title: "Sealed, Slabs & Bundles", description: "Booster boxes, packs, graded cards, collector bundles, and curated lots.", href: "/inventory" }
];

export default async function HomePage() {
  const [featured, heroProducts] = await Promise.all([getFeaturedProducts(8), getHeroShowcaseProducts(3)]);

  return (
    <Container>
      <section className="grid gap-10 py-10 lg:grid-cols-[1fr_0.9fr] lg:items-start lg:py-14">
        <div>
          <p className="text-sm font-semibold uppercase text-vault-gold">
            Pokemon / One Piece / Magic: The Gathering / Japanese Cards / Singles / Sealed Product / Slabs
          </p>
          <h1 className="mt-5 text-5xl font-black text-vault-text sm:text-6xl lg:text-7xl">Rockin Rare Collectibles</h1>
          <p className="mt-5 text-xl font-semibold text-vault-secondaryText">
            Collector-first Pokemon, One Piece, Magic, sealed product, slabs, and rare finds.
          </p>
          <p className="mt-6 max-w-2xl text-base leading-8 text-vault-secondaryText">
            Buy and sell collectibles with real product photos, transparent condition notes, and secure packaging from
            people who actually care about the hobby.
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
              Southern California based, with Pokemon first, then One Piece and Magic above the rest of the catalog.
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/inventory">Shop Current Inventory</Button>
            <Button href="/sell-trade" variant="secondary">
              Sell or Trade Cards
            </Button>
            <Button href="/collector-club" variant="secondary">
              Join Collector Club
            </Button>
          </div>
        </div>
        <HeroProductStack products={heroProducts} />
      </section>

      <section className="py-8">
        <SectionHeader title="Collector Categories" description="Browse clean listings, clear condition details, and collector-focused card categories." />
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <CategoryCard key={category.title} {...category} />
          ))}
        </div>
      </section>

      <FeaturedInventory products={featured} />
      <TrustPromise />
      <SellTradeCTA />
    </Container>
  );
}
