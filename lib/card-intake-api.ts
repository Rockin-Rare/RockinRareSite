import type { Product } from "@/lib/types";

type RawPublicProduct = Partial<Product> & Record<string, unknown>;

type PublicInventoryResponse = {
  products?: RawPublicProduct[];
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
  const products = (payload.products ?? []).map(normalizePublicProduct);
  return enrichProductsMissingImages(products);
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

  const payload = (await response.json()) as { product?: RawPublicProduct };
  return payload.product ? normalizePublicProduct(payload.product) : undefined;
}

function normalizePublicProduct(product: RawPublicProduct): Product {
  const imageUrls = readImageUrls(product);
  const primaryImageUrl =
    readString(product.primaryImageUrl) ||
    readString(product.primary_image_url) ||
    readString(product.imageUrl) ||
    readString(product.image_url) ||
    imageUrls[0] ||
    "";

  return {
    ...(product as Product),
    imageUrls,
    primaryImageUrl,
    sku: product.sku ?? product.scanId ?? product.id,
    sitePrice: product.sitePrice ?? product.price,
    checkoutEnabled: product.checkoutEnabled ?? product.publicStatus !== "coming_soon"
  };
}

function readImageUrls(product: RawPublicProduct) {
  const candidateArrays = [product.imageUrls, product.image_urls, product.images, product.photos];
  const imageUrls = candidateArrays.flatMap((candidate) => normalizeImageArray(candidate));
  return Array.from(new Set(imageUrls.filter(Boolean)));
}

function normalizeImageArray(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item === "string") return item;
      if (!item || typeof item !== "object") return "";

      const image = item as Record<string, unknown>;
      return (
        readString(image.url) ||
        readString(image.imageUrl) ||
        readString(image.image_url) ||
        readString(image.signedUrl) ||
        readString(image.signed_url) ||
        readString(image.publicUrl) ||
        readString(image.public_url) ||
        readString(image.src)
      );
    })
    .filter(Boolean);
}

function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function authHeaders() {
  const token = process.env.CARD_INTAKE_API_TOKEN;
  return token ? { authorization: `Bearer ${token}` } : undefined;
}

async function enrichProductsMissingImages(products: Product[]) {
  if (!products.some((product) => !product.primaryImageUrl && product.slug)) {
    return products;
  }

  return Promise.all(
    products.map(async (product) => {
      if (product.primaryImageUrl || !product.slug) return product;

      try {
        const detail = await getCardIntakeProductBySlug(product.slug);
        return detail?.primaryImageUrl ? { ...product, imageUrls: detail.imageUrls, primaryImageUrl: detail.primaryImageUrl } : product;
      } catch (error) {
        console.error(`Failed to load Card Intake image details for ${product.slug}`, error);
        return product;
      }
    })
  );
}
