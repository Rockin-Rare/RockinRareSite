import type { Metadata } from "next";
import { SellTradeForm } from "@/components/forms/SellTradeForm";
import { Container } from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "Sell or Trade Your Cards | Rockin Rare Collectibles",
  description: "Submit Pokemon, One Piece, Magic, singles, slabs, sealed product, bulk, or collections to Rockin Rare Collectibles for review."
};

export default function SellTradePage() {
  return (
    <Container className="grid gap-10 py-14 lg:grid-cols-[0.8fr_1.2fr]">
      <div>
        <p className="mb-3 text-sm font-semibold uppercase text-vault-gold">Collection Intake</p>
        <h1 className="text-4xl font-black text-vault-text sm:text-5xl">Sell or Trade Your Cards</h1>
        <p className="mt-5 text-lg leading-8 text-vault-secondaryText">
          Have Pokemon, One Piece, Magic, singles, slabs, sealed product, or bulk? Send us photos and details and
          we&apos;ll review your collection.
        </p>
        <div className="mt-8 rounded-2xl border border-vault-border bg-vault-card p-5 text-sm leading-6 text-vault-secondaryText">
          We review submissions for condition, demand, current pricing, and fit with the Rockin Rare inventory. Southern
          California local options may be available for larger collections.
        </div>
      </div>
      <SellTradeForm />
    </Container>
  );
}
