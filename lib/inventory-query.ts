import { compareByRecentInventory, sortFranchisesAlphabetically } from "@/lib/catalog-sort";
import { canViewProductForEntitlement } from "@/lib/collector-club/gates";
import type { CollectorClubEntitlement } from "@/lib/collector-club/types";
import type { Product } from "@/lib/types";

export const inventoryPageSize = 24;

export type InventoryQuery = {
  search: string;
  category: string;
  franchise: string;
  language: string;
  condition: string;
  availability: string;
  sort: string;
  limit: number;
  offset: number;
};

export type InventoryFilterOptions = {
  categories: string[];
  franchises: string[];
  languages: string[];
  conditions: string[];
};

export type InventoryPageInfo = {
  limit: number;
  offset: number;
  nextOffset?: number;
  hasMore: boolean;
};

export type InventoryPageResult = {
  products: Product[];
  total: number;
  pageInfo: InventoryPageInfo;
  filters: InventoryFilterOptions;
  updatedAt?: string;
};

const initialInventoryQuery: InventoryQuery = {
  search: "",
  category: "",
  franchise: "",
  language: "",
  condition: "",
  availability: "",
  sort: "Featured",
  limit: inventoryPageSize,
  offset: 0
};

const categoryGroups: Record<string, string[]> = {
  "sealed-slab-bundle": ["sealed", "slab", "bundle"]
};

export function parseInventoryQuery(searchParams: URLSearchParams | Record<string, string | string[] | undefined>): InventoryQuery {
  return {
    search: getSearchParam(searchParams, "search") ?? initialInventoryQuery.search,
    category: getSearchParam(searchParams, "category") ?? initialInventoryQuery.category,
    franchise: getSearchParam(searchParams, "franchise") ?? initialInventoryQuery.franchise,
    language: getSearchParam(searchParams, "language") ?? initialInventoryQuery.language,
    condition: getSearchParam(searchParams, "condition") ?? initialInventoryQuery.condition,
    availability: normalizeAvailabilityFilter(getSearchParam(searchParams, "availability") ?? initialInventoryQuery.availability),
    sort: getSearchParam(searchParams, "sort") ?? initialInventoryQuery.sort,
    limit: clampInteger(getSearchParam(searchParams, "limit"), 1, 100, initialInventoryQuery.limit),
    offset: clampInteger(getSearchParam(searchParams, "offset"), 0, Number.MAX_SAFE_INTEGER, initialInventoryQuery.offset)
  };
}

export function filterSortPaginateProducts(products: Product[], query: InventoryQuery, entitlement?: CollectorClubEntitlement): InventoryPageResult {
  const visibleProducts = entitlement ? products.filter((product) => canViewProductForEntitlement(entitlement, product)) : products;
  const filters = getInventoryFilterOptions(visibleProducts);
  const filteredProducts = filterAndSortProducts(visibleProducts, query);
  const pageProducts = filteredProducts.slice(query.offset, query.offset + query.limit);
  const nextOffset = query.offset + pageProducts.length;

  return {
    products: pageProducts,
    total: filteredProducts.length,
    pageInfo: {
      limit: query.limit,
      offset: query.offset,
      nextOffset: nextOffset < filteredProducts.length ? nextOffset : undefined,
      hasMore: nextOffset < filteredProducts.length
    },
    filters,
    updatedAt: new Date().toISOString()
  };
}

export function getInventoryFilterOptions(products: Product[]): InventoryFilterOptions {
  return {
    categories: ["sealed-slab-bundle", ...unique(products.map((product) => product.category))],
    franchises: sortFranchisesAlphabetically(unique(products.map((product) => product.franchise))),
    languages: unique(products.map((product) => product.language).filter(Boolean) as string[]),
    conditions: unique(products.map((product) => product.condition).filter(Boolean) as string[])
  };
}

export function inventoryQueryToSearchParams(query: Partial<InventoryQuery>) {
  const params = new URLSearchParams();
  const defaults = initialInventoryQuery;

  for (const key of ["search", "category", "franchise", "language", "condition", "availability", "sort"] as const) {
    const value = query[key];
    if (value && value !== defaults[key]) params.set(key, value);
  }

  if (query.limit && query.limit !== defaults.limit) params.set("limit", String(query.limit));
  if (query.offset) params.set("offset", String(query.offset));
  return params;
}

function filterAndSortProducts(products: Product[], query: InventoryQuery) {
  const search = query.search.trim().toLowerCase();

  return products
    .filter((product) => {
      const searchable = [product.name, product.franchise, product.setName, product.cardNumber, product.description]
        .concat(product.isFoil === undefined ? [] : [product.isFoil ? "foil" : "non-foil non foil"])
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (search && !searchable.includes(search)) return false;
      if (query.category && !matchesCategoryFilter(product.category, query.category)) return false;
      if (query.franchise && product.franchise !== query.franchise) return false;
      if (query.language && product.language !== query.language) return false;
      if (query.condition && product.condition !== query.condition) return false;
      if (query.availability === "Available now" && !["available", "listed"].includes(product.publicStatus)) return false;
      if (query.availability === "Marketplace listed" && product.publicStatus !== "listed") return false;
      if (query.availability === "Sold" && product.publicStatus !== "sold") return false;
      if (query.availability === "Coming soon" && product.publicStatus !== "coming_soon") return false;
      return true;
    })
    .sort((a, b) => {
      if (query.sort === "Featured") return compareByRecentInventory(a, b);
      if (query.sort === "Price low to high") return (a.price ?? Number.MAX_VALUE) - (b.price ?? Number.MAX_VALUE);
      if (query.sort === "Price high to low") return (b.price ?? 0) - (a.price ?? 0);
      if (query.sort === "Name A-Z") return a.name.localeCompare(b.name);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
}

function normalizeAvailabilityFilter(value: string) {
  if (value === "Available only") return "Available now";
  if (value === "Listed") return "Marketplace listed";
  return value;
}

function matchesCategoryFilter(productCategory: string, categoryFilter: string) {
  return categoryGroups[categoryFilter]?.includes(productCategory) ?? productCategory === categoryFilter;
}

function getSearchParam(searchParams: URLSearchParams | Record<string, string | string[] | undefined>, key: string) {
  if (searchParams instanceof URLSearchParams) return searchParams.get(key) ?? undefined;
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value;
}

function clampInteger(value: string | undefined, min: number, max: number, fallback: number) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(numeric)));
}

function unique(values: string[]) {
  return Array.from(new Set(values)).sort();
}
