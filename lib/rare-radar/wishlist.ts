import { getNeonSql, hasNeonDatabase } from "@/lib/db/neon";
import type { AuthUser } from "@/lib/auth/current";

export type WishlistItemStatus = "waiting" | "matched" | "offered" | "claimed" | "passed" | "expired";

export type RareRadarWishlistItem = {
  id: string;
  authUserId: string;
  userEmail: string;
  userName?: string;
  productName: string;
  game: string;
  category: string;
  setName?: string;
  cardNumber?: string;
  language: string;
  desiredCondition: string;
  maxPriceCents?: number;
  alertThreshold: string;
  notes?: string;
  status: WishlistItemStatus;
  createdAt: string;
  updatedAt: string;
};

export type WishlistItemInput = {
  productName: string;
  game: string;
  category: string;
  setName?: string;
  cardNumber?: string;
  language: string;
  desiredCondition: string;
  maxPriceCents?: number;
  alertThreshold: string;
  notes?: string;
};

type WishlistItemRow = {
  id: string;
  auth_user_id: string;
  user_email: string;
  user_name: string | null;
  product_name: string;
  game: string;
  category: string;
  set_name: string | null;
  card_number: string | null;
  language: string;
  desired_condition: string;
  max_price_cents: number | null;
  alert_threshold: string;
  notes: string | null;
  status: WishlistItemStatus;
  created_at: string;
  updated_at: string;
};

export function rareRadarStorageConfigured() {
  return hasNeonDatabase();
}

export async function rareRadarWishlistTableReady() {
  const sql = getNeonSql();
  if (!sql) return false;

  try {
    const rows = (await sql`
      select to_regclass('collector_club.rare_radar_wishlist_items') as table_name
    `) as unknown as Array<{ table_name: string | null }>;

    return Boolean(rows[0]?.table_name);
  } catch (error) {
    logRareRadarStorageError("Failed to check Rare Radar wishlist schema", error);
    return false;
  }
}

export async function getWishlistItemsForUser(authUserId: string): Promise<RareRadarWishlistItem[]> {
  const sql = getNeonSql();
  if (!sql) return [];

  try {
    const rows = (await sql`
      select *
      from collector_club.rare_radar_wishlist_items
      where auth_user_id = ${authUserId}
      order by updated_at desc
    `) as unknown as WishlistItemRow[];

    return rows.map(mapWishlistItemRow);
  } catch (error) {
    logRareRadarStorageError("Failed to load Rare Radar wishlist items", error);
    return [];
  }
}

export async function getAdminWishlistItems(): Promise<RareRadarWishlistItem[]> {
  const sql = getNeonSql();
  if (!sql) return [];

  try {
    const rows = (await sql`
      select *
      from collector_club.rare_radar_wishlist_items
      order by created_at desc
      limit 500
    `) as unknown as WishlistItemRow[];

    return rows.map(mapWishlistItemRow);
  } catch (error) {
    logRareRadarStorageError("Failed to load admin Rare Radar wishlist items", error);
    return [];
  }
}

export async function createWishlistItem(user: AuthUser, input: WishlistItemInput) {
  const sql = getNeonSql();
  if (!sql) return { stored: false as const, reason: "database_unconfigured" as const };

  try {
    const rows = (await sql`
      insert into collector_club.rare_radar_wishlist_items (
        auth_user_id,
        user_email,
        user_name,
        product_name,
        game,
        category,
        set_name,
        card_number,
        language,
        desired_condition,
        max_price_cents,
        alert_threshold,
        notes,
        updated_at
      )
      values (
        ${user.id},
        ${user.email},
        ${user.name || null},
        ${input.productName},
        ${input.game},
        ${input.category},
        ${input.setName || null},
        ${input.cardNumber || null},
        ${input.language},
        ${input.desiredCondition},
        ${input.maxPriceCents ?? null},
        ${input.alertThreshold},
        ${input.notes || null},
        now()
      )
      returning *
    `) as unknown as WishlistItemRow[];

    const item = rows[0];
    return item ? { stored: true as const, item: mapWishlistItemRow(item) } : { stored: false as const, reason: "item_not_returned" as const };
  } catch (error) {
    logRareRadarStorageError("Failed to create Rare Radar wishlist item", error);
    return { stored: false as const, reason: storageFailureReason(error) };
  }
}

