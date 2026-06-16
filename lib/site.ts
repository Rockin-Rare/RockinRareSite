export const siteName = "Rockin Rare Collectibles";

export const shortSiteName = "Rockin Rare";

export const siteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL || "https://rockinrarecollectibles.com");

export const defaultDescription =
  "Pokemon, One Piece, Riftbound, Magic: The Gathering, sealed product, slabs, singles, and collection finds with real photos, clear condition notes, and careful packing.";

export const contactEmail = "rockinrare@gmail.com";

export const instagramHandle = "rockinrarecollectibles";

export const tcgplayerStoreUrl = "https://www.tcgplayer.com/sellers/Rockin-Rare-Coll/472d0061";

export const tcgplayerRating = "100% positive";

export const tcgplayerSales = "83 sales";

export const tcgplayerRatingDate = "June 2026";

export const staticRoutes = [
  {
    path: "/",
    priority: 1,
    changeFrequency: "weekly" as const
  },
  {
    path: "/inventory",
    priority: 0.9,
    changeFrequency: "daily" as const
  },
  {
    path: "/wishlist",
    priority: 0.8,
    changeFrequency: "monthly" as const
  },
  {
    path: "/sell-trade",
    priority: 0.8,
    changeFrequency: "monthly" as const
  },
  {
    path: "/collector-club",
    priority: 0.7,
    changeFrequency: "monthly" as const
  },
  {
    path: "/about",
    priority: 0.6,
    changeFrequency: "monthly" as const
  },
  {
    path: "/faq",
    priority: 0.6,
    changeFrequency: "monthly" as const
  },
  {
    path: "/return-policy",
    priority: 0.5,
    changeFrequency: "monthly" as const
  },
  {
    path: "/contact",
    priority: 0.6,
    changeFrequency: "monthly" as const
  }
];

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//.test(path)) return path;

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${normalizedPath}`;
}

function normalizeSiteUrl(value: string) {
  return value.replace(/\/+$/, "");
}
