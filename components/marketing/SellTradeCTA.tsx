import { Button } from "@/components/ui/Button";

export function SellTradeCTA() {
  return (
    <section className="rounded-2xl border border-vault-gold/30 bg-vault-elevated p-8 shadow-gold md:p-10">
      <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase text-vault-gold">Sell or Trade</p>
          <h2 className="mt-3 text-3xl font-black text-vault-text">Ready to see what your cards are worth?</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-vault-secondaryText">
            Use the instant quote scanner for raw singles, or upload collection photos for slabs, sealed product, bulk,
            and larger collections. Cash and trade credit offers are confirmed after review.
          </p>
        </div>
        <Button href="/sell-trade">Get Instant Quote</Button>
      </div>
    </section>
  );
}
