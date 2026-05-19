"use client";

import { useMemo, useState } from "react";
import { ProductFilterBar, type InventoryFilters } from "@/components/inventory/ProductFilterBar";
import { ProductGrid } from "@/components/inventory/ProductGrid";
import { compareByFranchisePriority } from "@/lib/catalog-priority";
import type { Product } from "@/lib/types";

const initialFilters: InventoryFilters = {
  search: "",
  category: "",
  franchise: "",
  language: "",
  condition: "",
  availability: "",
  sort: "Featured"
};

export function InventoryClient({ products }: { products: Product[] }) {
  const [filters, setFilters] = useState(initialFilters);

  const filteredProducts = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    return products
      .filter((product) => {
        const searchable = [product.name, product.franchise, product.setName, product.cardNumber, product.description]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (search && !searchable.includes(search)) return false;
        if (filters.category && product.category !== filters.category) return false;
        if (filters.franchise && product.franchise !== filters.franchise) return false;
        if (filters.language && product.language !== filters.language) return false;
        if (filters.condition && product.condition !== filters.condition) return false;
        if (filters.availability === "Available only" && !["available", "listed"].includes(product.publicStatus)) return false;
        if (filters.availability === "Listed" && product.publicStatus !== "listed") return false;
        if (filters.availability === "Sold" && product.publicStatus !== "sold") return false;
        if (filters.availability === "Coming soon" && product.publicStatus !== "coming_soon") return false;
        return true;
      })
      .sort((a, b) => {
        if (filters.sort === "Featured") return compareByFranchisePriority(a, b);
        if (filters.sort === "Price low to high") return (a.price ?? Number.MAX_VALUE) - (b.price ?? Number.MAX_VALUE);
        if (filters.sort === "Price high to low") return (b.price ?? 0) - (a.price ?? 0);
        if (filters.sort === "Name A-Z") return a.name.localeCompare(b.name);
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [filters, products]);

  return (
    <div className="grid gap-8">
      <ProductFilterBar filters={filters} onChange={setFilters} products={products} />
      <ProductGrid products={filteredProducts} />
    </div>
  );
}
