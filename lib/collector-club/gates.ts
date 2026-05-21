import { hasCollectorClubFeature } from "./entitlements";
import type { Product } from "../types";
import type { CollectorClubEntitlement } from "./types";

export function canViewProductForEntitlement(entitlement: CollectorClubEntitlement | null | undefined, product: Product) {
  const accessTier = product.accessTier ?? "public";

  if (accessTier === "public") return true;
  if (accessTier === "collector_club") return hasCollectorClubFeature(entitlement, "collector_club_inventory");
  if (accessTier === "pro") return hasCollectorClubFeature(entitlement, "early_drop_access");

  return false;
}

export function canCheckoutProductForEntitlement(entitlement: CollectorClubEntitlement | null | undefined, product: Product) {
  if (!canViewProductForEntitlement(entitlement, product)) return false;

  const now = Date.now();
  if (product.publicStartsAt) {
    const publicStartsAt = Date.parse(product.publicStartsAt);
    if (Number.isFinite(publicStartsAt) && now < publicStartsAt) {
      return hasCollectorClubFeature(entitlement, "early_drop_access");
    }
  }

  if (product.proOnlyUntil) {
    const proOnlyUntil = Date.parse(product.proOnlyUntil);
    if (Number.isFinite(proOnlyUntil) && now < proOnlyUntil) {
      return hasCollectorClubFeature(entitlement, "early_drop_access");
    }
  }

  return true;
}
