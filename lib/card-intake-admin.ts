import type { Product } from "@/lib/types";

export function getCardIntakeAdminBaseUrl() {
  return process.env.CARD_INTAKE_ADMIN_BASE_URL?.replace(/\/$/, "") ?? "";
}

export function cardIntakeAdminConfigured() {
  return Boolean(getCardIntakeAdminBaseUrl());
}

export function getCardIntakeListingEditUrl(product: Product) {
  const baseUrl = getCardIntakeAdminBaseUrl();
  if (!baseUrl) return "";

  const identifier = encodeURIComponent(product.scanId ?? product.sku ?? product.id);
  return `${baseUrl}/inventory/${identifier}/edit`;
}
