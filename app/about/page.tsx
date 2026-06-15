import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { TcgplayerProof } from "@/components/marketing/TcgplayerProof";
import { TrustPromise } from "@/components/marketing/TrustPromise";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Rockin Rare Collectibles, a Southern California trading card shop for Pokemon, One Piece, Riftbound, Magic, slabs, sealed product, and collection finds.",
  alternates: {
    canonical: "/about"
  }
};

export default function AboutPage() {
  return (
    <Container className="py-14">
      <section className="max-w-3xl">
        <p className="mb-3 text-sm font-semibold uppercase text-vault-gold">About The Shop</p>
        <h1 className="text-4xl font-black text-vault-text sm:text-5xl">We sell cards the way collectors want to buy them.</h1>
        <p className="mt-6 text-lg leading-8 text-vault-secondaryText">
          Rockin Rare Collectibles is run by collectors in Southern California. We buy, sell, and trade cards with a
          simple goal: make the card, condition, price, and packing clear before someone checks out.
        </p>
        <p className="mt-5 text-lg leading-8 text-vault-secondaryText">
          We handle Pokemon, One Piece, Riftbound, Magic: The Gathering, Japanese cards, English singles, sealed product,
          slabs, and collection bundles when they are available. If a card has wear, a language difference, a grading
          detail, or anything else that matters, we want that called out before you buy.
        </p>
      </section>
      <section className="mt-12 grid gap-5 md:grid-cols-2">
        {[
          "Real product photos",
          "Clear condition notes",
          "Secure packaging",
          "Fair card-by-card pricing",
          "No misleading hype or fake scarcity",
          "Southern California based"
        ].map((value) => (
          <div className="rounded-lg border border-vault-border bg-vault-card p-5 text-lg font-bold text-vault-text" key={value}>
            {value}
          </div>
        ))}
      </section>
      <div className="mt-12">
        <TcgplayerProof />
      </div>
      <div className="mt-14">
        <TrustPromise />
      </div>
    </Container>
  );
}
