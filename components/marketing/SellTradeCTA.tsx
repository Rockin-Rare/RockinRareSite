import { Button } from "@/components/ui/Button";

export function SellTradeCTA() {
  return (
    <section className="rounded-2xl border border-vault-gold/30 bg-vault-elevated p-8 shadow-gold md:p-10">
      <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase text-vault-gold">Sell or Trade</p>
          <h2 className="mt-3 text-3xl font-black text-vault-text">Have cards you&apos;re ready to move?</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-vault-secondaryText">
            Send us photos and details for Pokemon, One Piece, Riftbound, Magic, singles, slabs, sealed product, or bulk
            collections. We&apos;ll review and get back to you with next steps.
          </p>
        </div>
        <Button href="/sell-trade">Start a Submission</Button>
      </div>
    </section>
  );
}
