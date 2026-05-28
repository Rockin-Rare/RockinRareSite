import { mockProducts } from "@/lib/mock-products";
import { getCardIntakeProductBySlug, getCardIntakeProducts, hasCardIntakeApi } from "@/lib/card-intake-api";
import { compareByRecentInventory } from "@/lib/catalog-sort";
import { getAnonymousCollectorClubEntitlement } from "@/lib/collector-club/entitlements";
import { canViewProductForEntitlement } from "@/lib/collector-club/gates";
import type { CollectorClubEntitlement } from "@/lib/collector-club/types";
import type { Product } from "@/lib/types";

const publicStatuses = new Set(["published", "listed_externally", "sold"]);
const localCheckoutTestProduct: Product = {
  id: "local-checkout-test-product",
  slug: "local-checkout-test-product",
  sku: "LOCAL-CHECKOUT-TEST",
  name: "Local Checkout Test Listing",
  category: "sealed",
  franchise: "Pokemon",
  setName: "Local QA",
  language: "English",
  condition: "Sealed",
  price: 1,
  quantity: 1,
  status: "published",
  publicStatus: "available",
  primaryChannel: "site",
  checkoutEnabled: true,
  description: "Development-only listing for testing the local cart and Stripe Checkout redirect flow.",
  conditionNotes: "QA fixture only. Do not use for production inventory.",
  imageUrls: ["/products/placeholder-card-2.svg"],
  primaryImageUrl: "/products/placeholder-card-2.svg",
  actualPhoto: false,
  conditionReviewed: true,
  createdAt: "2026-05-21T00:00:00.000Z",
  updatedAt: "2026-05-21T00:00:00.000Z"
};

export function isLocalCheckoutTestProductId(productId: string) {
  return process.env.NODE_ENV !== "production" && productId === localCheckoutTestProduct.id;
}

export function getLocalCheckoutTestProduct(productId: string) {
  return isLocalCheckoutTestProductId(productId) ? localCheckoutTestProduct : undefined;
}

function withLocalCheckoutTestProduct(products: Product[]) {
  if (process.env.NODE_ENV === "production") return products;
  if (products.some((product) => product.id === localCheckoutTestProduct.id)) return products;

  return [localCheckoutTestProduct, ...products];
}

function logCardIntakeInventoryError(action: string, error: unknown) {
  const message = error instanceof Error ? error.message : "unknown error";
  console.warn(`${action}; using available fallback inventory. (${message})`);
}

export async function getProducts(): Promise<Product[]> {
  if (hasCardIntakeApi()) {
    try {
      return withLocalCheckoutTestProduct(await getCardIntakeProducts());
    } catch (error) {
      logCardIntakeInventoryError("Failed to load Card Intake Router inventory", error);
      return withLocalCheckoutTestProduct([]);
    }
  }

  // Fallback keeps local development and preview builds working without database credentials.
  return withLocalCheckoutTestProduct(mockProducts);
}

export async function getPublishedProducts(): Promise<Product[]> {
  return getPublishedProductsForEntitlement(getAnonymousCollectorClubEntitlement());
}

export async function getPublishedProductsForEntitlement(entitlement: CollectorClubEntitlement): Promise<Product[]> {
  const products = await getProducts();

  return products
    .filter((product) => publicStatuses.has(product.status) && product.status !== "hidden")
    .filter((product) => canViewProductForEntitlement(entitlement, product));
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  return getProductBySlugForEntitlement(slug, getAnonymousCollectorClubEntitlement());
}

export async function getProductBySlugForEntitlement(slug: string, entitlement: CollectorClubEntitlement): Promise<Product | undefined> {
  if (isLocalCheckoutTestProductId(slug)) {
    return canViewProductForEntitlement(entitlement, localCheckoutTestProduct) ? localCheckoutTestProduct : undefined;
  }

  if (hasCardIntakeApi()) {
    try {
      const product = await getCardIntakeProductBySlug(slug);
      return product && canViewProductForEntitlement(entitlement, product) ? product : undefined;
    } catch (error) {
      logCardIntakeInventoryError("Failed to load Card Intake Router product", error);
      return undefined;
    }
  }

  const products = await getPublishedProductsForEntitlement(entitlement);
  return products.find((product) => product.slug === slug);
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const products = await getPublishedProducts();
  return products
    .filter((product) => product.publicStatus === "available" || product.publicStatus === "listed")
    .sort(compareByRecentInventory)
    .slice(0, limit);
}

export async function getHeroShowcaseProducts(limit = 3): Promise<Product[]> {
  const products = await getPublishedProducts();
  const availableProducts = products.filter((product) => product.publicStatus === "available" || product.publicStatus === "listed");
  const cardProducts = availableProducts.filter((product) => product.category === "single" || product.category === "slab");
  const rankedProducts = cardProducts.length >= limit ? cardProducts : availableProducts;

  return rankedProducts.sort(compareByDisplayValue).slice(0, limit);
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  return getRelatedProductsForEntitlement(product, getAnonymousCollectorClubEntitlement(), limit);
}

export async function getRelatedProductsForEntitlement(product: Product, entitlement: CollectorClubEntitlement, limit = 4): Promise<Product[]> {
  const products = await getPublishedProductsForEntitlement(entitlement);
  return products
    .filter((candidate) => candidate.id !== product.id)
    .filter((candidate) => candidate.franchise === product.franchise || candidate.category === product.category)
    .slice(0, limit);
}

function compareByDisplayValue(a: Product, b: Product) {
  return getDisplayValue(b) - getDisplayValue(a);
}

function getDisplayValue(product: Product) {
  return Math.max(product.sitePrice ?? 0, product.price ?? 0, product.ebayPrice ?? 0, product.tcgplayerPrice ?? 0);
}
