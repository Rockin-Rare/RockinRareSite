"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/admin-session";
import { updateAdminWishlistStatus, type WishlistItemStatus } from "@/lib/rare-radar/wishlist";

const allowedStatuses: WishlistItemStatus[] = ["waiting", "matched", "offered", "claimed", "passed", "expired"];

function cleanString(value: FormDataEntryValue | null, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function isWishlistStatus(value: string): value is WishlistItemStatus {
  return allowedStatuses.includes(value as WishlistItemStatus);
}

export async function updateWishlistStatusAction(formData: FormData) {
  if (!(await hasAdminSession())) {
    redirect("/admin");
  }

  const itemId = cleanString(formData.get("itemId"), 80);
  const status = cleanString(formData.get("status"), 40);

  if (itemId && isWishlistStatus(status)) {
    await updateAdminWishlistStatus(itemId, status);
  }

  revalidatePath("/admin/wishlist");
}
