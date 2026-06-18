import { NextResponse } from "next/server";
import { createId } from "@/lib/id";
import { sellTradeAllowedImageTypes, sellTradeMaxPhotoSizeBytes, sellTradeMaxPhotoSizeMb, sellTradeMaxPhotos, sellTradeMaxTotalPhotoSizeBytes, sellTradeMaxTotalPhotoSizeMb } from "@/lib/sell-trade-upload-limits";
import { getPhotoSession } from "@/lib/sell-trade-photo-sessions";
import type { SellTradeQuote, SellTradeQuoteCatalogCandidate, SellTradeQuoteDetectedCard } from "@/lib/types";

function cleanString(value: FormDataEntryValue | null, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function getSessionFiles(formData: FormData) {
  const sessionId = cleanString(formData.get("photoSession"), 80);
  if (!/^[a-zA-Z0-9-]{16,80}$/.test(sessionId)) return [];

  return getPhotoSession(sessionId).map((photo) => new File([photo.bytes], photo.name, { type: photo.type }));
}

function validateFiles(files: File[]) {
  let totalSize = 0;

  for (const file of files) {
    totalSize += file.size;

    if (!sellTradeAllowedImageTypes.has(file.type)) {
      return "Photos must be JPG, PNG, WebP, GIF, HEIC, or HEIF images.";
    }

    if (file.size > sellTradeMaxPhotoSizeBytes) {
      return `Each photo must be ${sellTradeMaxPhotoSizeMb} MB or smaller.`;
    }
  }

  if (totalSize > sellTradeMaxTotalPhotoSizeBytes) {
    return `Photo uploads must be ${sellTradeMaxTotalPhotoSizeMb} MB total or smaller.`;
  }

  return "";
}

function getQuoteUrl() {
  if (process.env.CARD_INTAKE_QUOTE_API_URL) return process.env.CARD_INTAKE_QUOTE_API_URL;

  const baseUrl = process.env.CARD_INTAKE_API_BASE_URL?.replace(/\/$/, "");
  return baseUrl ? `${baseUrl}/api/public/seller-quotes` : "";
}

function isAllowedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  return origin === new URL(request.url).origin;
}

function toCents(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.round(value));
  }

  if (typeof value === "string") {
    const parsed = Number(value.replace(/[$,]/g, ""));
    if (Number.isFinite(parsed)) return Math.max(0, Math.round(parsed * 100));
  }

  return 0;
}

function normalizeDetectedCards(value: unknown): SellTradeQuoteDetectedCard[] {
  if (!Array.isArray(value)) return [];

  return value
    .slice(0, 12)
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object" && !Array.isArray(item))
    .map((item) => ({
      cardReferenceId: typeof item.cardReferenceId === "string" ? item.cardReferenceId.trim().slice(0, 120) : undefined,
      name: typeof item.name === "string" && item.name.trim() ? item.name.trim().slice(0, 120) : "Detected card",
      franchise: typeof item.franchise === "string" ? item.franchise.trim().slice(0, 80) : undefined,
      setName: typeof item.setName === "string" ? item.setName.trim().slice(0, 120) : undefined,
      cardNumber: typeof item.cardNumber === "string" ? item.cardNumber.trim().slice(0, 80) : undefined,
      condition: typeof item.condition === "string" ? item.condition.trim().slice(0, 80) : undefined,
      marketPriceCents: toCents(item.marketPriceCents ?? item.marketPrice),
      confidence: typeof item.confidence === "number" ? Math.max(0, Math.min(1, item.confidence)) : undefined,
      catalogCandidates: normalizeCatalogCandidates(item.catalogCandidates)
    }));
}

function normalizeCatalogCandidates(value: unknown): SellTradeQuoteCatalogCandidate[] {
  if (!Array.isArray(value)) return [];

  return value
    .slice(0, 8)
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object" && !Array.isArray(item))
    .map((item) => ({
      id: typeof item.id === "string" ? item.id.trim().slice(0, 120) : "",
      name: typeof item.name === "string" && item.name.trim() ? item.name.trim().slice(0, 120) : "Catalog card",
      franchise: typeof item.franchise === "string" ? item.franchise.trim().slice(0, 80) : undefined,
      setName: typeof item.setName === "string" ? item.setName.trim().slice(0, 120) : undefined,
      cardNumber: typeof item.cardNumber === "string" ? item.cardNumber.trim().slice(0, 80) : undefined,
      variant: typeof item.variant === "string" ? item.variant.trim().slice(0, 120) : undefined,
      score: typeof item.score === "number" ? Math.max(0, Math.min(1, item.score)) : undefined,
      imageUrl: typeof item.imageUrl === "string" ? item.imageUrl.trim().slice(0, 500) : undefined
    }))
    .filter((item) => item.id);
}

