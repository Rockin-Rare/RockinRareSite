import { NextResponse } from "next/server";
import { releaseCheckoutReservationByInput } from "@/lib/checkout-reservations";

export const runtime = "nodejs";

type CancelRequest = {
  sessionId?: unknown;
};

type StripeCheckoutSession = {
  id: string;
  status?: "open" | "complete" | "expired";
  payment_status?: "paid" | "unpaid" | "no_payment_required";
  metadata?: Record<string, string | undefined>;
};

type CheckoutReservationItem = {
  productId: string;
  sku: string;
  slug: string;
  reservationId: string;
};

function isAllowedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  return origin === new URL(request.url).origin;
}

function cleanSessionId(value: unknown) {
  if (typeof value !== "string") return "";
  const sessionId = value.trim();
  return /^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId) ? sessionId : "";
}

function stripeHeaders(secretKey: string) {
  return {
    Authorization: `Bearer ${secretKey}`,
    "Stripe-Version": "2026-02-25.clover"
  };
}

async function stripeRequest<T>(path: string, init: RequestInit = {}) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Stripe is not configured.");
  }

  const response = await fetch(`https://api.stripe.com/v1${path}`, {
    ...init,
    headers: {
      ...stripeHeaders(secretKey),
      ...(init.headers ?? {})
    }
  });
  const payload = (await response.json().catch(() => ({}))) as T & { error?: { message?: string } };

  if (!response.ok) {
    throw new Error(payload.error?.message || `Stripe API returned ${response.status}.`);
  }

  return payload;
}

function reservationItemsFromSession(session: StripeCheckoutSession): CheckoutReservationItem[] {
  const metadata = session.metadata ?? {};
  const itemCount = Number(metadata.itemCount ?? 0);

  if (Number.isInteger(itemCount) && itemCount > 0) {
    return Array.from({ length: itemCount }, (_, index) => ({
      productId: metadata[`item_${index}_productId`] ?? "",
      sku: metadata[`item_${index}_sku`] ?? "",
      slug: metadata[`item_${index}_slug`] ?? "",
      reservationId: metadata[`item_${index}_reservationId`] ?? ""
    })).filter(isReservationItem);
  }

  return [
    {
      productId: metadata.productId ?? "",
      sku: metadata.sku ?? "",
      slug: metadata.slug ?? "",
      reservationId: metadata.reservationId ?? ""
    }
  ].filter(isReservationItem);
}

function isReservationItem(item: CheckoutReservationItem) {
  return Boolean(item.productId && item.sku && item.slug && item.reservationId);
}

export async function POST(request: Request) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  let body: CancelRequest;

  try {
    body = (await request.json()) as CancelRequest;
  } catch {
    return NextResponse.json({ error: "Invalid cancel payload." }, { status: 400 });
  }

  const sessionId = cleanSessionId(body.sessionId);
  if (!sessionId) {
    return NextResponse.json({ error: "Invalid Stripe session id." }, { status: 400 });
  }

  try {
    const session = await stripeRequest<StripeCheckoutSession>(`/checkout/sessions/${encodeURIComponent(sessionId)}`);

    if (session.status === "complete" || session.payment_status === "paid") {
      return NextResponse.json({ ok: true, released: 0, reason: "checkout_already_paid" });
    }

    if (session.status === "open") {
      await stripeRequest<StripeCheckoutSession>(`/checkout/sessions/${encodeURIComponent(sessionId)}/expire`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: ""
      });
    }

    const items = reservationItemsFromSession(session);
    const results = await Promise.allSettled(items.map((item) => releaseCheckoutReservationByInput(item)));
    const failed = results.filter((result) => result.status === "rejected");

    if (failed.length > 0) {
      console.error("Some checkout cancellation reservations failed to release", failed);
      return NextResponse.json({ error: "Unable to release every reserved item." }, { status: 502 });
    }

    return NextResponse.json({ ok: true, released: items.length });
  } catch (error) {
    console.error("Checkout cancellation cleanup failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to cancel checkout." },
      { status: 502 }
    );
  }
}
