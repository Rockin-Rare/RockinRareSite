import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { CategoryCard } from "@/components/marketing/CategoryCard";
import { FeaturedInventory } from "@/components/marketing/FeaturedInventory";
import { HeroProductStack } from "@/components/marketing/HeroProductStack";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { TcgplayerProof } from "@/components/marketing/TcgplayerProof";
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
  { title: "Pokemon", description: "Singles, slabs, sealed product, and recent trade-ins.", href: "/inventory?franchise=Pokemon" },
  { title: "One Piece", description: "Sealed product, playable singles, and collector cards as they come in.", href: "/inventory?franchise=One%20Piece" },
  { title: "Riftbound", description: "Early singles, sealed product, and cards for building a set.", href: "/inventory?franchise=Riftbound" },
  { title: "Magic: The Gathering", description: "Commander cards, sealed product, singles, and collection buys.", href: "/inventory?franchise=Magic%3A%20The%20Gathering" },
  { title: "Sealed, Slabs & Bundles", description: "Booster boxes, graded cards, packs, lots, and display pieces.", href: "/inventory?category=sealed-slab-bundle" }
];

export default async function HomePage() {
  const [featured, heroProducts] = await Promise.all([getFeaturedProducts(8), getHeroShowcaseProducts(6)]);

  return (
    <Container>
      <section className="grid gap-10 py-10 lg:grid-cols-[1fr_0.9fr] lg:items-stretch lg:py-14">
        <div>
          <p className="text-sm font-semibold uppercase text-vault-gold">Pokemon / One Piece / Riftbound / Magic / Sealed / Slabs</p>
          <h1 className="mt-5 text-[2.75rem] font-black leading-[0.98] text-vault-text sm:text-6xl lg:text-7xl">
            Rockin Rare Collectibles
          </h1>
          <p className="mt-5 text-lg font-semibold leading-7 text-vault-secondaryText sm:text-xl">
            A Southern California card shop for Pokemon, One Piece, Riftbound, Magic, slabs, and sealed product.
          </p>
          <p className="mt-6 max-w-2xl text-base leading-8 text-vault-secondaryText">
            Browse what is in stock, send us cards you want to sell or trade, or tell us what you are trying to find.
            Rare Radar helps us check incoming trade-ins against real wishlists before everything goes public.
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
              Small collector-run shop with real product photos when available, plain condition notes, and packing that
              protects the cards people care about.
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/inventory">Shop Current Inventory</Button>
            <Button href="/wishlist" variant="secondary">
              Open Rare Radar
            </Button>
          </div>
          <p className="mt-4 text-sm leading-6 text-vault-muted">
            Selling instead?{" "}
            <a className="font-semibold text-vault-secondaryText transition hover:text-vault-highlight" href="/sell-trade">
              Start an instant quote
            </a>
            . Want drop alerts too?{" "}
            <a className="font-semibold text-vault-secondaryText transition hover:text-vault-highlight" href="/collector-club">
              Join Collector Club
            </a>
            .
          </p>
        </div>
        <HeroProductStack products={heroProducts} />
      </section>

      <div className="my-8">
        <TcgplayerProof />
      </div>

      <section className="my-8 rounded-xl border border-vault-border bg-vault-elevated/70 p-6 shadow-vault md:p-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(320px,1fr)] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase text-vault-gold">Rare Radar</p>
            <h2 className="mt-3 text-3xl font-black text-vault-text">Tell us what you are looking for.</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-vault-secondaryText">
              Save the card, slab, sealed product, set, language, condition, and max price you care about. When a trade-in
              or collection buy matches, we know who may want the first look.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button href="/wishlist">Build Your Wishlist</Button>
              <Button href="/auth/sign-in?redirectTo=/wishlist" variant="secondary">
                Sign In
              </Button>
            </div>
          </div>
          <div className="divide-y divide-vault-border border-y border-vault-border">
            <RadarStep title="Exact chase details" text="Game, product name, condition, language, budget, and notes." />
            <RadarStep title="Trade-ins checked" text="We can compare new collections and sealed product against saved wishlists." />
            <RadarStep title="Better first looks" text="Strong matches are easier to spot before an item lands in public inventory." />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-vault-border bg-vault-card p-6 shadow-vault md:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.75fr)] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase text-vault-gold">Instant Quote Scanner</p>
            <h2 className="mt-3 text-3xl font-black text-vault-text">Send photos first. Get a real review after.</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-vault-secondaryText">
              Scan raw singles with your camera, upload front photos, or use the phone QR option. The estimate gives a
              starting point. The final cash or trade offer comes after we check condition and authenticity.
            </p>
          </div>
          <div className="grid gap-4">
            <ul className="space-y-3 text-sm leading-6 text-vault-secondaryText">
              <li className="border-l-2 border-vault-gold pl-4">
                <span className="font-black text-vault-text">Raw singles:</span> camera scan, upload, or phone QR.
              </li>
              <li className="border-l-2 border-vault-gold pl-4">
                <span className="font-black text-vault-text">Slabs and sealed:</span> submit details for manual review.
              </li>
              <li className="border-l-2 border-vault-gold pl-4">
                <span className="font-black text-vault-text">Collections:</span> describe the lot and attach photos.
              </li>
            </ul>
            <Button href="/sell-trade" className="w-full">
              Start Instant Quote
            </Button>
          </div>
        </div>
      </section>

      <section className="py-8">
        <SectionHeader title="Collector Categories" description="Browse current listings with clear photos, condition details, and card categories that are easy to scan." />
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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

function RadarStep({ title, text }: { title: string; text: string }) {
  return (
    <div className="grid gap-1 py-4 sm:grid-cols-[180px_1fr] sm:gap-5">
      <p className="text-sm font-black text-vault-text">{title}</p>
      <p className="text-sm leading-6 text-vault-secondaryText">{text}</p>
    </div>
  );
}
