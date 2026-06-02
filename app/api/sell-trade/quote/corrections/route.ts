import { NextResponse } from "next/server";
import { createId } from "@/lib/id";
import type { SellTradeQuote } from "@/lib/types";

const rateLimitWindowMs = 10 * 60 * 1000;
const rateLimitMax = 20;
const rateLimits = new Map<string, { count: number; resetAt: number }>();

function getCorrectionsUrl() {
  const baseUrl = process.env.CARD_INTAKE_API_BASE_URL?.replace(/\/$/, "");
  return baseUrl ? `${baseUrl}/api/public/seller-quotes/corrections` : "";
}

function isAllowedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  return origin === new URL(request.url).origin;
}

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

function checkRateLimit(ip: string) {
  const now = Date.now();
  const current = rateLimits.get(ip);

  for (const [key, value] of rateLimits.entries()) {
    if (value.resetAt <= now) rateLimits.delete(key);
  }

  if (!current || current.resetAt <= now) {
    rateLimits.set(ip, { count: 1, resetAt: now + rateLimitWindowMs });
    return true;
  }

  if (current.count >= rateLimitMax) return false;

  current.count += 1;
  return true;
}

function normalizeCorrectionPayload(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const payload = value as Record<string, unknown>;
  const cardReferenceIds = Array.isArray(payload.cardReferenceIds)
    ? payload.cardReferenceIds
        .filter((id): id is string => typeof id === "string")
        .map((id) => id.trim().slice(0, 120))
        .filter(Boolean)
        .slice(0, 24)
    : [];
  const conditionEstimate = typeof payload.conditionEstimate === "string" ? payload.conditionEstimate.trim().slice(0, 120) : undefined;

  if (cardReferenceIds.length === 0) return null;
  return { cardReferenceIds, conditionEstimate };
}

function toCents(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return Math.max(0, Math.round(value));
  return 0;
}

function normalizeQuote(value: unknown): SellTradeQuote | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const payload = value as Record<string, unknown>;
  const cashOfferCents = toCents(payload.cashOfferCents);
  if (!cashOfferCents) return null;

  return {
    id: typeof payload.id === "string" ? payload.id : createId(),
    status: payload.status === "needs_review" ? "needs_review" : "quoted",
    source: "card-intake",
    confidence: payload.confidence === "high" || payload.confidence === "medium" || payload.confidence === "low" ? payload.confidence : "medium",
    cashOfferCents,
    tradeCreditCents: toCents(payload.tradeCreditCents) || Math.round(cashOfferCents * 1.15),
    rangeLowCents: toCents(payload.rangeLowCents) || Math.round(cashOfferCents * 0.85),
    rangeHighCents: toCents(payload.rangeHighCents) || Math.round(cashOfferCents * 1.15),
    detectedCards: Array.isArray(payload.detectedCards)
      ? payload.detectedCards
          .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object" && !Array.isArray(item))
          .map((item) => ({
            cardReferenceId: typeof item.cardReferenceId === "string" ? item.cardReferenceId : undefined,
            name: typeof item.name === "string" ? item.name : "Selected card",
            franchise: typeof item.franchise === "string" ? item.franchise : undefined,
            setName: typeof item.setName === "string" ? item.setName : undefined,
            cardNumber: typeof item.cardNumber === "string" ? item.cardNumber : undefined,
            condition: typeof item.condition === "string" ? item.condition : undefined,
            marketPriceCents: toCents(item.marketPriceCents),
            confidence: typeof item.confidence === "number" ? item.confidence : undefined
          }))
      : [],
    notes: Array.isArray(payload.notes) ? payload.notes.filter((note): note is string => typeof note === "string").slice(0, 5) : [],
    createdAt: typeof payload.createdAt === "string" ? payload.createdAt : new Date().toISOString()
  };
}

export async function POST(request: Request) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  if (!checkRateLimit(getClientIp(request))) {
    return NextResponse.json({ error: "Too many quote updates. Please try again later." }, { status: 429 });
  }

  const correctionsUrl = getCorrectionsUrl();
  if (!correctionsUrl) return NextResponse.json({ error: "Card Intake quote correction is not configured." }, { status: 501 });

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid quote correction payload." }, { status: 400 });
  }

  const normalizedPayload = normalizeCorrectionPayload(payload);
  if (!normalizedPayload) {
    return NextResponse.json({ error: "Choose at least one catalog match to update the quote." }, { status: 400 });
  }

  const response = await fetch(correctionsUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.CARD_INTAKE_API_TOKEN ? { authorization: `Bearer ${process.env.CARD_INTAKE_API_TOKEN}` } : {})
    },
    body: JSON.stringify(normalizedPayload),
    cache: "no-store"
  });
  const result = await response.json().catch(() => null);

  if (!response.ok) {
    return NextResponse.json({ error: result?.error || "Unable to update quote." }, { status: response.status });
  }

  const quote = normalizeQuote(result);
  if (!quote) return NextResponse.json({ error: "Invalid quote correction response." }, { status: 502 });

  return NextResponse.json({ quote });
}
