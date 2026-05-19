import type { MetadataRoute } from "next";
import { getPublishedProducts } from "@/lib/products";
import { absoluteUrl, staticRoutes } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const products = await getPublishedProducts();

  const routes = staticRoutes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority
  }));

  const productRoutes = products.map((product) => ({
    url: absoluteUrl(`/inventory/${product.slug}`),
    lastModified: new Date(product.updatedAt || product.createdAt),
    changeFrequency: "weekly" as const,
    priority: product.publicStatus === "sold" ? 0.45 : 0.75
  }));

  return [...routes, ...productRoutes];
}
