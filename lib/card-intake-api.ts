import type { Product } from "./types";
import type { InventoryFilterOptions, InventoryPageInfo, InventoryQuery } from "@/lib/inventory-query";

type PublicInventoryResponse = {
  products?: Product[];
  total?: number;
  pageInfo?: Partial<InventoryPageInfo>;
  filters?: Partial<InventoryFilterOptions>;
  facets?: Partial<InventoryFilterOptions>;
  updatedAt?: string;
};

export function hasCardIntakeApi() {
  if (process.env.INVENTORY_SOURCE === "mock") return false;
  return Boolean(process.env.CARD_INTAKE_API_BASE_URL);
}

export async function getCardIntakeProducts(): Promise<Product[]> {
  const page = await getCardIntakeInventoryPage();
  return page.products;
}

export async function getCardIntakeInventoryPage(query?: Partial<InventoryQuery>) {
  const baseUrl = process.env.CARD_INTAKE_API_BASE_URL;
  if (!baseUrl) {
    return {
      products: [],
      total: 0,
      pageInfo: { limit: query?.limit ?? 24, offset: query?.offset ?? 0, hasMore: false },
      filters: { categories: [], franchises: [], languages: [], conditions: [] }
    };
  }

  const url = new URL(`${baseUrl.replace(/\/$/, "")}/api/public/inventory`);
  appendInventoryQuery(url.searchParams, query);

  const response = await fetch(url, {
    headers: authHeaders(),
    next: { revalidate: 60 }
  });

  if (!response.ok) {
    throw new Error(`Card Intake inventory API returned ${response.status}`);
  }

  const payload = (await response.json()) as PublicInventoryResponse;
  const products = (payload.products ?? []).map(normalizePublicProduct);
  const pageInfo = normalizePageInfo(payload.pageInfo, query, products.length, payload.total);

  return {
    products,
    total: payload.total ?? products.length,
    pageInfo,
    filters: normalizeFilterOptions(payload.filters ?? payload.facets),
    updatedAt: payload.updatedAt
  };
}

export async function getCardIntakeProductBySlug(slug: string): Promise<Product | undefined> {
  const baseUrl = process.env.CARD_INTAKE_API_BASE_URL;
  if (!baseUrl) return undefined;

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/public/inventory/${encodeURIComponent(slug)}`, {
    headers: authHeaders(),
    next: { revalidate: 60 }
  });

  if (response.status === 404) return undefined;
  if (!response.ok) {
    throw new Error(`Card Intake product API returned ${response.status}`);
  }

  const payload = (await response.json()) as { product?: Product };
  return payload.product ? normalizePublicProduct(payload.product) : undefined;
}

export function normalizePublicProduct(product: Product): Product {
  const imageUrls = product.imageUrls ?? [];
  const primaryImageUrl = product.primaryImageUrl || imageUrls[0] || "";

  return {
    ...product,
    status: normalizePublicProductStatus(product),
    imageUrls,
    primaryImageUrl,
    sku: product.sku ?? product.scanId ?? product.id,
    sitePrice: product.sitePrice ?? product.price,
    accessTier: product.accessTier ?? "public",
    checkoutEnabled: product.checkoutEnabled ?? product.publicStatus !== "coming_soon"
  };
}

function normalizePublicProductStatus(product: Product): Product["status"] {
  if (product.publicStatus === "listed" || String(product.status) === "LISTED") return "listed";
  return product.status;
}

function authHeaders() {
  const token = process.env.CARD_INTAKE_PUBLIC_API_TOKEN ?? process.env.CARD_INTAKE_API_TOKEN;
  return token ? { authorization: `Bearer ${token}` } : undefined;
}

function appendInventoryQuery(searchParams: URLSearchParams, query?: Partial<InventoryQuery>) {
  if (!query) return;

  for (const key of ["search", "category", "franchise", "language", "condition", "availability", "sort"] as const) {
    const value = query[key];
    if (value) searchParams.set(key, value);
  }

  if (query.limit) searchParams.set("limit", String(query.limit));
  if (query.offset) searchParams.set("offset", String(query.offset));
}

function normalizePageInfo(pageInfo: Partial<InventoryPageInfo> | undefined, query: Partial<InventoryQuery> | undefined, productCount: number, total?: number): InventoryPageInfo {
  const limit = pageInfo?.limit ?? query?.limit ?? productCount;
  const offset = pageInfo?.offset ?? query?.offset ?? 0;
  const nextOffset = pageInfo?.nextOffset;
  const hasMore = pageInfo?.hasMore ?? (total === undefined ? false : offset + productCount < total);

  return {
    limit,
    offset,
    nextOffset,
    hasMore
  };
}

function normalizeFilterOptions(filters?: Partial<InventoryFilterOptions>): InventoryFilterOptions {
  return {
    categories: filters?.categories ?? [],
    franchises: filters?.franchises ?? [],
    languages: filters?.languages ?? [],
    conditions: filters?.conditions ?? []
  };
}
