import type { RareRadarWishlistItem } from "@/lib/rare-radar/wishlist";
import type { Product } from "@/lib/types";

export type WishlistProductMatch = {
  product: Product;
  score: number;
  reasons: string[];
};

export function getWishlistMatches(item: RareRadarWishlistItem, products: Product[], limit = 3): WishlistProductMatch[] {
  return products
    .map((product) => scoreWishlistMatch(item, product))
    .filter((match) => match.score >= 35)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function scoreWishlistMatch(item: RareRadarWishlistItem, product: Product): WishlistProductMatch {
  let score = 0;
  const reasons: string[] = [];
  const itemName = normalize(item.productName);
  const productName = normalize(product.name);

  if (productName.includes(itemName) || itemName.includes(productName)) {
    score += 45;
    reasons.push("name");
  } else if (tokens(itemName).some((token) => token.length > 3 && productName.includes(token))) {
    score += 20;
    reasons.push("partial name");
  }

  if (normalize(item.game) === normalize(product.franchise)) {
    score += 20;
    reasons.push("game");
  }

  if (item.setName && product.setName && normalize(item.setName) === normalize(product.setName)) {
    score += 15;
    reasons.push("set");
  }

  if (item.cardNumber && product.cardNumber && normalize(item.cardNumber) === normalize(product.cardNumber)) {
    score += 20;
    reasons.push("card number");
  }

  if (normalizeCategory(item.category) === product.category) {
    score += 10;
    reasons.push("category");
  }

  if (item.language === "Either" || !product.language || item.language === product.language) {
    score += 5;
    reasons.push("language");
  }

  if (typeof item.maxPriceCents === "number") {
    const productPriceCents = Math.round((product.sitePrice ?? product.price ?? 0) * 100);
    if (productPriceCents > 0 && productPriceCents <= item.maxPriceCents) {
      score += 10;
      reasons.push("price");
    }
  }

  return { product, score, reasons };
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function tokens(value: string) {
  return normalize(value).split(" ").filter(Boolean);
}

function normalizeCategory(value: string) {
  const normalized = normalize(value);
  if (normalized.includes("graded") || normalized.includes("slab")) return "slab";
  if (normalized.includes("sealed")) return "sealed";
  if (normalized.includes("bundle")) return "bundle";
  if (normalized.includes("bulk")) return "bulk";
  return "single";
}
