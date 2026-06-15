import { Button } from "@/components/ui/Button";
import { tcgplayerRating, tcgplayerRatingDate, tcgplayerSales, tcgplayerStoreUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

export function TcgplayerProof({ compact = false }: { compact?: boolean }) {
  return (
    <section
      className={cn(
        "border border-vault-border bg-vault-card shadow-vault",
        compact ? "rounded-xl p-5" : "rounded-xl p-6 md:p-8"
      )}
    >
      <div className={cn("grid gap-5", compact ? "" : "md:grid-cols-[1fr_auto] md:items-center")}>
        <div>
          <p className="text-sm font-semibold uppercase text-vault-gold">Public Seller History</p>
          <h2 className={cn("mt-2 font-black text-vault-text", compact ? "text-2xl" : "text-3xl sm:text-4xl")}>
            {tcgplayerRating} on TCGplayer
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-vault-secondaryText">
            Our TCGplayer store shows {tcgplayerRating} feedback across {tcgplayerSales}. You can check that history before
            placing an order here.
          </p>
          <p className="mt-2 text-sm text-vault-muted">Rating noted as of {tcgplayerRatingDate}.</p>
        </div>
        <Button
          className={compact ? "" : "w-full px-5 sm:w-auto md:min-w-[180px]"}
          href={tcgplayerStoreUrl}
          target="_blank"
          rel="noreferrer"
          variant={compact ? "secondary" : "primary"}
        >
          View TCGplayer Store
        </Button>
      </div>
    </section>
  );
}
