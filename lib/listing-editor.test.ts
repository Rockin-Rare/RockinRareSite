import { describe, expect, it } from "vitest";
import { originalFieldName, originalFieldValue, parseListingUpdates, type ListingEditField } from "./listing-editor";

function formData(values: Record<string, string | number | boolean | undefined>) {
  const data = new FormData();

  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined) return;
    data.set(key, String(value));
  });

  return data;
}

function original(field: ListingEditField, value: unknown) {
  return [originalFieldName(field), originalFieldValue(value)] as const;
}

describe("parseListingUpdates", () => {
  it("only includes fields that changed", () => {
    const updates = parseListingUpdates(
      formData({
        name: "PSA 10 Pikachu Slab",
        language: "Spanish",
        gradeCompany: "PSA",
        grade: "10",
        [original("name", "PSA 10 Pikachu Slab")[0]]: original("name", "PSA 10 Pikachu Slab")[1],
        [original("language", "English")[0]]: original("language", "English")[1],
        [original("gradeCompany", "PSA")[0]]: original("gradeCompany", "PSA")[1],
        [original("grade", "10")[0]]: original("grade", "10")[1]
      })
    );

    expect(updates).toEqual({ language: "Spanish" });
  });

  it("does not include price changes unless pricing updates are explicitly enabled", () => {
    const updates = parseListingUpdates(
      formData({
        price: "0",
        sitePrice: "0",
        language: "Spanish",
        [original("price", 129.99)[0]]: original("price", 129.99)[1],
        [original("sitePrice", 129.99)[0]]: original("sitePrice", 129.99)[1],
        [original("language", "English")[0]]: original("language", "English")[1]
      })
    );

    expect(updates).toEqual({ language: "Spanish" });
  });

  it("includes changed prices only when pricing updates are explicitly enabled", () => {
    const updates = parseListingUpdates(
      formData({
        allowPricingUpdate: "on",
        price: "149.99",
        sitePrice: "139.99",
        [original("price", 129.99)[0]]: original("price", 129.99)[1],
        [original("sitePrice", 129.99)[0]]: original("sitePrice", 129.99)[1]
      })
    );

    expect(updates).toEqual({ price: 149.99, sitePrice: 139.99 });
  });
});
