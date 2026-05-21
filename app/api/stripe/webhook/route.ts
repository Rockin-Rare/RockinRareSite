import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { notifyCheckoutSale } from "@/lib/sales-notifications";
import { beginStripeWebhookEvent, completeStripeWebhookEvent, failStripeWebhookEvent } from "@/lib/stripe-webhook-events";

export const runtime = "nodejs";

type StripeEvent = {
  id: string;
  type: string;
  data: {
    object: StripeCheckoutSession;
  };
};

type StripeCheckoutSession = {
  id: string;
  payment_intent?: string;
  amount_total?: number;
  currency?: string;
  customer_details?: {
    email?: string;
  };
  customer_email?: string;
  metadata?: {
    productId?: string;
    sku?: string;
    slug?: string;
    reservationId?: string;
    reservedUntil?: string;
    itemCount?: string;
    [key: string]: string | undefined;
  };
};

const toleranceSeconds = 5 * 60;

function verifyStripeSignature(payload: string, signatureHeader: string | null, secret: string) {
  if (!signatureHeader) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((part) => {
      const [key, value] = part.split("=");
      return [key, value];
    })
  );
  const timestamp = parts.t;
  const signature = parts.v1;

  if (!timestamp || !signature) return false;

  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > toleranceSeconds) return false;

  const expected = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  const signatureBuffer = Buffer.from(signature, "hex");

  return expectedBuffer.length === signatureBuffer.length && timingSafeEqual(expectedBuffer, signatureBuffer);
}

function saleFromSession(session: StripeCheckoutSession, status: "paid" | "expired") {
  const metadata = session.metadata ?? {};
  const itemCount = Number(metadata.itemCount ?? 0);
  const items = Number.isInteger(itemCount) && itemCount > 0
    ? Array.from({ length: itemCount }, (_, index) => ({
        productId: metadata[`item_${index}_productId`] ?? "",
        sku: metadata[`item_${index}_sku`] ?? "",
        slug: metadata[`item_${index}_slug`] ?? "",
        reservationId: metadata[`item_${index}_reservationId`],
        amountTotal: Number(metadata[`item_${index}_amountTotal`])
      })).filter((item) => item.productId && item.sku && item.slug)
    : [
        {
          productId: metadata.productId ?? "",
          sku: metadata.sku ?? "",
          slug: metadata.slug ?? "",
          reservationId: metadata.reservationId,
          amountTotal: session.amount_total
        }
      ];

  return {
    productId: metadata.productId ?? items[0]?.productId ?? "",
    sku: metadata.sku ?? items[0]?.sku ?? "",
    slug: metadata.slug ?? items[0]?.slug ?? "",
    reservationId: metadata.reservationId ?? items[0]?.reservationId,
    reservedUntil: metadata.reservedUntil,
    items: items.map((item) => ({
      ...item,
      amountTotal: Number.isFinite(item.amountTotal) ? item.amountTotal : undefined
    })),
    sessionId: session.id,
    paymentIntentId: session.payment_intent,
    amountTotal: session.amount_total,
    currency: session.currency,
    customerEmail: session.customer_details?.email ?? session.customer_email,
    status
  };
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const payload = await request.text();

  if (!webhookSecret) {
    return NextResponse.json({ error: "Stripe webhook is not configured." }, { status: 501 });
  }

  if (!verifyStripeSignature(payload, request.headers.get("stripe-signature"), webhookSecret)) {
    return NextResponse.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }

  let event: StripeEvent;

  try {
    event = JSON.parse(payload) as StripeEvent;
  } catch {
    return NextResponse.json({ error: "Invalid Stripe event payload." }, { status: 400 });
  }

  const eventState = beginStripeWebhookEvent(event.id);
  if (eventState === "completed") return NextResponse.json({ received: true, duplicate: true });
  if (eventState === "processing") return NextResponse.json({ error: "Event is already processing." }, { status: 409 });

  try {
    if (event.type === "checkout.session.completed") {
      await notifyCheckoutSale(saleFromSession(event.data.object, "paid"));
    }

    if (event.type === "checkout.session.expired") {
      await notifyCheckoutSale(saleFromSession(event.data.object, "expired"));
    }

    completeStripeWebhookEvent(event.id);
  } catch (error) {
    failStripeWebhookEvent(event.id);
    console.error("Stripe webhook processing failed", error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 502 });
  }

  return NextResponse.json({ received: true });
}
