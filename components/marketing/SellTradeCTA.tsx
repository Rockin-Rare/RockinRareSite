import { Button } from "@/components/ui/Button";

export function SellTradeCTA() {
  return (
    <section className="rounded-2xl border border-vault-gold/30 bg-vault-elevated p-8 shadow-gold md:p-10">
      <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase text-vault-gold">Sell or Trade</p>
          <h2 className="mt-3 text-3xl font-black text-vault-text">Skip the listings. See what your cards are worth.</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-vault-secondaryText">
            Upload card photos for a preliminary cash or trade credit quote. We handle pricing, listing, marketplace fees,
            fulfillment, and resale risk so you do not have to sell every card yourself.
          </p>
        </div>
        <Button href="/sell-trade">See What Your Cards Are Worth</Button>
      </div>
    </section>
  );
}
