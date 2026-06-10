import type { Product } from "./types";
import { getProductSku, getSitePrice } from "./commerce";
import { getReservationExpiresAt } from "./checkout-reservations";

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

function isEnabled(value: string | undefined) {
  return value === "true" || value === "1" || value === "yes";
}

function commaSeparated(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function configuredShippingRateIds() {
  return commaSeparated(
    process.env.STRIPE_SHIPPING_RATE_IDS ||
      process.env.STRIPE_STANDARD_SHIPPING_RATE_ID ||
      process.env.STRIPE_PAID_SHIPPING_RATE_ID ||
      process.env.STRIPE_SHIPPING_RATE_ID
  );
}

function configuredCheckoutShippingRateIds(subtotalCents: number) {
  const standardShippingRateId = process.env.STRIPE_STANDARD_SHIPPING_RATE_ID;
  const freeShippingRateId = process.env.STRIPE_FREE_SHIPPING_RATE_ID;
  const freeShippingMinimumCents = Number(process.env.STRIPE_FREE_SHIPPING_MINIMUM_CENTS);
  const thresholdShippingEnabled = Boolean(freeShippingRateId && Number.isFinite(freeShippingMinimumCents) && freeShippingMinimumCents > 0);

  if (!thresholdShippingEnabled) {
    return configuredShippingRateIds();
  }

  if (subtotalCents >= freeShippingMinimumCents && freeShippingRateId) {
    return [freeShippingRateId];
  }

  if (!standardShippingRateId) {
    throw new Error("Stripe standard shipping rate is not configured.");
  }

  return [standardShippingRateId];
}

function configuredShippingCountries() {
  const countries = commaSeparated(process.env.STRIPE_SHIPPING_ALLOWED_COUNTRIES);
  return countries.length > 0 ? countries : ["US"];
}

function absoluteHttpsUrl(value: string | undefined, origin: string) {
  if (!value) return undefined;

  try {
    const url = new URL(value, origin);
    return url.protocol === "https:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

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
  params.set("cancel_url", `${origin}/cart?checkout=cancelled&session_id={CHECKOUT_SESSION_ID}`);
  params.set("client_reference_id", reservations.map((reservation) => reservation.id).join(",").slice(0, 200));
  params.set("metadata[itemCount]", String(products.length));
  params.set("metadata[soldChannel]", "site");
  params.set("metadata[siteOrigin]", origin.slice(0, 500));
  params.set("metadata[orderSkus]", products.map(getProductSku).join(",").slice(0, 500));
  params.set("expires_at", String(Math.min(...reservations.map(getReservationExpiresAt))));
  configuredShippingCountries().forEach((country, index) => {
    params.set(`shipping_address_collection[allowed_countries][${index}]`, country.toUpperCase());
  });
  params.set("billing_address_collection", isEnabled(process.env.STRIPE_BILLING_ADDRESS_REQUIRED) ? "required" : "auto");
  params.set("payment_intent_data[metadata][itemCount]", String(products.length));
  params.set("payment_intent_data[metadata][soldChannel]", "site");
  params.set("payment_intent_data[metadata][orderSkus]", products.map(getProductSku).join(",").slice(0, 500));
  let subtotalCents = 0;

  if (isEnabled(process.env.STRIPE_PHONE_NUMBER_COLLECTION)) {
    params.set("phone_number_collection[enabled]", "true");
  }

  if (isEnabled(process.env.STRIPE_ALLOW_PROMOTION_CODES)) {
    params.set("allow_promotion_codes", "true");
  }

  if (isEnabled(process.env.STRIPE_REQUIRE_TERMS_OF_SERVICE)) {
    params.set("consent_collection[terms_of_service]", "required");
  }

  products.forEach((product, index) => {
    const price = getSitePrice(product);
    const sku = getProductSku(product);
    const reservation = reservations[index];

    if (typeof price !== "number" || !Number.isFinite(price) || price < 0.5) {
      throw new Error(`${product.name} is not configured for checkout.`);
    }

    const unitAmount = Math.round(price * 100);
    subtotalCents += unitAmount;

    params.set(`line_items[${index}][quantity]`, "1");
    params.set(`line_items[${index}][price_data][currency]`, "usd");
    params.set(`line_items[${index}][price_data][unit_amount]`, String(unitAmount));
    params.set(`line_items[${index}][price_data][product_data][name]`, product.name);
    params.set(`line_items[${index}][price_data][product_data][metadata][productId]`, product.id);
    params.set(`line_items[${index}][price_data][product_data][metadata][sku]`, sku);

    if (product.description) {
      params.set(`line_items[${index}][price_data][product_data][description]`, product.description.slice(0, 1000));
    }

    const imageUrl = absoluteHttpsUrl(product.primaryImageUrl || product.imageUrls[0], origin);
    if (imageUrl) {
      params.set(`line_items[${index}][price_data][product_data][images][0]`, imageUrl);
    }

    params.set(`metadata[item_${index}_productId]`, product.id);
    params.set(`metadata[item_${index}_sku]`, sku);
    params.set(`metadata[item_${index}_slug]`, product.slug);
    params.set(`metadata[item_${index}_reservationId]`, reservation.id);
    params.set(`metadata[item_${index}_amountTotal]`, String(unitAmount));
  });

  params.set("metadata[subtotalCents]", String(subtotalCents));
  params.set("payment_intent_data[metadata][subtotalCents]", String(subtotalCents));

  const firstProduct = products[0];
  const firstReservation = reservations[0];
  params.set("metadata[productId]", firstProduct.id);
  params.set("metadata[sku]", getProductSku(firstProduct));
  params.set("metadata[slug]", firstProduct.slug);
  params.set("metadata[reservationId]", firstReservation.id);
  params.set("metadata[reservedUntil]", firstReservation.reservedUntil);
  params.set("payment_intent_data[metadata][productId]", firstProduct.id);
  params.set("payment_intent_data[metadata][sku]", getProductSku(firstProduct));

  configuredCheckoutShippingRateIds(subtotalCents).forEach((shippingRateId, index) => {
    params.set(`shipping_options[${index}][shipping_rate]`, shippingRateId);
  });

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
