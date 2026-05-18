import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { CategoryCard } from "@/components/marketing/CategoryCard";
import { FeaturedInventory } from "@/components/marketing/FeaturedInventory";
import { HeroProductStack } from "@/components/marketing/HeroProductStack";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { SellTradeCTA } from "@/components/marketing/SellTradeCTA";
import { TrustPromise } from "@/components/marketing/TrustPromise";
import { Button } from "@/components/ui/Button";
import { getFeaturedProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

const categories = [
  { title: "Japanese Cards", description: "Japanese Pokemon singles, sealed product, AR/SAR finds, and collector favorites.", href: "/inventory" },
  { title: "English Singles", description: "Binder-ready singles with clear condition notes and actual product photos whenever possible.", href: "/inventory" },
  { title: "Sealed Product", description: "Booster boxes, packs, ETBs, and sealed inventory reviewed before shipping.", href: "/inventory" },
  { title: "Slabs & Bundles", description: "Graded cards, collector bundles, bulk lots, and curated collection pieces.", href: "/inventory" }
];

export default async function HomePage() {
  const featured = await getFeaturedProducts(8);

  return (
    <Container>
      <section className="grid gap-10 py-10 lg:grid-cols-[1fr_0.9fr] lg:items-start lg:py-14">
        <div>
          <p className="text-sm font-semibold uppercase text-vault-gold">
            Pokemon / Japanese Cards / Singles / Sealed Product / Slabs / Collector Bundles
          </p>
          <h1 className="mt-5 text-5xl font-black text-vault-text sm:text-6xl lg:text-7xl">Rockin Rare Collectibles</h1>
          <p className="mt-5 text-xl font-semibold text-vault-secondaryText">
            Collector-first trading cards, sealed product, slabs, and rare finds.
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
              Southern California based, with a focus on Pokemon, rare finds, sealed product, and collector bundles.
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
        <HeroProductStack products={featured.slice(0, 3)} />
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
