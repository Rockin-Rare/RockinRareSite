import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { TrustPromise } from "@/components/marketing/TrustPromise";

export const metadata: Metadata = {
  title: "About Rockin Rare Collectibles",
  description: "Learn about Rockin Rare Collectibles, a collector-first trading card business based in Southern California."
};

export default function AboutPage() {
  return (
    <Container className="py-14">
      <section className="max-w-3xl">
        <p className="mb-3 text-sm font-semibold uppercase text-vault-gold">About The Shop</p>
        <h1 className="text-4xl font-black text-vault-text sm:text-5xl">Collector-first, condition-aware, and built for trust.</h1>
        <p className="mt-6 text-lg leading-8 text-vault-secondaryText">
          Rockin Rare Collectibles was started by collectors who wanted to build a trustworthy, collector-first trading
          card business focused on fair deals, clean inventory, and transparent listings.
        </p>
        <p className="mt-5 text-lg leading-8 text-vault-secondaryText">
          We specialize first in Pokemon, with One Piece and Magic: The Gathering prioritized next, followed by Japanese
          cards, English singles, sealed product, slabs, and collector bundles. Our goal is to make every listing clear,
          every product photo useful, and every transaction feel safe for collectors.
        </p>
      </section>
      <section className="mt-12 grid gap-5 md:grid-cols-2">
        {[
          "Real product photos",
          "Clear condition notes",
          "Secure packaging",
          "Fair collector-first pricing",
          "No misleading hype or fake scarcity",
          "Southern California based"
        ].map((value) => (
          <div className="rounded-2xl border border-vault-border bg-vault-card p-5 text-lg font-bold text-vault-text" key={value}>
            {value}
          </div>
        ))}
      </section>
      <div className="mt-14">
        <TrustPromise />
      </div>
    </Container>
  );
}
