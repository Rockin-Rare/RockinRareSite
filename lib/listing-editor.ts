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

type ListingEditValue = string | number | boolean | null;

export const productCategoryOptions = ["single", "sealed", "slab", "bundle", "bulk", "accessory"] as const;
export const languageOptions = ["English", "Spanish", "Japanese", "Korean", "Chinese", "Other"] as const;
export const conditionOptions = ["Mint", "Near Mint", "Lightly Played", "Moderately Played", "Heavily Played", "Damaged", "Sealed", "Graded", "Unknown"] as const;
export const gradeCompanyOptions = ["", "PSA", "BGS", "CGC", "TAG", "Other"] as const;
export const statusOptions = ["draft", "scanned", "needs_review", "ready_to_list", "published", "listed_externally", "sold", "hidden"] as const;
export const publicStatusOptions = ["available", "listed", "sold", "coming_soon"] as const;
export const salesChannelOptions = ["", "site", "ebay", "tcgplayer", "multi", "hold"] as const;
export const externalListingPlatformOptions = ["", "eBay", "TCGplayer", "Whatnot", "Instagram", "Other"] as const;

export const editableFieldNames = [
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
] as const satisfies readonly ListingEditField[];

const editableFields = new Set<ListingEditField>(editableFieldNames);
const booleanFields = new Set<ListingEditField>(["checkoutEnabled", "actualPhoto", "conditionReviewed"]);
const numberFields = new Set<ListingEditField>(["price", "sitePrice", "quantity"]);
const priceFields = new Set<ListingEditField>(["price", "sitePrice"]);

type ListingUpdatePayload = {
  productId: string;
  slug: string;
  updates: Partial<Record<ListingEditField, ListingEditValue>>;
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

export function parseListingUpdates(formData: FormData): Partial<Record<ListingEditField, ListingEditValue>> {
  const updates: Partial<Record<ListingEditField, ListingEditValue>> = {};
  const allowPricingUpdate = formData.get("allowPricingUpdate") === "on";

  for (const field of editableFields) {
    if (priceFields.has(field) && !allowPricingUpdate) {
      continue;
    }

    const previousValue = formData.get(originalFieldName(field));
    if (previousValue === null && !formData.has(field)) {
      continue;
    }

    const nextValue = booleanFields.has(field) ? String(formData.has(field)) : String(formData.get(field) ?? "");

    if (previousValue !== null && normalizeComparableValue(nextValue) === normalizeComparableValue(String(previousValue))) {
      continue;
    }

    if (booleanFields.has(field)) {
      updates[field] = formData.has(field);
      continue;
    }

    const trimmedValue = nextValue.trim();
    if (numberFields.has(field)) {
      updates[field] = trimmedValue ? Number(trimmedValue) : null;
      continue;
    }

    updates[field] = trimmedValue || null;
  }

  return updates;
}

export function originalFieldName(field: ListingEditField) {
  return `__original_${field}`;
}

export function originalFieldValue(value: unknown) {
  if (typeof value === "boolean") return String(value);
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "";
  if (typeof value === "string") return value;
  return "";
}

function normalizeComparableValue(value: string) {
  return value.trim();
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
