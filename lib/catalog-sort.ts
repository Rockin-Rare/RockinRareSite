import type { Product } from "@/lib/types";

export function compareByRecentInventory(a: Product, b: Product) {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

export function sortFranchisesAlphabetically(values: string[]) {
  return [...values].sort((a, b) => a.localeCompare(b));
}
