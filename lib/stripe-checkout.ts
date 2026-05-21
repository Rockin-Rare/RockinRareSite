import type { Product } from "@/lib/types";
import { getProductSku, getSitePrice } from "@/lib/commerce";
import { getReservationExpiresAt } from "@/lib/checkout-reservations";

type StripeCheckoutSession = {
  id: string;
  url: string | null;
};

type CheckoutReservation = {
  id: string;
  reservedUntil: string;
};

type CheckoutSessionInput = {
  products: Product[];
  origin: string;
  reservations: CheckoutReservation[];
};

const stripeApiVersion = "2026-02-25.clover";

export async function createCheckoutSession({ products, origin, reservations }: CheckoutSessionInput) {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("Stripe is not configured.");
  }

  if (products.length === 0 || products.length !== reservations.length) {
    throw new Error("Checkout items are not configured correctly.");
  }

  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("success_url", `${origin}/cart?checkout=success`);
  params.set("cancel_url", `${origin}/cart?checkout=cancelled`);
  params.set("client_reference_id", reservations.map((reservation) => reservation.id).join(",").slice(0, 200));
  params.set("metadata[itemCount]", String(products.length));
  params.set("metadata[soldChannel]", "site");
  params.set("expires_at", String(Math.min(...reservations.map(getReservationExpiresAt))));
  params.set("shipping_address_collection[allowed_countries][0]", "US");
  params.set("billing_address_collection", "auto");
  params.set("payment_intent_data[metadata][itemCount]", String(products.length));

  products.forEach((product, index) => {
    const price = getSitePrice(product);
    const sku = getProductSku(product);
    const reservation = reservations[index];

    if (typeof price !== "number" || !Number.isFinite(price) || price < 0.5) {
      throw new Error(`${product.name} is not configured for checkout.`);
    }

    params.set(`line_items[${index}][quantity]`, "1");
    params.set(`line_items[${index}][price_data][currency]`, "usd");
    params.set(`line_items[${index}][price_data][unit_amount]`, String(Math.round(price * 100)));
    params.set(`line_items[${index}][price_data][product_data][name]`, product.name);
    params.set(`line_items[${index}][price_data][product_data][metadata][productId]`, product.id);
    params.set(`line_items[${index}][price_data][product_data][metadata][sku]`, sku);

    if (product.description) {
      params.set(`line_items[${index}][price_data][product_data][description]`, product.description.slice(0, 1000));
    }

    params.set(`metadata[item_${index}_productId]`, product.id);
    params.set(`metadata[item_${index}_sku]`, sku);
    params.set(`metadata[item_${index}_slug]`, product.slug);
    params.set(`metadata[item_${index}_reservationId]`, reservation.id);
    params.set(`metadata[item_${index}_amountTotal]`, String(Math.round(price * 100)));
  });

  const firstProduct = products[0];
  const firstReservation = reservations[0];
  params.set("metadata[productId]", firstProduct.id);
  params.set("metadata[sku]", getProductSku(firstProduct));
  params.set("metadata[slug]", firstProduct.slug);
  params.set("metadata[reservationId]", firstReservation.id);
  params.set("metadata[reservedUntil]", firstReservation.reservedUntil);
  params.set("payment_intent_data[metadata][productId]", firstProduct.id);
  params.set("payment_intent_data[metadata][sku]", getProductSku(firstProduct));

  if (process.env.STRIPE_SHIPPING_RATE_ID) {
    params.set("shipping_options[0][shipping_rate]", process.env.STRIPE_SHIPPING_RATE_ID);
  }

  if (process.env.STRIPE_TAX_ENABLED === "true") {
    params.set("automatic_tax[enabled]", "true");
  }

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Stripe-Version": stripeApiVersion,
      "Idempotency-Key": `checkout-${reservations.map((reservation) => reservation.id).join("-")}`.slice(0, 255)
    },
    body: params
  });

  const payload = (await response.json()) as StripeCheckoutSession & { error?: { message?: string } };

  if (!response.ok) {
    throw new Error(payload.error?.message || "Stripe Checkout session failed.");
  }

  if (!payload.url) {
    throw new Error("Stripe Checkout did not return a redirect URL.");
  }

  return payload;
}
