import { cookies } from "next/headers";
import { getAnonymousCollectorClubEntitlement } from "./entitlements";
import { collectorClubSessionCookieName, getCollectorClubEntitlementFromCookieValue } from "./session";

export async function getCurrentCollectorClubEntitlement() {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(collectorClubSessionCookieName)?.value;

  if (!sessionValue) {
    return getAnonymousCollectorClubEntitlement();
  }

  return getCollectorClubEntitlementFromCookieValue(sessionValue);
}
