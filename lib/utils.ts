import type { ProductCategory, PublicProductStatus } from "@/lib/types";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatPrice(price?: number) {
  if (typeof price !== "number") {
    return "Contact for price";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(price);
}

export function titleCase(value: string) {
  return value
    .split("_")
    .join(" ")
    .replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

export function categoryLabel(category: ProductCategory) {
  const labels: Record<ProductCategory, string> = {
    single: "Single",
    sealed: "Sealed",
    slab: "Slab",
    bundle: "Bundle",
    bulk: "Bulk",
    accessory: "Accessory"
  };

  return labels[category];
}

export function statusLabel(status: PublicProductStatus) {
  const labels: Record<PublicProductStatus, string> = {
    available: "Available",
    listed: "Listed",
    sold: "Sold",
    coming_soon: "Coming Soon"
  };

  return labels[status];
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
