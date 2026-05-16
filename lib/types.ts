export type ProductStatus =
  | "draft"
  | "scanned"
  | "needs_review"
  | "ready_to_list"
  | "published"
  | "listed_externally"
  | "sold"
  | "hidden";

export type PublicProductStatus = "available" | "listed" | "sold" | "coming_soon";

export type ProductCategory = "single" | "sealed" | "slab" | "bundle" | "bulk" | "accessory";

export type SalesChannel = "site" | "ebay" | "tcgplayer" | "multi" | "hold";

export type SoldChannel = "site" | "ebay" | "tcgplayer" | "in_person" | "other";

export type Product = {
  id: string;
  slug: string;
  sku?: string;
  name: string;
  category: ProductCategory;
  franchise: string;
  setName?: string;
  cardNumber?: string;
  language?: "English" | "Japanese" | "Korean" | "Chinese" | "Other";
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
  description: string;
  franchise?: string;
  approximateQuantity?: string;
  conditionEstimate?: string;
  imageUrls?: string[];
  message?: string;
  createdAt: string;
};

export type ContactSubmission = {
  name: string;
  email: string;
  subject?: string;
  message: string;
  createdAt: string;
};
