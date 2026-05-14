import { ProductCard } from "@/components/inventory/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Product } from "@/lib/types";

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <EmptyState
        title="No public inventory available"
        message="Inventory appears here after Card Intake Router marks items listable or ready for draft. Try adjusting filters if you are searching a populated catalog."
      />
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
