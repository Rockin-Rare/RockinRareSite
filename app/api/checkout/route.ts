import { NextResponse } from "next/server";
import { getCurrentCollectorClubEntitlement } from "@/lib/collector-club/current";
import { canCheckoutProductForEntitlement } from "@/lib/collector-club/gates";
import { canCheckoutOnSite } from "@/lib/commerce";
import { releaseCheckoutReservation, reserveCheckoutProduct } from "@/lib/checkout-reservations";
import { getLocalCheckoutTestProduct, getProducts } from "@/lib/products";
import { createCheckoutSession } from "@/lib/stripe-checkout";
import type { Product } from "@/lib/types";

type CheckoutRequest = {
  productId?: unknown;
  productIds?: unknown;
};

const maxCheckoutItems = 8;

function isAllowedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  return origin === new URL(request.url).origin;
}

function cleanProductIds(body: CheckoutRequest) {
  const rawIds = Array.isArray(body.productIds) ? body.productIds : body.productId ? [body.productId] : [];
  return [...new Set(rawIds.map((value) => (typeof value === "string" ? value.trim().slice(0, 120) : "")).filter(Boolean))];
}

async function releaseReservations(products: Product[], reservations: Array<{ id: string; reservedUntil: string }>) {
  await Promise.allSettled(
    reservations.map((reservation, index) => {
      const product = products[index];
      return product ? releaseCheckoutReservation(product, reservation) : Promise.resolve();
    })
  );
}

export async function POST(request: Request) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  let body: CheckoutRequest;

  try {
    body = (await request.json()) as CheckoutRequest;
  } catch {
    return NextResponse.json({ error: "Invalid checkout payload." }, { status: 400 });
  }

  const productIds = cleanProductIds(body);

  if (productIds.length === 0) {
    return NextResponse.json({ error: "At least one product is required." }, { status: 400 });
  }

  if (productIds.length > maxCheckoutItems) {
    return NextResponse.json({ error: `Checkout supports up to ${maxCheckoutItems} items at a time.` }, { status: 400 });
  }

  const localProductsById = new Map(
    productIds
      .map((productId) => getLocalCheckoutTestProduct(productId))
      .filter((product): product is Product => Boolean(product))
      .map((product) => [product.id, product])
  );
  const productsById =
    localProductsById.size === productIds.length
      ? localProductsById
      : new Map([...localProductsById, ...(await getProducts()).map((product) => [product.id, product] as const)]);
  const checkoutProducts = productIds.map((productId) => productsById.get(productId)).filter((product): product is Product => Boolean(product));
  const entitlement = await getCurrentCollectorClubEntitlement();

  if (
    checkoutProducts.length !== productIds.length ||
    checkoutProducts.some((product) => !canCheckoutOnSite(product) || !canCheckoutProductForEntitlement(entitlement, product))
  ) {
    return NextResponse.json({ error: "One or more items are not available for direct checkout." }, { status: 409 });
  }

  const reservations: Array<{ id: string; reservedUntil: string }> = [];

  try {
    const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;

    for (const product of checkoutProducts) {
      reservations.push(await reserveCheckoutProduct(product));
    }

    const session = await createCheckoutSession({ products: checkoutProducts, origin, reservations });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (error) {
    if (reservations.length > 0) {
      await releaseReservations(checkoutProducts, reservations);
    }

    console.error("Stripe checkout failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to start checkout." },
      { status: 502 }
    );
  }
}
