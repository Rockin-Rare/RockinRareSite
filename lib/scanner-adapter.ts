import type { Product, ProductCategory, ProductStatus, PublicProductStatus } from "@/lib/types";
import { slugify } from "@/lib/utils";

export type RawScannerProduct = {
  scanId: string;
  detectedName: string;
  category?: ProductCategory;
  franchise?: string;
  setName?: string;
  cardNumber?: string;
  language?: Product["language"];
  estimatedCondition?: Product["condition"];
  estimatedPrice?: number;
  imageUrls?: string[];
  reviewed?: boolean;
  publishToSite?: boolean;
  createdAt?: string;
};

export function normalizeScannerProduct(raw: RawScannerProduct): Product {
  const reviewed = Boolean(raw.reviewed);
  const published = Boolean(raw.publishToSite && reviewed);
  const status: ProductStatus = published ? "listed" : "needs_review";
  const publicStatus: PublicProductStatus = published ? "available" : "coming_soon";
  const createdAt = raw.createdAt ?? new Date().toISOString();
  const imageUrls = raw.imageUrls ?? [];

  // Scanner app -> inventory database -> admin review -> published website catalog.
  // Scanner records intentionally default to needs_review so uncertain metadata is not public automatically.
  return {
    id: raw.scanId,
    slug: slugify(`${raw.detectedName}-${raw.scanId}`),
    sku: raw.scanId,
    name: raw.detectedName,
    category: raw.category ?? "single",
    franchise: raw.franchise ?? "Unknown",
    setName: raw.setName,
    cardNumber: raw.cardNumber,
    language: raw.language,
    condition: raw.estimatedCondition ?? "Unknown",
    price: raw.estimatedPrice,
    sitePrice: raw.estimatedPrice,
    quantity: 1,
    status,
    publicStatus,
    description: reviewed ? `${raw.detectedName} reviewed from scanner intake.` : "Scanner intake pending manual review.",
    conditionNotes: reviewed ? "Condition reviewed after scanner intake." : "Pending manual condition review.",
    imageUrls,
    primaryImageUrl: imageUrls[0] ?? "",
    actualPhoto: imageUrls.length > 0,
    conditionReviewed: reviewed,
    scanId: raw.scanId,
    createdAt,
    updatedAt: new Date().toISOString()
  };
}
