import { getAnonymousCollectorClubEntitlement } from "./entitlements";
import { getCurrentAuthUser } from "@/lib/auth/current";
import { getCollectorClubEntitlementByEmail } from "./members";

export async function getCurrentCollectorClubEntitlement() {
  const user = await getCurrentAuthUser();
  if (!user) {
    return getAnonymousCollectorClubEntitlement();
  }

  const entitlement = await getCollectorClubEntitlementByEmail(user.email);
  return entitlement ?? { tier: "none", email: user.email };
}
