"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentAuthUser } from "@/lib/auth/current";
import {
  createWishlistItem,
  deleteWishlistItem,
  rareRadarWishlistTableReady,
  updateWishlistItem,
  type WishlistItemInput
} from "@/lib/rare-radar/wishlist";

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

function getWishlistInput(formData: FormData): WishlistItemInput {
  return {
    productName: cleanString(formData.get("productName"), 160),
    game: cleanString(formData.get("game"), 80) || "Pokemon",
    category: cleanString(formData.get("category"), 80) || "Single",
    setName: cleanString(formData.get("setName"), 120),
    cardNumber: cleanString(formData.get("cardNumber"), 60),
    language: cleanString(formData.get("language"), 40) || "Either",
    desiredCondition: cleanString(formData.get("desiredCondition"), 80) || "Any",
    maxPriceCents: parseMaxPriceCents(formData.get("maxPrice")),
    alertThreshold: cleanString(formData.get("alertThreshold"), 80) || "Strong price",
    notes: cleanString(formData.get("notes"), 800)
  };
}

function assertValidInput(input: WishlistItemInput) {
  if (!input.productName) {
    throw new Error("Card or product name is required.");
  }
}

export async function createWishlistItemAction(formData: FormData) {
  const user = await getCurrentAuthUser();
  if (!user) redirect("/auth/sign-in?redirectTo=/wishlist");
  if (!(await rareRadarWishlistTableReady())) {
    revalidatePath("/wishlist");
    return;
  }

  const input = getWishlistInput(formData);
  assertValidInput(input);

  await createWishlistItem(user, input);
  revalidatePath("/wishlist");
}

export async function updateWishlistItemAction(formData: FormData) {
  const user = await getCurrentAuthUser();
  if (!user) redirect("/auth/sign-in?redirectTo=/wishlist");
  if (!(await rareRadarWishlistTableReady())) {
    revalidatePath("/wishlist");
    return;
  }

  const itemId = cleanString(formData.get("itemId"), 80);
  const input = getWishlistInput(formData);
  assertValidInput(input);

  if (itemId) {
    await updateWishlistItem(user.id, itemId, input);
  }

  revalidatePath("/wishlist");
}

export async function deleteWishlistItemAction(formData: FormData) {
  const user = await getCurrentAuthUser();
  if (!user) redirect("/auth/sign-in?redirectTo=/wishlist");
  if (!(await rareRadarWishlistTableReady())) {
    revalidatePath("/wishlist");
    return;
  }

  const itemId = cleanString(formData.get("itemId"), 80);
  if (itemId) {
    await deleteWishlistItem(user.id, itemId);
  }

  revalidatePath("/wishlist");
}
