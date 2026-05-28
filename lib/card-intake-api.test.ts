import { describe, expect, it } from "vitest";
import { normalizePublicProduct } from "./card-intake-api";
import type { Product } from "./types";

function product(overrides: Partial<Product> = {}): Product {
  return {
    id: "item-1",
    slug: "test-card-item-1",
    name: "Test Card",
    category: "single",
    franchise: "Pokemon",
    price: 10,
    quantity: 1,
    status: "listed_externally",
    publicStatus: "listed",
    imageUrls: [],
    primaryImageUrl: "",
    actualPhoto: true,
    conditionReviewed: true,
    createdAt: "2026-05-01T00:00:00.000Z",
    updatedAt: "2026-05-01T00:00:00.000Z",
    ...overrides
  };
}

describe("Card Intake public product normalization", () => {
  it("treats router LISTED inventory as listed site inventory", () => {
    expect(normalizePublicProduct(product()).status).toBe("listed");
  });

  it("does not promote available draft inventory to listed", () => {
    expect(normalizePublicProduct(product({ status: "published", publicStatus: "available" })).status).toBe("published");
  });
});