function normalizeRouterQuote(value: unknown): SellTradeQuote | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const payload = value as Record<string, unknown>;
  const cashOfferCents = toCents(payload.cashOfferCents ?? payload.cashOffer ?? payload.cash);
  const tradeCreditCents = toCents(payload.tradeCreditCents ?? payload.tradeCredit ?? payload.trade);

  if (!cashOfferCents && !tradeCreditCents) return null;

  const rangeLowCents = toCents(payload.rangeLowCents ?? payload.rangeLow) || Math.round(cashOfferCents * 0.85);
  const rangeHighCents = toCents(payload.rangeHighCents ?? payload.rangeHigh) || Math.round(cashOfferCents * 1.15);
  const confidence = payload.confidence === "high" || payload.confidence === "medium" || payload.confidence === "low" ? payload.confidence : "medium";

  return {
    id: typeof payload.id === "string" ? payload.id : createId(),
    status: payload.status === "needs_review" ? "needs_review" : "quoted",
    source: "card-intake",
    confidence,
    cashOfferCents,
    tradeCreditCents: tradeCreditCents || Math.round(cashOfferCents * 1.15),
    rangeLowCents,
    rangeHighCents,
    detectedCards: normalizeDetectedCards(payload.detectedCards ?? payload.items ?? payload.cards),
    notes: Array.isArray(payload.notes) ? payload.notes.filter((note): note is string => typeof note === "string").slice(0, 5) : [],
    createdAt: typeof payload.createdAt === "string" ? payload.createdAt : new Date().toISOString()
  };
}

async function getRouterQuote(formData: FormData) {
  const quoteUrl = getQuoteUrl();
  if (!quoteUrl) return null;

  const response = await fetch(quoteUrl, {
    method: "POST",
    headers: {
      ...(process.env.CARD_INTAKE_API_TOKEN ? { authorization: `Bearer ${process.env.CARD_INTAKE_API_TOKEN}` } : {})
    },
    body: formData,
    cache: "no-store"
  });

  if (!response.ok) return null;

  return normalizeRouterQuote(await response.json().catch(() => null));
}

function parseQuantity(value: string, fileCount: number) {
  const match = value.match(/\d+/);
  if (!match) return Math.max(1, fileCount);

  return Math.max(1, Math.min(80, Number(match[0])));
}

function estimateQuote({
  files,
  franchise,
  approximateQuantity,
  conditionEstimate,
  description
}: {
  files: File[];
  franchise: string;
  approximateQuantity: string;
  conditionEstimate: string;
  description: string;
}): SellTradeQuote {
  const combined = `${franchise} ${conditionEstimate} ${description}`.toLowerCase();
  const quantity = parseQuantity(approximateQuantity, files.length);
  const isSealed = /\b(sealed|box|booster|etb|pack|case)\b/.test(combined);
  const isSlab = /\b(psa|bgs|cgc|tag|slab|graded|grade)\b/.test(combined);
  const isBulk = /\b(bulk|common|uncommon|binder)\b/.test(combined);
  const conditionFactor = /\b(mint|near mint|nm|sealed|psa 10|gem)\b/.test(combined)
    ? 1.15
    : /\b(damaged|heavy|hp|played|poor)\b/.test(combined)
      ? 0.45
      : /\b(light|lp|moderate|mp)\b/.test(combined)
        ? 0.75
        : 0.9;
  const franchiseFactor = franchise === "Pokemon" ? 1.1 : franchise === "One Piece" ? 1.05 : franchise === "Sports" ? 0.95 : 1;
  const baseCents = isSealed ? 7000 : isSlab ? 6000 : isBulk ? 65 : 1800;
  const marketEstimateCents = Math.round(baseCents * quantity * conditionFactor * franchiseFactor);
  const cashOfferCents = Math.max(500, Math.round(marketEstimateCents * 0.65));
  const tradeCreditCents = Math.round(marketEstimateCents * 0.8);

  return {
    id: createId(),
    status: "needs_review",
    source: "site-estimate",
    confidence: files.length >= 3 || isSealed || isSlab ? "medium" : "low",
    cashOfferCents,
    tradeCreditCents,
    rangeLowCents: Math.round(cashOfferCents * 0.75),
    rangeHighCents: Math.round(cashOfferCents * 1.25),
    detectedCards: files.map((file, index) => ({
      name: `Scan ${index + 1}`,
      franchise,
      condition: conditionEstimate || "Needs review",
      confidence: 0.35,
      marketPriceCents: Math.round(marketEstimateCents / Math.max(1, files.length))
    })),
    notes: [
      "Preliminary estimate from seller-provided photos and details.",
      "Final offer depends on exact card identity, condition, authenticity, demand, and in-person/photo review."
    ],
    createdAt: new Date().toISOString()
  };
}

export async function POST(request: Request) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid quote payload." }, { status: 400 });
  }

  const files = formData
    .getAll("photos")
    .filter((value): value is File => value instanceof File && value.size > 0)
    .slice(0, sellTradeMaxPhotos);
  const sessionFiles = getSessionFiles(formData);
  const allFiles = [...files, ...sessionFiles].slice(0, sellTradeMaxPhotos);

  if (allFiles.length === 0) {
    return NextResponse.json({ error: "Add at least one card photo to get a quote." }, { status: 400 });
  }

  const fileError = validateFiles(allFiles);
  if (fileError) {
    return NextResponse.json({ error: fileError }, { status: 400 });
  }

  sessionFiles.forEach((file) => formData.append("photos", file));
  const routerQuote = await getRouterQuote(formData).catch(() => null);
  if (routerQuote) return NextResponse.json({ quote: routerQuote });

  return NextResponse.json({
    quote: estimateQuote({
      files: allFiles,
      franchise: cleanString(formData.get("franchise"), 80) || "Mixed collection",
      approximateQuantity: cleanString(formData.get("approximateQuantity"), 120),
      conditionEstimate: cleanString(formData.get("conditionEstimate"), 120),
      description: cleanString(formData.get("description"), 3000)
    })
  });
}
