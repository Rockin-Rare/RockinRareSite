import { describe, expect, it } from "vitest";
import { isPublicInventoryProduct } from "./product-visibility";

describe("public inventory status gate", () => {
  it("only exposes listed inventory", () => {
    expect(isPublicInventoryProduct({ status: "listed" })).toBe(true);
    expect(isPublicInventoryProduct({ status: "draft" })).toBe(false);
    expect(isPublicInventoryProduct({ status: "published" })).toBe(false);
    expect(isPublicInventoryProduct({ status: "listed_externally" })).toBe(false);
    expect(isPublicInventoryProduct({ status: "sold" })).toBe(false);
    expect(isPublicInventoryProduct({ status: "hidden" })).toBe(false);
  });
});
