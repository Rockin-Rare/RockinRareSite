import { mockProducts } from "@/lib/mock-products";
import { getCardIntakeProductBySlug, getCardIntakeProducts, hasCardIntakeApi } from "@/lib/card-intake-api";
import { compareByFranchisePriority } from "@/lib/catalog-priority";
import { getAnonymousCollectorClubEntitlement } from "@/lib/collector-club/entitlements";
import { canViewProductForEntitlement } from "@/lib/collector-club/gates";
import type { CollectorClubEntitlement } from "@/lib/collector-club/types";
import type { Product } from "@/lib/types";

const publicStatuses = new Set(["published", "listed_externally", "sold"]);

export async function getProducts(): Promise<Product[]> {
  if (hasCardIntakeApi()) {
    try {
      return await getCardIntakeProducts();
    } catch (error) {
      console.error("Failed to load Card Intake Router inventory", error);
      return [];
    }
  }

  // Fallback keeps local development and preview builds working without database credentials.
  return mockProducts;
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
  if (hasCardIntakeApi()) {
    try {
      const product = await getCardIntakeProductBySlug(slug);
      return product && canViewProductForEntitlement(entitlement, product) ? product : undefined;
    } catch (error) {
      console.error("Failed to load Card Intake Router product", error);
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
    .sort(compareByFranchisePriority)
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
