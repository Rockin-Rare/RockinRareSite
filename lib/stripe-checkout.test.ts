import { afterEach, describe, expect, it, vi } from "vitest";
import { createCheckoutSession } from "./stripe-checkout";
import type { Product } from "./types";

const product: Product = {
  id: "prod-001",
  slug: "japanese-pokemon-151-booster-box",
  name: "Japanese Pokemon 151 Booster Box",
  category: "sealed",
  franchise: "Pokemon",
  language: "Japanese",
  condition: "Sealed",
  price: 189.99,
  quantity: 1,
  status: "listed",
  publicStatus: "available",
  imageUrls: ["/products/test.svg"],
  primaryImageUrl: "/products/test.svg",
  actualPhoto: true,
  conditionReviewed: true,
  createdAt: "2026-05-21T00:00:00.000Z",
  updatedAt: "2026-05-21T00:00:00.000Z"
};

describe("Stripe Checkout session creation", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("creates a hosted Checkout Session with reservation metadata, tax, and shipping", async () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_mock");
    vi.stubEnv("STRIPE_SHIPPING_RATE_ID", "shr_test_mock");
    vi.stubEnv("STRIPE_TAX_ENABLED", "true");

    const fetchMock = vi.fn(async () =>
      Response.json({
        id: "cs_test_123",
        url: "https://checkout.stripe.com/c/pay/cs_test_123"
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const session = await createCheckoutSession({
      products: [product],
      origin: "https://rockinrarecollectibles.com",
      reservations: [{ id: "reservation-123", reservedUntil: new Date(Date.now() + 45 * 60 * 1000).toISOString() }]
    });

    expect(session.url).toContain("checkout.stripe.com");
    expect(fetchMock).toHaveBeenCalledOnce();

    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    const params = new URLSearchParams(init.body as string);

    expect(headers.Authorization).toBe("Bearer sk_test_mock");
    expect(headers["Stripe-Version"]).toBe("2026-02-25.clover");
    expect(headers["Idempotency-Key"]).toContain("reservation-123");
    expect(params.get("mode")).toBe("payment");
    expect(params.get("success_url")).toBe("https://rockinrarecollectibles.com/cart?checkout=success");
    expect(params.get("cancel_url")).toBe("https://rockinrarecollectibles.com/cart?checkout=cancelled&session_id={CHECKOUT_SESSION_ID}");
    expect(params.get("shipping_options[0][shipping_rate]")).toBe("shr_test_mock");
    expect(params.get("shipping_address_collection[allowed_countries][0]")).toBe("US");
    expect(params.get("automatic_tax[enabled]")).toBe("true");
    expect(params.get("metadata[item_0_productId]")).toBe(product.id);
    expect(params.get("metadata[item_0_reservationId]")).toBe("reservation-123");
    expect(params.get("metadata[soldChannel]")).toBe("site");
    expect(params.get("metadata[orderSkus]")).toBe(product.id);
    expect(params.get("payment_intent_data[metadata][soldChannel]")).toBe("site");
    expect(params.get("line_items[0][price_data][unit_amount]")).toBe("18999");
    expect(params.get("line_items[0][price_data][product_data][images][0]")).toBe("https://rockinrarecollectibles.com/products/test.svg");
  });

  it("supports optional Stripe checkout controls from environment", async () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_mock");
    vi.stubEnv("STRIPE_SHIPPING_RATE_IDS", "shr_standard, shr_priority");
    vi.stubEnv("STRIPE_SHIPPING_ALLOWED_COUNTRIES", "US,CA");
    vi.stubEnv("STRIPE_BILLING_ADDRESS_REQUIRED", "true");
    vi.stubEnv("STRIPE_PHONE_NUMBER_COLLECTION", "true");
    vi.stubEnv("STRIPE_ALLOW_PROMOTION_CODES", "true");
    vi.stubEnv("STRIPE_REQUIRE_TERMS_OF_SERVICE", "true");

    const fetchMock = vi.fn(async () =>
      Response.json({
        id: "cs_test_123",
        url: "https://checkout.stripe.com/c/pay/cs_test_123"
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    await createCheckoutSession({
      products: [product],
      origin: "https://rockinrarecollectibles.com",
      reservations: [{ id: "reservation-123", reservedUntil: new Date(Date.now() + 45 * 60 * 1000).toISOString() }]
    });

    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    const params = new URLSearchParams(init.body as string);

    expect(params.get("shipping_options[0][shipping_rate]")).toBe("shr_standard");
    expect(params.get("shipping_options[1][shipping_rate]")).toBe("shr_priority");
    expect(params.get("shipping_address_collection[allowed_countries][0]")).toBe("US");
    expect(params.get("shipping_address_collection[allowed_countries][1]")).toBe("CA");
    expect(params.get("billing_address_collection")).toBe("required");
    expect(params.get("phone_number_collection[enabled]")).toBe("true");
    expect(params.get("allow_promotion_codes")).toBe("true");
    expect(params.get("consent_collection[terms_of_service]")).toBe("required");
  });

  it("uses the standard shipping rate below the free shipping minimum", async () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_mock");
    vi.stubEnv("STRIPE_SHIPPING_RATE_ID", "shr_legacy_free");
    vi.stubEnv("STRIPE_STANDARD_SHIPPING_RATE_ID", "shr_standard");
    vi.stubEnv("STRIPE_FREE_SHIPPING_RATE_ID", "shr_free");
    vi.stubEnv("STRIPE_FREE_SHIPPING_MINIMUM_CENTS", "7500");

    const fetchMock = vi.fn(async () =>
      Response.json({
        id: "cs_test_123",
        url: "https://checkout.stripe.com/c/pay/cs_test_123"
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    await createCheckoutSession({
      products: [{ ...product, price: 49.99 }],
      origin: "https://rockinrarecollectibles.com",
      reservations: [{ id: "reservation-123", reservedUntil: new Date(Date.now() + 45 * 60 * 1000).toISOString() }]
    });

    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    const params = new URLSearchParams(init.body as string);

    expect(params.get("shipping_options[0][shipping_rate]")).toBe("shr_standard");
    expect(params.get("shipping_options[1][shipping_rate]")).toBeNull();
    expect(params.get("metadata[subtotalCents]")).toBe("4999");
  });

  it("does not fall back to the legacy shipping rate in threshold mode", async () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_mock");
    vi.stubEnv("STRIPE_SHIPPING_RATE_ID", "shr_legacy_free");
    vi.stubEnv("STRIPE_FREE_SHIPPING_RATE_ID", "shr_free");
    vi.stubEnv("STRIPE_FREE_SHIPPING_MINIMUM_CENTS", "7500");

    await expect(
      createCheckoutSession({
        products: [{ ...product, price: 54.99 }],
        origin: "https://rockinrarecollectibles.com",
        reservations: [{ id: "reservation-123", reservedUntil: new Date(Date.now() + 45 * 60 * 1000).toISOString() }]
      })
    ).rejects.toThrow("Stripe standard shipping rate is not configured.");
  });

  it("uses only the free shipping rate at or above the free shipping minimum", async () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_mock");
    vi.stubEnv("STRIPE_STANDARD_SHIPPING_RATE_ID", "shr_standard");
    vi.stubEnv("STRIPE_FREE_SHIPPING_RATE_ID", "shr_free");
    vi.stubEnv("STRIPE_FREE_SHIPPING_MINIMUM_CENTS", "7500");

    const fetchMock = vi.fn(async () =>
      Response.json({
        id: "cs_test_123",
        url: "https://checkout.stripe.com/c/pay/cs_test_123"
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    await createCheckoutSession({
      products: [{ ...product, price: 75 }],
      origin: "https://rockinrarecollectibles.com",
      reservations: [{ id: "reservation-123", reservedUntil: new Date(Date.now() + 45 * 60 * 1000).toISOString() }]
    });

    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    const params = new URLSearchParams(init.body as string);

    expect(params.get("shipping_options[0][shipping_rate]")).toBe("shr_free");
    expect(params.get("shipping_options[1][shipping_rate]")).toBeNull();
    expect(params.get("metadata[subtotalCents]")).toBe("7500");
  });
});
