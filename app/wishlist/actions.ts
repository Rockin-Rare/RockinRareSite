"use server";

import { redirect } from "next/navigation";
import { getCurrentAuthUser } from "@/lib/auth/current";
import {
  createWishlistItem,
  deleteWishlistItem,
  type RareRadarWishlistItem,
  rareRadarWishlistTableReady,
  updateWishlistItem,
  type WishlistItemInput
} from "@/lib/rare-radar/wishlist";

export type WishlistSaveResult = { ok: true; item: RareRadarWishlistItem } | { ok: false; error: string };
export type WishlistDeleteResult = { ok: true; itemId: string } | { ok: false; error: string };

function cleanString(value: FormDataEntryValue | null, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function parseMaxPriceCents(value: FormDataEntryValue | null) {
  const raw = cleanString(value, 20);
  if (!raw) return undefined;

  const amount = Number(raw.replace(/[$,]/g, ""));
  if (!Number.isFinite(amount) || amount <= 0) return undefined;

  return Math.round(amount * 100);
}

function cleanUrl(value: FormDataEntryValue | null, maxLength: number) {
  const raw = cleanString(value, maxLength);
  if (!raw) return "";

  try {
    const url = new URL(raw);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function getWishlistInput(formData: FormData): WishlistItemInput {
  return {
    productName: cleanString(formData.get("productName"), 160),
    game: cleanString(formData.get("game"), 80) || "Pokemon",
    category: cleanString(formData.get("category"), 80) || "Single",
    setName: cleanString(formData.get("setName"), 120),
    cardNumber: cleanString(formData.get("cardNumber"), 60),
    language: cleanString(formData.get("language"), 40) || "English",
    desiredCondition: cleanString(formData.get("desiredCondition"), 80) || "Any",
    maxPriceCents: parseMaxPriceCents(formData.get("maxPrice")),
    alertThreshold: cleanString(formData.get("alertThreshold"), 80) || "Strong price",
    notes: cleanString(formData.get("notes"), 800),
    imageUrl: cleanUrl(formData.get("imageUrl"), 500)
  };
}

function assertValidInput(input: WishlistItemInput) {
  if (!input.productName) {
    return "Card or product name is required.";
  }

  return "";
}

export async function createWishlistItemAction(formData: FormData): Promise<WishlistSaveResult> {
  const user = await getCurrentAuthUser();
  if (!user) redirect("/auth/sign-in?redirectTo=/wishlist");
  if (!(await rareRadarWishlistTableReady())) {
    return { ok: false, error: "Rare Radar storage is not ready yet." };
  }

  const input = getWishlistInput(formData);
  const inputError = assertValidInput(input);
  if (inputError) return { ok: false, error: inputError };

  const result = await createWishlistItem(user, input);
  return result.stored ? { ok: true, item: result.item } : { ok: false, error: "Unable to add this wishlist item." };
}

export async function updateWishlistItemAction(formData: FormData): Promise<WishlistSaveResult> {
  const user = await getCurrentAuthUser();
  if (!user) redirect("/auth/sign-in?redirectTo=/wishlist");
  if (!(await rareRadarWishlistTableReady())) {
    return { ok: false, error: "Rare Radar storage is not ready yet." };
  }

  const itemId = cleanString(formData.get("itemId"), 80);
  const input = getWishlistInput(formData);
  const inputError = assertValidInput(input);
  if (inputError) return { ok: false, error: inputError };

  if (!itemId) return { ok: false, error: "Wishlist item is missing." };

  const result = await updateWishlistItem(user.id, itemId, input);
  return result.stored ? { ok: true, item: result.item } : { ok: false, error: "Unable to save this wishlist item." };
}

export async function deleteWishlistItemAction(formData: FormData): Promise<WishlistDeleteResult> {
  const user = await getCurrentAuthUser();
  if (!user) redirect("/auth/sign-in?redirectTo=/wishlist");
  if (!(await rareRadarWishlistTableReady())) {
    return { ok: false, error: "Rare Radar storage is not ready yet." };
  }

  const itemId = cleanString(formData.get("itemId"), 80);
  if (!itemId) return { ok: false, error: "Wishlist item is missing." };

  const result = await deleteWishlistItem(user.id, itemId);
  return result.deleted ? { ok: true, itemId } : { ok: false, error: "Unable to delete this wishlist item." };
}
