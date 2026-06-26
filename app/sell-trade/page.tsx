import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { SellTradePageClient } from "@/components/sell-trade/SellTradePageClient";

export const metadata: Metadata = {
  title: "Sell or Trade",
  description: "Skip the listing work. Upload card photos for a preliminary cash or trade credit quote from Rockin Rare Collectibles.",
  alternates: {
    canonical: "/sell-trade"
  }
};

const whySellItems = [
  "No need to create dozens of listings",
  "No waiting weeks for buyers",
  "No packaging individual orders",
  "No marketplace fee math",
  "No buyer disputes or returns",
  "One simple quote and one shipment"
];

const comparisonRows = [
  ["Potential payout", "Highest possible payout", "Lower than full market value"],
  ["Pricing work", "Research and price every card", "Fast preliminary quote"],
  ["Listings", "Photos, titles, descriptions, and updates", "One simple photo submission"],
  ["Timeline", "May take weeks or months", "Clear next steps after review"],
  ["Shipping", "Multiple packages to multiple buyers", "One shipment or drop-off"],
  ["After sale", "Marketplace fees, returns, and buyer issues", "We handle resale work and risk"]
];

export default function SellTradePage() {
  return (
    <Container className="grid min-w-0 gap-8 overflow-x-hidden py-10 lg:py-14">
      <section className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.55fr)] lg:items-center">
        <div className="min-w-0 max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase text-vault-gold">Sell or Trade</p>
          <h1 className="text-wrap break-words text-4xl font-black leading-tight text-vault-text sm:text-5xl lg:text-6xl">Skip the listings. Get a fast card quote.</h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-vault-secondaryText sm:text-lg">
            Upload photos of your cards and get a preliminary cash or trade offer. We handle the pricing work, resale risk,
            marketplace fees, listing, and fulfillment so you do not have to sell every card yourself.
          </p>
        </div>
        <div className="min-w-0 divide-y divide-vault-border/70 border-l-2 border-vault-gold/40 pl-5">
          <HeroStep title="Upload photos" text="Scan raw singles, upload from your computer, or add photos from your phone." />
          <HeroStep title="See the estimate" text="Review estimated market value, cash offer, and the higher trade credit option." />
          <HeroStep title="Ship once" text="Final offers are confirmed after condition, authenticity, and card identity are verified." />
        </div>
      </section>

      <section id="quote-scanner" className="scroll-mt-24">
        <SellTradePageClient />
      </section>

      <section className="grid min-w-0 gap-4">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase text-vault-gold">Why sell to Rockin Rare?</p>
          <h2 className="mt-2 text-3xl font-black text-vault-text">Avoid the work of selling cards one by one.</h2>
          <p className="mt-3 text-base leading-7 text-vault-secondaryText">
            Selling cards yourself can mean identifying every card, researching prices, taking photos, creating listings,
            waiting for buyers, packing orders, paying fees, and dealing with returns or disputes. Rockin Rare is the simpler
            path when convenience and speed matter more than squeezing out every last dollar.
            Whether you are clearing out a binder, moving on from a collection, or just curious what your cards are worth, we will make the process simple.
          </p>
        </div>
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {whySellItems.map((item) => (
            <li className="rounded-xl border border-vault-border bg-vault-card px-4 py-3 text-sm font-semibold text-vault-text shadow-vault" key={item}>
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="grid min-w-0 gap-4">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase text-vault-gold">Compare the tradeoff</p>
          <h2 className="mt-2 text-3xl font-black text-vault-text">Selling yourself vs. selling to Rockin Rare</h2>
          <p className="mt-3 text-base leading-7 text-vault-secondaryText">
            We are not claiming to pay the absolute highest possible amount. The offer is below market because we take on
            the work, time, fees, and resale risk.
          </p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-vault-border bg-vault-card shadow-vault">
          <div className="hidden grid-cols-[0.8fr_1fr_1fr] gap-3 border-b border-vault-border bg-vault-secondary px-4 py-3 text-xs font-black uppercase text-vault-muted md:grid">
            <span>Tradeoff</span>
            <span>Selling Yourself</span>
            <span>Selling to Rockin Rare</span>
          </div>
          {comparisonRows.map(([label, yourself, rockinRare]) => (
            <div className="grid gap-3 border-b border-vault-border px-4 py-4 text-sm leading-6 text-vault-secondaryText last:border-b-0 md:grid-cols-[0.8fr_1fr_1fr]" key={label}>
              <span className="font-semibold text-vault-text">{label}</span>
              <div>
                <p className="text-xs font-black uppercase text-vault-muted md:hidden">Selling yourself</p>
                <p>{yourself}</p>
              </div>
              <div>
                <p className="text-xs font-black uppercase text-vault-muted md:hidden">Selling to Rockin Rare</p>
                <p>{rockinRare}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </Container>
  );
}

function HeroStep({ title, text }: { title: string; text: string }) {
  return (
    <div className="grid gap-1 py-3.5 sm:grid-cols-[150px_1fr] sm:gap-5 lg:grid-cols-1 lg:gap-1">
      <p className="text-xs font-black uppercase text-vault-text">{title}</p>
      <p className="text-sm leading-6 text-vault-muted">{text}</p>
    </div>
  );
}
