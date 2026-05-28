import { describe, expect, it } from "vitest";
import { getAnonymousCollectorClubEntitlement } from "./entitlements";
import { canCheckoutProductForEntitlement, canViewProductForEntitlement } from "./gates";
import type { Product } from "../types";
import type { CollectorClubEntitlement } from "./types";

function product(overrides: Partial<Product> = {}): Product {
  return {
    id: "item-1",
    slug: "test-card-item-1",
    name: "Test Card",
    category: "single",
    franchise: "Pokemon",
    price: 10,
    quantity: 1,
    status: "listed",
    publicStatus: "available",
    imageUrls: [],
    primaryImageUrl: "",
    actualPhoto: true,
    conditionReviewed: true,
    createdAt: "2026-05-01T00:00:00.000Z",
    updatedAt: "2026-05-01T00:00:00.000Z",
    ...overrides
  };
}

describe("Collector Club product gates", () => {
  const freeMember: CollectorClubEntitlement = { tier: "free", email: "free@example.com" };
  const proMember: CollectorClubEntitlement = { tier: "founding_pro_active", email: "pro@example.com" };

  it("allows public products for anonymous visitors", () => {
    expect(canViewProductForEntitlement(getAnonymousCollectorClubEntitlement(), product())).toBe(true);
    expect(canCheckoutProductForEntitlement(getAnonymousCollectorClubEntitlement(), product())).toBe(true);
  });

  it("requires a Collector Club member for club inventory", () => {
    const clubProduct = product({ accessTier: "collector_club" });

    expect(canViewProductForEntitlement(getAnonymousCollectorClubEntitlement(), clubProduct)).toBe(false);
    expect(canViewProductForEntitlement(freeMember, clubProduct)).toBe(true);
  });

  it("requires Pro access for Pro-only inventory", () => {
    const proProduct = product({ accessTier: "pro" });

    expect(canViewProductForEntitlement(freeMember, proProduct)).toBe(false);
    expect(canViewProductForEntitlement(proMember, proProduct)).toBe(true);
  });

  it("blocks checkout before public release unless the member has early access", () => {
    const earlyProduct = product({ publicStartsAt: "2999-01-01T00:00:00.000Z" });

    expect(canCheckoutProductForEntitlement(freeMember, earlyProduct)).toBe(false);
    expect(canCheckoutProductForEntitlement(proMember, earlyProduct)).toBe(true);
  });
});
