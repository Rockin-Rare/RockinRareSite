import type { Product, SalesChannel } from "@/lib/types";

const feeCushion = 0.13;

export function getProductSku(product: Product) {
  return product.sku ?? product.scanId ?? product.id;
}

export function inferPrimaryChannel(product: Product): SalesChannel {
  if (product.publicStatus === "sold") return "hold";

  if (product.primaryChannel) return product.primaryChannel;

  if (product.externalListingPlatform === "eBay") return "multi";
  if (product.externalListingPlatform === "TCGplayer") return "tcgplayer";

  if (product.category === "bulk" || product.category === "bundle") return "site";
  if (product.category === "slab") return "multi";
  if (product.category === "sealed" && (product.price ?? 0) >= 75) return "multi";
  if (product.category === "single" && (product.price ?? 0) < 10) return "hold";
  if (product.category === "single" && (product.price ?? 0) < 75) return "tcgplayer";

  return "site";
}

export function getSitePrice(product: Product) {
  return product.sitePrice ?? product.price;
}

export function getEbayPrice(product: Product) {
  if (typeof product.ebayPrice === "number") return product.ebayPrice;

  const sitePrice = getSitePrice(product);
  if (typeof sitePrice !== "number") return undefined;

  return Math.round((sitePrice / (1 - feeCushion)) * 100) / 100;
}

export function isDirectSiteInventory(product: Product) {
  const channel = inferPrimaryChannel(product);

  return channel === "site" || channel === "multi";
}

export function canCheckoutOnSite(product: Product) {
  const sitePrice = getSitePrice(product);
  const hasAvailableStatus = product.publicStatus === "available" || product.publicStatus === "listed";
  const quantity = product.quantity ?? 1;

  return (
    isDirectSiteInventory(product) &&
    product.checkoutEnabled !== false &&
    hasAvailableStatus &&
    quantity > 0 &&
    typeof sitePrice === "number" &&
    Number.isFinite(sitePrice) &&
    sitePrice >= 0.5
  );
}
