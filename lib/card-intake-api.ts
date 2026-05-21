import type { Product } from "@/lib/types";

type PublicInventoryResponse = {
  products?: Product[];
};

export function hasCardIntakeApi() {
  if (process.env.INVENTORY_SOURCE === "mock") return false;
  return Boolean(process.env.CARD_INTAKE_API_BASE_URL);
}

export async function getCardIntakeProducts(): Promise<Product[]> {
  const baseUrl = process.env.CARD_INTAKE_API_BASE_URL;
  if (!baseUrl) return [];

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/public/inventory`, {
    headers: authHeaders(),
    next: { revalidate: 60 }
  });

  if (!response.ok) {
    throw new Error(`Card Intake inventory API returned ${response.status}`);
  }

  const payload = (await response.json()) as PublicInventoryResponse;
  return (payload.products ?? []).map(normalizePublicProduct);
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

function normalizePublicProduct(product: Product): Product {
  const imageUrls = product.imageUrls ?? [];
  const primaryImageUrl = product.primaryImageUrl || imageUrls[0] || "";

  return {
    ...product,
    imageUrls,
    primaryImageUrl,
    sku: product.sku ?? product.scanId ?? product.id,
    sitePrice: product.sitePrice ?? product.price,
    accessTier: product.accessTier ?? "public",
    checkoutEnabled: product.checkoutEnabled ?? product.publicStatus !== "coming_soon"
  };
}

function authHeaders() {
  const token = process.env.CARD_INTAKE_API_TOKEN;
  return token ? { authorization: `Bearer ${token}` } : undefined;
}

