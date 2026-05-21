import type { CollectorClubEntitlement, CollectorClubFeature, CollectorClubTier } from "./types";

const featureTiers: Record<CollectorClubFeature, Set<CollectorClubTier>> = {
  collector_club_inventory: new Set(["free", "pro_waitlist", "founding_pro_invited", "founding_pro_active", "pro_active", "admin"]),
  early_drop_access: new Set(["founding_pro_invited", "founding_pro_active", "pro_active", "admin"]),
  priority_wishlist: new Set(["founding_pro_active", "pro_active", "admin"]),
  custom_bundle_request: new Set(["founding_pro_active", "pro_active", "admin"]),
  priority_collection_estimate: new Set(["founding_pro_active", "pro_active", "admin"]),
  pro_deals: new Set(["founding_pro_active", "pro_active", "admin"]),
  store_credit: new Set(["pro_active", "admin"])
};

export function getAnonymousCollectorClubEntitlement(): CollectorClubEntitlement {
  return { tier: "none" };
}

export function hasCollectorClubFeature(entitlement: CollectorClubEntitlement | null | undefined, feature: CollectorClubFeature) {
  if (!entitlement) return false;
  return featureTiers[feature].has(entitlement.tier);
}

export function isCollectorClubMember(entitlement: CollectorClubEntitlement | null | undefined) {
  return hasCollectorClubFeature(entitlement, "collector_club_inventory");
}

export function isCollectorClubPro(entitlement: CollectorClubEntitlement | null | undefined) {
  return hasCollectorClubFeature(entitlement, "early_drop_access");
}
