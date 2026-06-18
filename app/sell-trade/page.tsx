import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { SellTradePageClient } from "@/components/sell-trade/SellTradePageClient";

export const metadata: Metadata = {
  title: "Sell or Trade",
  description: "Use the instant quote scanner for raw singles, or upload collection photos for slabs, sealed product, bulk, and larger collections.",
  alternates: {
    canonical: "/sell-trade"
  }
};

export default function SellTradePage() {
  return (
    <Container className="grid min-w-0 gap-8 overflow-x-hidden py-10 lg:py-14">
      <section className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.55fr)] lg:items-center">
        <div className="min-w-0 max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase text-vault-gold">Sell or Trade</p>
          <h1 className="text-wrap break-words text-4xl font-black leading-tight text-vault-text sm:text-5xl lg:text-6xl">Ready to see what your cards are worth?</h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-vault-secondaryText sm:text-lg">
            Use the instant quote scanner for raw singles, or upload collection photos for slabs, sealed product, bulk,
            and larger collections. Cash and trade credit offers are confirmed after review.
          </p>
        </div>
        <div className="min-w-0 divide-y divide-vault-border/70 border-l-2 border-vault-gold/40 pl-5">
          <HeroStep title="Send photos first" text="Scan raw singles, upload from your computer, or add photos from your phone." />
          <HeroStep title="Get a starting estimate" text="See estimated market value, cash offer, and trade credit before submitting." />
          <HeroStep title="Final review after" text="The final offer comes after we check condition and authenticity." />
        </div>
      </section>
      <SellTradePageClient />
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
