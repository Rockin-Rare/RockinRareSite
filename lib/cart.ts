import { getProductSku, getSitePrice } from "@/lib/commerce";
import type { CartItem } from "@/components/cart/CartProvider";
import type { Product } from "@/lib/types";

export function cartItemFromProduct(product: Product): CartItem | undefined {
  const price = getSitePrice(product);
  if (typeof price !== "number" || !Number.isFinite(price)) return undefined;

  return {
    id: product.id,
    sku: getProductSku(product),
    slug: product.slug,
    name: product.name,
    price,
    imageUrl: product.primaryImageUrl || product.imageUrls[0] || ""
  };
}
