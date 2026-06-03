import type { RareRadarWishlistItem } from "@/lib/rare-radar/wishlist";

export type CardIntakeRareRadarInventoryMatch = {
  inventory: {
    id: string;
    sku: string;
    name: string;
    category: string;
    game: string;
    setName?: string;
    cardNumber?: string;
    language?: string;
    condition: string;
    status: string;
    route: string;
    listable: boolean;
    directSaleEnabled: boolean;
    quantity: number;
    marketPriceCents?: number;
    suggestedPriceCents?: number;
    updatedAt: string;
    adminPath: string;
  };
  score: number;
  reasons: string[];
};

export type CardIntakeRareRadarMatchResult = {
  wishlist: RareRadarWishlistItem;
  matches: CardIntakeRareRadarInventoryMatch[];
};

type CardIntakeRareRadarMatchesPayload = {
  results?: CardIntakeRareRadarMatchResult[];
  counts?: {
    wishlistItems: number;
    inventoryCandidates: number;
  };
  updatedAt?: string;
};

export type CardIntakeRareRadarMatches = {
  results: CardIntakeRareRadarMatchResult[];
  counts: {
    wishlistItems: number;
    inventoryCandidates: number;
  };
  updatedAt?: string;
};

export function hasCardIntakeRareRadarMatchesApi() {
  return Boolean(getCardIntakeRareRadarMatchesUrl() && process.env.CARD_INTAKE_INTERNAL_API_TOKEN);
}

export function getCardIntakeRareRadarAdminUrl(adminPath: string) {
  const baseUrl = process.env.CARD_INTAKE_ADMIN_BASE_URL?.replace(/\/$/, "");
  return baseUrl ? `${baseUrl}${adminPath.startsWith("/") ? adminPath : `/${adminPath}`}` : undefined;
}

export async function getCardIntakeRareRadarMatches(): Promise<CardIntakeRareRadarMatches | null> {
  const url = getCardIntakeRareRadarMatchesUrl();
  const token = process.env.CARD_INTAKE_INTERNAL_API_TOKEN;

  if (!url || !token) return null;

  try {
    const response = await fetch(url, {
      headers: { authorization: `Bearer ${token}` },
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      throw new Error(`Card Intake Rare Radar matches API returned ${response.status}`);
    }

    const payload = (await response.json()) as CardIntakeRareRadarMatchesPayload;
    const results = Array.isArray(payload.results) ? payload.results : [];

    return {
      results,
      counts: {
        wishlistItems: payload.counts?.wishlistItems ?? results.length,
        inventoryCandidates: payload.counts?.inventoryCandidates ?? 0
      },
      updatedAt: payload.updatedAt
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    console.warn(`Failed to load Card Intake Rare Radar matches; using local fallback matching. (${message})`);
    return null;
  }
}

function getCardIntakeRareRadarMatchesUrl() {
  const explicitUrl = process.env.CARD_INTAKE_INTERNAL_MATCHES_URL;
  if (explicitUrl) return explicitUrl;

  const baseUrl = process.env.CARD_INTAKE_API_BASE_URL?.replace(/\/$/, "");
  return baseUrl ? `${baseUrl}/api/internal/rare-radar/matches` : "";
}
