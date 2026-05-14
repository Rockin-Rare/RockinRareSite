import { ProductGrid } from "@/components/inventory/ProductGrid";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { Button } from "@/components/ui/Button";
import type { Product } from "@/lib/types";

export function FeaturedInventory({ products }: { products: Product[] }) {
  return (
    <section className="py-16">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <SectionHeader
          eyebrow="Recently Added"
          title="Inventory That Looks Like Inventory"
          description="Browse current singles, sealed product, slabs, bundles, and sold examples from recent collector intake."
        />
        <Button href="/inventory" variant="secondary">
          View All Inventory
        </Button>
      </div>
      <div className="mt-8">
        <ProductGrid products={products} />
      </div>
    </section>
  );
}
