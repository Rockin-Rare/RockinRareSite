import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { SellTradePageClient } from "@/components/sell-trade/SellTradePageClient";

export const metadata: Metadata = {
  title: "Sell or Trade Your Cards",
  description: "Scan Pokemon, One Piece, Riftbound, Magic, singles, slabs, sealed product, bulk, or collections for an instant Rockin Rare Collectibles quote.",
  alternates: {
    canonical: "/sell-trade"
  }
};

export default function SellTradePage() {
  return (
    <Container className="grid gap-10 py-14">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1fr] lg:items-end">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase text-vault-gold">Collection Intake</p>
          <h1 className="text-4xl font-black text-vault-text sm:text-5xl">Sell or Trade Your Cards</h1>
          <p className="mt-5 text-lg leading-8 text-vault-secondaryText">
            Scan front photos with your camera, upload from your computer, or use the phone QR option to get an instant
            preliminary cash and trade quote before sending your collection details.
          </p>
        </div>
        <div className="mt-8 rounded-2xl border border-vault-border bg-vault-card p-5 text-sm leading-6 text-vault-secondaryText">
          Quotes are confirmed after we review identity, condition, demand, current pricing, and fit with Rockin Rare
          inventory. Southern California local options may be available for larger collections.
        </div>
      </div>
      <SellTradePageClient />
    </Container>
  );
}
