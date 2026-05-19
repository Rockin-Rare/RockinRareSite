import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { ProductImageFrame } from "@/components/inventory/ProductImageFrame";
import { ProductStatusBadge } from "@/components/inventory/ProductStatusBadge";
import type { Product } from "@/lib/types";
import { categoryLabel, cn, formatPrice } from "@/lib/utils";

export function ProductCard({ product, priorityImage = false }: { product: Product; priorityImage?: boolean }) {
  const sold = product.publicStatus === "sold";
  const cta = product.publicStatus === "coming_soon" ? "Preview" : "View Details";
  const imageUrl = product.primaryImageUrl || product.imageUrls[0] || "";
  const detailItems = [
    product.setName,
    product.cardNumber ? `#${product.cardNumber}` : null,
    product.quantity && product.quantity > 1 ? `Qty ${product.quantity}` : null
  ].filter(Boolean);

  return (
    <Link
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-vault-border bg-vault-card shadow-[0_12px_36px_rgba(0,0,0,0.16)] transition duration-300 hover:-translate-y-1 hover:border-vault-gold/70 hover:bg-vault-elevated hover:shadow-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-vault-highlight",
        sold && "opacity-80"
      )}
      href={`/inventory/${product.slug}`}
    >
      <div className="border-b border-vault-border/60 bg-[radial-gradient(circle_at_top_left,rgba(214,168,79,0.12),transparent_38%),linear-gradient(135deg,rgba(255,255,255,0.05),rgba(13,17,23,0.38))] p-4">
        <div className="mb-3 flex min-h-8 items-center justify-between gap-2">
          <ProductStatusBadge className="shadow-[0_6px_18px_rgba(0,0,0,0.2)]" status={product.publicStatus} />
          {product.actualPhoto ? (
            <span className="rounded-full border border-vault-border/80 bg-vault-bg/45 px-2.5 py-1 text-[11px] font-semibold text-vault-secondaryText">
              Actual photo
            </span>
          ) : null}
        </div>
        <ProductImageFrame
          alt={product.name}
          priority={priorityImage}
          sold={sold}
          src={imageUrl}
          className="mx-auto aspect-[6/7] w-full max-w-[224px] rounded-lg border-vault-border/70 bg-black/25"
          imageClassName="p-2"
        />
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-vault-secondary/80 text-vault-text" tone="neutral">
            {product.condition ?? "Condition available on request"}
          </Badge>
          {product.conditionReviewed ? (
            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-vault-highlight">Reviewed</span>
          ) : null}
        </div>
        <h3 className="mt-3 line-clamp-2 min-h-10 text-base font-black leading-snug text-vault-text">{product.name}</h3>
        <p className="mt-1.5 text-xs font-semibold leading-5 text-vault-secondaryText">
          {categoryLabel(product.category)} / {product.franchise}
          {product.language ? ` / ${product.language}` : ""}
        </p>
        {detailItems.length > 0 ? (
          <p className="mt-0.5 line-clamp-2 text-xs font-medium leading-5 text-vault-muted">{detailItems.join(" / ")}</p>
        ) : null}
        <div className="mt-auto pt-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-lg font-black text-vault-highlight">{formatPrice(product.price)}</p>
              {product.externalListingPlatform ? (
                <p className="mt-1 text-xs font-medium text-vault-secondaryText">
                  Listed on {product.externalListingPlatform}
                </p>
              ) : null}
            </div>
          </div>
          <span className="mt-4 flex min-h-10 w-full items-center justify-center rounded-xl border border-vault-gold/35 px-3 py-2 text-xs font-black text-vault-gold transition group-hover:bg-vault-gold group-hover:text-vault-bg">
            {cta}
          </span>
        </div>
      </div>
    </Link>
  );
}
