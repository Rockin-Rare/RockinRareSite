import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { ProductImageFrame } from "@/components/inventory/ProductImageFrame";
import { ProductStatusBadge } from "@/components/inventory/ProductStatusBadge";
import type { Product } from "@/lib/types";
import { categoryLabel, cn, formatPrice } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const sold = product.publicStatus === "sold";
  const cta = product.publicStatus === "coming_soon" ? "Preview" : "View Details";
  const imageUrl = product.primaryImageUrl || product.imageUrls[0] || "";

  return (
    <Link
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-vault-border bg-vault-card shadow-[0_12px_36px_rgba(0,0,0,0.16)] transition duration-300 hover:-translate-y-1 hover:border-vault-gold/70 hover:bg-vault-elevated hover:shadow-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-vault-highlight",
        sold && "opacity-80"
      )}
      href={`/inventory/${product.slug}`}
    >
      <div className="relative aspect-[4/5]">
        <ProductImageFrame alt={product.name} priority sold={sold} src={imageUrl} className="h-full w-full rounded-none border-0" />
        <div className="absolute left-3 top-3">
          <ProductStatusBadge status={product.publicStatus} />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex flex-wrap gap-2">
          {product.actualPhoto ? <Badge tone="neutral">Actual Product Photo</Badge> : null}
          {product.conditionReviewed ? <Badge tone="gold">Condition Reviewed</Badge> : null}
        </div>
        <h3 className="mt-4 line-clamp-2 min-h-12 text-base font-black text-vault-text">{product.name}</h3>
        <p className="mt-2 text-xs font-medium text-vault-secondaryText">
          {categoryLabel(product.category)} / {product.franchise}
          {product.language ? ` / ${product.language}` : ""}
        </p>
        <p className="mt-3 inline-flex w-fit rounded-full border border-vault-border bg-vault-secondary px-2.5 py-1 text-xs font-semibold text-vault-secondaryText">
          {product.condition ?? "Condition available on request"}
        </p>
        <div className="mt-auto flex items-end justify-between gap-4 pt-5">
          <div>
            <p className="text-lg font-black text-vault-highlight">{formatPrice(product.price)}</p>
            {product.externalListingPlatform ? (
              <p className="mt-1 text-xs text-vault-muted">Listed on {product.externalListingPlatform}</p>
            ) : null}
          </div>
          <span className="shrink-0 rounded-full border border-vault-gold/30 px-3 py-1.5 text-xs font-bold text-vault-gold transition group-hover:bg-vault-gold group-hover:text-vault-bg">
            {cta}
          </span>
        </div>
      </div>
    </Link>
  );
}
