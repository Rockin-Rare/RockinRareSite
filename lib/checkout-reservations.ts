import { getProductSku } from "@/lib/commerce";
import type { Product } from "@/lib/types";

type ReservationResponse = {
  reservationId?: string;
  reservedUntil?: string;
};

type CheckoutReservation = {
  id: string;
  reservedUntil: string;
};

const reservationHoldMinutes = 30;

function getReservationEndpoint() {
  if (process.env.CARD_INTAKE_RESERVATION_URL) {
    return process.env.CARD_INTAKE_RESERVATION_URL;
  }

  const baseUrl = process.env.CARD_INTAKE_API_BASE_URL;
  return baseUrl ? `${baseUrl.replace(/\/$/, "")}/api/public/reservations` : "";
}

function authHeaders(): Record<string, string> {
  const token = process.env.CARD_INTAKE_SALES_WEBHOOK_TOKEN ?? process.env.CARD_INTAKE_API_TOKEN;
  return token ? { authorization: `Bearer ${token}` } : {};
}

function fallbackReservation(product: Product): CheckoutReservation {
  return {
    id: `site-${getProductSku(product)}-${Date.now()}`,
    reservedUntil: new Date(Date.now() + reservationHoldMinutes * 60 * 1000).toISOString()
  };
}

export function getReservationExpiresAt(reservation: CheckoutReservation) {
  const expiresAt = Math.floor(new Date(reservation.reservedUntil).getTime() / 1000);
  const minimumStripeExpiry = Math.floor(Date.now() / 1000) + 30 * 60;
  const maximumStripeExpiry = Math.floor(Date.now() / 1000) + 24 * 60 * 60;

  if (!Number.isFinite(expiresAt)) return minimumStripeExpiry;

  return Math.min(Math.max(expiresAt, minimumStripeExpiry), maximumStripeExpiry);
}

export async function reserveCheckoutProduct(product: Product): Promise<CheckoutReservation> {
  const endpoint = getReservationEndpoint();

  if (!endpoint) {
    return fallbackReservation(product);
  }

  const reservedUntil = new Date(Date.now() + reservationHoldMinutes * 60 * 1000).toISOString();
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders()
    },
    body: JSON.stringify({
      action: "reserve",
      productId: product.id,
      sku: getProductSku(product),
      slug: product.slug,
      reservedUntil
    })
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(errorText || `Unable to reserve this item before checkout (${response.status}).`);
  }

  const payload = (await response.json().catch(() => ({}))) as ReservationResponse;

  return {
    id: payload.reservationId || fallbackReservation(product).id,
    reservedUntil: payload.reservedUntil || reservedUntil
  };
}

export async function releaseCheckoutReservation(product: Product, reservation: CheckoutReservation) {
  const endpoint = getReservationEndpoint();
  if (!endpoint) return;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders()
    },
    body: JSON.stringify({
      action: "release",
      productId: product.id,
      sku: getProductSku(product),
      slug: product.slug,
      reservationId: reservation.id
    })
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(errorText || `Unable to release checkout reservation (${response.status}).`);
  }
}
