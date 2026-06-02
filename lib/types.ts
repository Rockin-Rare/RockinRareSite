export type ProductStatus =
  | "draft"
  | "scanned"
  | "needs_review"
  | "ready_to_list"
  | "published"
  | "listed"
  | "listed_externally"
  | "sold"
  | "hidden";

export type PublicProductStatus = "available" | "listed" | "sold" | "coming_soon";

export type ProductCategory = "single" | "sealed" | "slab" | "bundle" | "bulk" | "accessory";

export type SalesChannel = "site" | "ebay" | "tcgplayer" | "multi" | "hold";

export type SoldChannel = "site" | "ebay" | "tcgplayer" | "in_person" | "other";

export type ProductAccessTier = "public" | "collector_club" | "pro";

export type Product = {
  id: string;
  slug: string;
  sku?: string;
  name: string;
  category: ProductCategory;
  franchise: string;
  setName?: string;
  cardNumber?: string;
  language?: "English" | "Spanish" | "Japanese" | "Korean" | "Chinese" | "Other";
  condition?:
    | "Mint"
    | "Near Mint"
    | "Lightly Played"
    | "Moderately Played"
    | "Heavily Played"
    | "Damaged"
    | "Sealed"
    | "Graded"
    | "Unknown";
  gradeCompany?: "PSA" | "BGS" | "CGC" | "TAG" | "Other";
  grade?: string;
  price?: number;
  sitePrice?: number;
  ebayPrice?: number;
  tcgplayerPrice?: number;
  quantity?: number;
  status: ProductStatus;
  publicStatus: PublicProductStatus;
  accessTier?: ProductAccessTier;
  earlyAccessStartsAt?: string;
  publicStartsAt?: string;
  proOnlyUntil?: string;
  dropId?: string;
  dropName?: string;
  primaryChannel?: SalesChannel;
  checkoutEnabled?: boolean;
  description?: string;
  conditionNotes?: string;
  imageUrls: string[];
  primaryImageUrl: string;
  externalListingUrl?: string;
  externalListingPlatform?: "eBay" | "TCGplayer" | "Whatnot" | "Instagram" | "Other";
  actualPhoto: boolean;
  conditionReviewed: boolean;
  scanId?: string;
  reservedUntil?: string;
  soldAt?: string;
  soldChannel?: SoldChannel;
  createdAt: string;
  updatedAt: string;
};

export type SellTradeSubmission = {
  name: string;
  email: string;
  phone?: string;
  preferredContactMethod: "Email" | "Phone" | "Instagram";
  offerPreference?: "Cash payout" | "Trade credit" | "Decide after final review";
  description: string;
  franchise?: string;
  approximateQuantity?: string;
  conditionEstimate?: string;
  imageUrls?: string[];
  quoteId?: string;
  quoteSummary?: string;
  message?: string;
  createdAt: string;
};

export type SellTradeQuoteDetectedCard = {
  cardReferenceId?: string;
  name: string;
  franchise?: string;
  setName?: string;
  cardNumber?: string;
  condition?: string;
  marketPriceCents?: number;
  confidence?: number;
  catalogCandidates?: SellTradeQuoteCatalogCandidate[];
};

export type SellTradeQuoteCatalogCandidate = {
  id: string;
  name: string;
  franchise?: string;
  setName?: string;
  cardNumber?: string;
  variant?: string;
  score?: number;
  imageUrl?: string;
};

export type SellTradeQuote = {
  id: string;
  status: "quoted" | "needs_review";
  source: "card-intake" | "site-estimate";
  confidence: "high" | "medium" | "low";
  cashOfferCents: number;
  tradeCreditCents: number;
  rangeLowCents: number;
  rangeHighCents: number;
  detectedCards: SellTradeQuoteDetectedCard[];
  notes: string[];
  createdAt: string;
};

export type ContactSubmission = {
  name: string;
  email: string;
  subject?: string;
  message: string;
  createdAt: string;
};
