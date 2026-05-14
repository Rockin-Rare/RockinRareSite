import { ProductGrid } from "@/components/inventory/ProductGrid";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import type { Product } from "@/lib/types";

export function RelatedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mt-16">
      <SectionHeader title="Related Items" description="More inventory from nearby categories, franchises, or recent intake." />
      <div className="mt-8">
        <ProductGrid products={products} />
      </div>
    </section>
  );
}
