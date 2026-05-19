import { mockProducts } from "@/lib/mock-products";
import { getCardIntakeProductBySlug, getCardIntakeProducts, hasCardIntakeApi } from "@/lib/card-intake-api";
import { compareByFranchisePriority } from "@/lib/catalog-priority";
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
  const products = await getProducts();
  return products.filter((product) => publicStatuses.has(product.status) && product.status !== "hidden");
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  if (hasCardIntakeApi()) {
    try {
      return await getCardIntakeProductBySlug(slug);
    } catch (error) {
      console.error("Failed to load Card Intake Router product", error);
      return undefined;
    }
  }

  const products = await getPublishedProducts();
  return products.find((product) => product.slug === slug);
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const products = await getPublishedProducts();
  return products
    .filter((product) => product.publicStatus === "available" || product.publicStatus === "listed")
    .sort(compareByFranchisePriority)
    .slice(0, limit);
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const products = await getPublishedProducts();
  return products
    .filter((candidate) => candidate.id !== product.id)
    .filter((candidate) => candidate.franchise === product.franchise || candidate.category === product.category)
    .slice(0, limit);
}
