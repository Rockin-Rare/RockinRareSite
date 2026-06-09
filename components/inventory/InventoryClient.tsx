"use client";

import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ProductFilterBar, type InventoryFilters } from "@/components/inventory/ProductFilterBar";
import { ProductGrid } from "@/components/inventory/ProductGrid";
import { inventoryQueryToSearchParams, parseInventoryQuery, type InventoryPageResult } from "@/lib/inventory-query";
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

export function InventoryClient({ initialPage }: { initialPage: InventoryPageResult }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<InventoryFilters>(() => getFiltersFromSearchParams(searchParams));
  const [products, setProducts] = useState<Product[]>(initialPage.products);
  const [total, setTotal] = useState(initialPage.total);
  const [pageInfo, setPageInfo] = useState(initialPage.pageInfo);
  const [filterOptions, setFilterOptions] = useState(initialPage.filters);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  async function updateFilters(nextFilters: InventoryFilters) {
    setFilters(nextFilters);
    await loadInventory(nextFilters, 0, "replace");
    const params = inventoryQueryToSearchParams({ ...parseInventoryQueryFromFilters(nextFilters), offset: 0 });
    router.replace(params.size ? `/inventory?${params}` : "/inventory", { scroll: false });
  }

  async function loadMore() {
    if (!pageInfo.hasMore || pageInfo.nextOffset === undefined) return;
    await loadInventory(filters, pageInfo.nextOffset, "append");
  }

  async function loadInventory(nextFilters: InventoryFilters, offset: number, mode: "replace" | "append") {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setIsLoading(true);
    setError(null);

    try {
      const params = inventoryQueryToSearchParams({ ...parseInventoryQueryFromFilters(nextFilters), offset, limit: pageInfo.limit });
      const response = await fetch(`/api/inventory?${params}`, { headers: { accept: "application/json" } });
      if (!response.ok) throw new Error(`Inventory request failed with ${response.status}`);

      const page = (await response.json()) as InventoryPageResult;
      if (requestId !== requestIdRef.current) return;

      setProducts((currentProducts) => (mode === "append" ? [...currentProducts, ...page.products] : page.products));
      setTotal(page.total);
      setPageInfo(page.pageInfo);
      setFilterOptions(page.filters);
    } catch {
      if (requestId !== requestIdRef.current) return;
      setError("Inventory could not be loaded. Try again in a moment.");
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-8">
      <ProductFilterBar filterOptions={filterOptions} filters={filters} onChange={updateFilters} />
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-vault-secondaryText">
        <p>
          Showing <span className="font-semibold text-vault-text">{products.length}</span> of{" "}
          <span className="font-semibold text-vault-text">{total}</span> items
        </p>
        {isLoading ? <p className="font-semibold text-vault-highlight">Loading inventory...</p> : null}
      </div>
      {error ? (
        <p className="rounded-xl border border-vault-error/35 bg-vault-error/10 px-4 py-3 text-sm font-semibold text-vault-error">{error}</p>
      ) : null}
      <ProductGrid products={products} />
      {pageInfo.hasMore ? (
        <div className="flex justify-center">
          <Button disabled={isLoading} onClick={loadMore} type="button" variant="secondary">
            {isLoading ? "Loading..." : "Load More"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function getFiltersFromSearchParams(searchParams: URLSearchParams) {
  return {
    ...initialFilters,
    search: searchParams.get("search") ?? initialFilters.search,
    category: searchParams.get("category") ?? initialFilters.category,
    franchise: searchParams.get("franchise") ?? initialFilters.franchise,
    language: searchParams.get("language") ?? initialFilters.language,
    condition: searchParams.get("condition") ?? initialFilters.condition,
    availability: normalizeAvailabilityFilter(searchParams.get("availability") ?? initialFilters.availability),
    sort: searchParams.get("sort") ?? initialFilters.sort
  };
}

function normalizeAvailabilityFilter(value: string) {
  if (value === "Available only") return "Available now";
  if (value === "Listed") return "Marketplace listed";
  return value;
}

function parseInventoryQueryFromFilters(filters: InventoryFilters) {
  return parseInventoryQuery({
    search: filters.search,
    category: filters.category,
    franchise: filters.franchise,
    language: filters.language,
    condition: filters.condition,
    availability: filters.availability,
    sort: filters.sort
  });
}
