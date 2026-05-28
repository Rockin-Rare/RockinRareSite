import type { Product, ProductStatus } from "./types";

const publicInventoryStatuses = new Set<ProductStatus>(["listed"]);

export function isPublicInventoryProduct(product: Pick<Product, "status">) {
  return publicInventoryStatuses.has(product.status);
}
