import { ProductCard } from "@/components/inventory/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Product } from "@/lib/types";

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <EmptyState
        title="No public inventory available"
        message="No items match the current filters. Try adjusting your search or check back for new drops."
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
