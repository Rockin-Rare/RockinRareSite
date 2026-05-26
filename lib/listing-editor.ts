import type { Product } from "@/lib/types";

export type ListingEditField = keyof Pick<
  Product,
  | "name"
  | "category"
  | "franchise"
  | "setName"
  | "cardNumber"
  | "language"
  | "condition"
  | "gradeCompany"
  | "grade"
  | "price"
  | "sitePrice"
  | "quantity"
  | "status"
  | "publicStatus"
  | "primaryChannel"
  | "checkoutEnabled"
  | "description"
  | "conditionNotes"
  | "externalListingUrl"
  | "externalListingPlatform"
  | "actualPhoto"
  | "conditionReviewed"
>;

export const productCategoryOptions = ["single", "sealed", "slab", "bundle", "bulk", "accessory"] as const;
export const languageOptions = ["English", "Spanish", "Japanese", "Korean", "Chinese", "Other"] as const;
export const conditionOptions = ["Mint", "Near Mint", "Lightly Played", "Moderately Played", "Heavily Played", "Damaged", "Sealed", "Graded", "Unknown"] as const;
export const gradeCompanyOptions = ["", "PSA", "BGS", "CGC", "TAG", "Other"] as const;
export const statusOptions = ["draft", "scanned", "needs_review", "ready_to_list", "published", "listed_externally", "sold", "hidden"] as const;
export const publicStatusOptions = ["available", "listed", "sold", "coming_soon"] as const;
export const salesChannelOptions = ["", "site", "ebay", "tcgplayer", "multi", "hold"] as const;
export const externalListingPlatformOptions = ["", "eBay", "TCGplayer", "Whatnot", "Instagram", "Other"] as const;

const editableFields = new Set<ListingEditField>([
  "name",
  "category",
  "franchise",
  "setName",
  "cardNumber",
  "language",
  "condition",
  "gradeCompany",
  "grade",
  "price",
  "sitePrice",
  "quantity",
  "status",
  "publicStatus",
  "primaryChannel",
  "checkoutEnabled",
  "description",
  "conditionNotes",
  "externalListingUrl",
  "externalListingPlatform",
  "actualPhoto",
  "conditionReviewed"
]);

type ListingUpdatePayload = {
  productId: string;
  slug: string;
  updates: Partial<Pick<Product, ListingEditField>>;
};

export function getListingEditUrl(productId: string) {
  const explicitUrl = process.env.CARD_INTAKE_LISTING_EDIT_URL;
  if (explicitUrl) return explicitUrl;

  const baseUrl = process.env.CARD_INTAKE_API_BASE_URL;
  if (!baseUrl) return "";

  return `${baseUrl.replace(/\/$/, "")}/api/admin/inventory/${encodeURIComponent(productId)}`;
}

export function listingEditorConfigured(productId: string) {
  return Boolean(getListingEditUrl(productId));
}

export function parseListingUpdates(formData: FormData): Partial<Pick<Product, ListingEditField>> {
  const updates: Partial<Pick<Product, ListingEditField>> = {};

  for (const field of editableFields) {
    if (field === "checkoutEnabled" || field === "actualPhoto" || field === "conditionReviewed") {
      updates[field] = formData.has(field);
      continue;
    }

    const rawValue = formData.get(field);
    if (rawValue === null) continue;

    if (field === "price" || field === "sitePrice") {
      const value = String(rawValue).trim();
      if (value) updates[field] = Number(value);
      continue;
    }

    if (field === "quantity") {
      const value = String(rawValue).trim();
      if (value) updates.quantity = Number.parseInt(value, 10);
      continue;
    }

    const value = String(rawValue).trim();
    if (value) {
      updates[field] = value as never;
    } else {
      updates[field] = undefined as never;
    }
  }

  return updates;
}

export async function updateListing(payload: ListingUpdatePayload) {
  const url = getListingEditUrl(payload.productId);
  if (!url) {
    throw new Error("Listing edit endpoint is not configured.");
  }

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
      ...authHeaders()
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Listing edit endpoint returned ${response.status}`);
  }
}

function authHeaders(): Record<string, string> {
  const token = process.env.CARD_INTAKE_LISTING_EDIT_TOKEN || process.env.CARD_INTAKE_API_TOKEN;
  return token ? { authorization: `Bearer ${token}` } : {};
}
