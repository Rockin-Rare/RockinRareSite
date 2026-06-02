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
    <Container className="grid min-w-0 gap-10 overflow-x-hidden py-14">
      <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] lg:items-end">
        <div className="min-w-0">
          <p className="mb-3 text-sm font-semibold uppercase text-vault-gold">Collection Intake</p>
          <h1 className="text-wrap break-words text-4xl font-black text-vault-text sm:text-5xl">Sell or Trade Your Cards</h1>
          <p className="mt-5 text-lg leading-8 text-vault-secondaryText">
            Scan front photos with your camera, upload from your computer, or use the phone QR option to get an instant
            preliminary cash and trade quote before sending your collection details.
          </p>
        </div>
        <div className="mt-8 min-w-0 rounded-2xl border border-vault-border bg-vault-card p-5 text-sm leading-6 text-vault-secondaryText">
          Quotes are confirmed after we review identity, condition, demand, current pricing, and fit with Rockin Rare
          inventory. Southern California local options may be available for larger collections.
        </div>
      </div>
      <SellTradePageClient />
    </Container>
  );
}
