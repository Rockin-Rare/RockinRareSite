"use client";

import { useEffect } from "react";
import { track } from "@vercel/analytics";

export function WishlistReferralTracker({ referralSource }: { referralSource: string }) {
  useEffect(() => {
    if (!referralSource) return;

    track("wishlist_referral_visit", {
      referralSource
    });
  }, [referralSource]);

  return null;
}
