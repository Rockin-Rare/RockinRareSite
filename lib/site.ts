export const siteName = "Rockin Rare Collectibles";

export const siteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL || "https://rockinrarecollectibles.com");

export const defaultDescription =
  "Collector-first Pokemon, One Piece, Magic: The Gathering, sealed product, slabs, singles, and rare finds with real product photos and transparent condition notes.";

export const contactEmail = "contact@rockinrarecollectibles.com";

export const instagramHandle = "rockinrarecollectibles";

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
