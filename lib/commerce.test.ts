import { describe, expect, it } from "vitest";
import { canCheckoutOnSite, getSitePrice, inferPrimaryChannel, isDirectSiteInventory } from "./commerce";
import type { Product } from "./types";

function product(overrides: Partial<Product>): Product {
  return {
    id: "item-1",
    slug: "test-card-item-1",
    sku: "CIR-ITEM0001",
    name: "Test Card",
    category: "single",
    franchise: "Pokemon",
    condition: "Near Mint",
    price: 10,
    sitePrice: 10,
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

describe("Card Intake inventory compatibility", () => {
  it("allows direct checkout for site-routed inventory", () => {
    const item = product({ primaryChannel: "site", checkoutEnabled: true });

    expect(inferPrimaryChannel(item)).toBe("site");
    expect(isDirectSiteInventory(item)).toBe(true);
    expect(canCheckoutOnSite(item)).toBe(true);
  });

  it("uses the listing price before market/site price fallbacks", () => {
    const item = product({ price: 49.99, sitePrice: 51.54 });

    expect(getSitePrice(item)).toBe(49.99);
  });

  it("allows direct checkout for multi-channel inventory", () => {
    const item = product({ primaryChannel: "multi", externalListingPlatform: "eBay", checkoutEnabled: true });

    expect(isDirectSiteInventory(item)).toBe(true);
    expect(canCheckoutOnSite(item)).toBe(true);
  });

  it("keeps TCGplayer-only inventory visible but not checkoutable", () => {
    const item = product({ primaryChannel: "tcgplayer", tcgplayerPrice: 8, checkoutEnabled: false });

    expect(inferPrimaryChannel(item)).toBe("tcgplayer");
    expect(isDirectSiteInventory(item)).toBe(false);
    expect(canCheckoutOnSite(item)).toBe(false);
  });

  it("does not checkout hold or sold inventory", () => {
    expect(canCheckoutOnSite(product({ primaryChannel: "hold", checkoutEnabled: false }))).toBe(false);
    expect(canCheckoutOnSite(product({ primaryChannel: "site", publicStatus: "sold", quantity: 0 }))).toBe(false);
  });

  it("respects an explicit API checkout disable flag even for site inventory", () => {
    expect(canCheckoutOnSite(product({ primaryChannel: "site", checkoutEnabled: false }))).toBe(false);
  });
});
