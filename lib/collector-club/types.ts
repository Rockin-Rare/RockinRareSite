export type CollectorClubTier = "none" | "free" | "pro_waitlist" | "founding_pro_invited" | "founding_pro_active" | "pro_active" | "admin";

export type CollectorClubFeature =
  | "collector_club_inventory"
  | "early_drop_access"
  | "priority_wishlist"
  | "custom_bundle_request"
  | "priority_collection_estimate"
  | "pro_deals"
  | "store_credit";

export type CollectorClubEntitlement = {
  tier: CollectorClubTier;
  email?: string;
};

export type CollectorClubSignup = {
  name: string;
  email: string;
  collectingFocus: string;
  favoriteSets: string;
  wishlist: string;
  discordUsername: string;
  interestedInPro: boolean;
  source?: string;
};
