import { NextRequest, NextResponse } from "next/server";
import type { SellTradeQuoteCatalogCandidate } from "@/lib/types";

const rateLimitWindowMs = 10 * 60 * 1000;
const rateLimitMax = 30;
const rateLimits = new Map<string, { count: number; resetAt: number }>();

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

function getCatalogUrl(request: NextRequest) {
  const baseUrl = process.env.CARD_INTAKE_API_BASE_URL?.replace(/\/$/, "");
  if (!baseUrl) return "";

  const url = new URL(`${baseUrl}/api/public/seller-quotes/catalog`);
  const query = request.nextUrl.searchParams.get("q")?.trim().slice(0, 80) ?? "";
  const productType = request.nextUrl.searchParams.get("productType")?.trim() ?? "";
  if (query) url.searchParams.set("q", query);
  if (productType) url.searchParams.set("productType", productType);
  return url.toString();
}

function normalizeCards(value: unknown): SellTradeQuoteCatalogCandidate[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  const cards = (value as { cards?: unknown }).cards;
  if (!Array.isArray(cards)) return [];

  return cards
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object" && !Array.isArray(item))
    .map((item) => ({
      id: typeof item.id === "string" ? item.id : "",
      name: typeof item.name === "string" ? item.name : "Catalog card",
      franchise: typeof item.franchise === "string" ? item.franchise : undefined,
      setName: typeof item.setName === "string" ? item.setName : undefined,
      cardNumber: typeof item.cardNumber === "string" ? item.cardNumber : undefined,
      variant: typeof item.variant === "string" ? item.variant : undefined,
      imageUrl: typeof item.imageUrl === "string" ? item.imageUrl : undefined
    }))
    .filter((item) => item.id);
}

export async function GET(request: NextRequest) {
  if (!checkRateLimit(getClientIp(request))) {
    return NextResponse.json({ error: "Too many catalog searches. Please try again later." }, { status: 429 });
  }

  const query = request.nextUrl.searchParams.get("q")?.trim().slice(0, 80) ?? "";
  if (query.length < 2) return NextResponse.json({ cards: [] });

  const catalogUrl = getCatalogUrl(request);
  if (!catalogUrl) return NextResponse.json({ cards: [] });

  const response = await fetch(catalogUrl, {
    headers: {
      ...(process.env.CARD_INTAKE_API_TOKEN ? { authorization: `Bearer ${process.env.CARD_INTAKE_API_TOKEN}` } : {})
    },
    cache: "no-store"
  });

  if (!response.ok) return NextResponse.json({ cards: [] });

  return NextResponse.json({ cards: normalizeCards(await response.json().catch(() => null)) });
}
