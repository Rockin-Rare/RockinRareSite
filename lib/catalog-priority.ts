import type { Product } from "@/lib/types";

const franchisePriority = ["Pokemon", "One Piece", "Magic: The Gathering"];

export function compareByFranchisePriority(a: Product, b: Product) {
  const priorityDelta = getFranchisePriority(a.franchise) - getFranchisePriority(b.franchise);
  if (priorityDelta !== 0) return priorityDelta;

  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

export function sortByFranchisePriority(values: string[]) {
  return [...values].sort((a, b) => {
    const priorityDelta = getFranchisePriority(a) - getFranchisePriority(b);
    if (priorityDelta !== 0) return priorityDelta;

    return a.localeCompare(b);
  });
}

function getFranchisePriority(value: string) {
  const normalized = normalizeFranchise(value);
  const index = franchisePriority.findIndex((franchise) => normalizeFranchise(franchise) === normalized);

  return index === -1 ? franchisePriority.length : index;
}

function normalizeFranchise(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}
