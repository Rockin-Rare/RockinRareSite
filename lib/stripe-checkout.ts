import type { Product } from "@/lib/types";
import { getProductSku, getSitePrice } from "@/lib/commerce";

type StripeCheckoutSession = {
  id: string;
  url: string | null;
};

type CheckoutSessionInput = {
  product: Product;
  origin: string;
};

const stripeApiVersion = "2026-02-25.clover";

export async function createCheckoutSession({ product, origin }: CheckoutSessionInput) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const price = getSitePrice(product);

  if (!secretKey) {
    throw new Error("Stripe is not configured.");
  }

  if (typeof price !== "number" || !Number.isFinite(price) || price < 0.5) {
    throw new Error("Product is not configured for checkout.");
  }

  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("success_url", `${origin}/inventory/${product.slug}?checkout=success`);
  params.set("cancel_url", `${origin}/inventory/${product.slug}?checkout=cancelled`);
  params.set("client_reference_id", getProductSku(product));
  params.set("metadata[productId]", product.id);
  params.set("metadata[sku]", getProductSku(product));
  params.set("metadata[slug]", product.slug);
  params.set("metadata[soldChannel]", "site");
  params.set("line_items[0][quantity]", "1");
  params.set("line_items[0][price_data][currency]", "usd");
  params.set("line_items[0][price_data][unit_amount]", String(Math.round(price * 100)));
  params.set("line_items[0][price_data][product_data][name]", product.name);
  params.set("line_items[0][price_data][product_data][metadata][productId]", product.id);
  params.set("line_items[0][price_data][product_data][metadata][sku]", getProductSku(product));
  params.set("shipping_address_collection[allowed_countries][0]", "US");
  params.set("billing_address_collection", "auto");
  params.set("payment_intent_data[metadata][productId]", product.id);
  params.set("payment_intent_data[metadata][sku]", getProductSku(product));

  if (process.env.STRIPE_SHIPPING_RATE_ID) {
    params.set("shipping_options[0][shipping_rate]", process.env.STRIPE_SHIPPING_RATE_ID);
  }

  if (process.env.STRIPE_TAX_ENABLED === "true") {
    params.set("automatic_tax[enabled]", "true");
  }

  if (product.description) {
    params.set("line_items[0][price_data][product_data][description]", product.description.slice(0, 1000));
  }

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Stripe-Version": stripeApiVersion
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