export async function updateWishlistItem(authUserId: string, itemId: string, input: WishlistItemInput) {
  const sql = getNeonSql();
  if (!sql) return { stored: false as const, reason: "database_unconfigured" as const };

  try {
    const rows = (await sql`
      update collector_club.rare_radar_wishlist_items
      set
        product_name = ${input.productName},
        game = ${input.game},
        category = ${input.category},
        set_name = ${input.setName || null},
        card_number = ${input.cardNumber || null},
        language = ${input.language},
        desired_condition = ${input.desiredCondition},
        max_price_cents = ${input.maxPriceCents ?? null},
        alert_threshold = ${input.alertThreshold},
        notes = ${input.notes || null},
        updated_at = now()
      where id = ${itemId}
        and auth_user_id = ${authUserId}
      returning *
    `) as unknown as WishlistItemRow[];

    const item = rows[0];
    return item ? { stored: true as const, item: mapWishlistItemRow(item) } : { stored: false as const, reason: "item_not_found" as const };
  } catch (error) {
    logRareRadarStorageError("Failed to update Rare Radar wishlist item", error);
    return { stored: false as const, reason: storageFailureReason(error) };
  }
}

export async function deleteWishlistItem(authUserId: string, itemId: string) {
  const sql = getNeonSql();
  if (!sql) return { deleted: false as const, reason: "database_unconfigured" as const };

  try {
    const rows = (await sql`
      delete from collector_club.rare_radar_wishlist_items
      where id = ${itemId}
        and auth_user_id = ${authUserId}
      returning id
    `) as unknown as Array<{ id: string }>;

    return rows[0] ? { deleted: true as const } : { deleted: false as const, reason: "item_not_found" as const };
  } catch (error) {
    logRareRadarStorageError("Failed to delete Rare Radar wishlist item", error);
    return { deleted: false as const, reason: storageFailureReason(error) };
  }
}

export async function updateAdminWishlistStatus(itemId: string, status: WishlistItemStatus) {
  const sql = getNeonSql();
  if (!sql) return { stored: false as const, reason: "database_unconfigured" as const };

  try {
    const rows = (await sql`
      update collector_club.rare_radar_wishlist_items
      set status = ${status}, updated_at = now()
      where id = ${itemId}
      returning *
    `) as unknown as WishlistItemRow[];

    const item = rows[0];
    return item ? { stored: true as const, item: mapWishlistItemRow(item) } : { stored: false as const, reason: "item_not_found" as const };
  } catch (error) {
    logRareRadarStorageError("Failed to update Rare Radar wishlist status", error);
    return { stored: false as const, reason: storageFailureReason(error) };
  }
}

function mapWishlistItemRow(row: WishlistItemRow): RareRadarWishlistItem {
  return {
    id: row.id,
    authUserId: row.auth_user_id,
    userEmail: row.user_email,
    userName: row.user_name || undefined,
    productName: row.product_name,
    game: row.game,
    category: row.category,
    setName: row.set_name || undefined,
    cardNumber: row.card_number || undefined,
    language: row.language,
    desiredCondition: row.desired_condition,
    maxPriceCents: row.max_price_cents ?? undefined,
    alertThreshold: row.alert_threshold,
    notes: row.notes || undefined,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function storageFailureReason(error: unknown) {
  return isMissingRareRadarTableError(error) ? "schema_unavailable" : "database_error";
}

function isMissingRareRadarTableError(error: unknown) {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === "42P01");
}

function logRareRadarStorageError(action: string, error: unknown) {
  const message = error instanceof Error ? error.message : "unknown error";
  console.warn(`${action}; Rare Radar storage is unavailable. (${message})`);
}
