import { NextResponse } from "next/server";
import { canCheckoutOnSite } from "@/lib/commerce";
import { getProducts } from "@/lib/products";
import { createCheckoutSession } from "@/lib/stripe-checkout";

type CheckoutRequest = {
  productId?: unknown;
};

function isAllowedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  return origin === new URL(request.url).origin;
}

function cleanProductId(value: unknown) {
  return typeof value === "string" ? value.trim().slice(0, 120) : "";
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

  const productId = cleanProductId(body.productId);

  if (!productId) {
    return NextResponse.json({ error: "Product is required." }, { status: 400 });
  }

  const products = await getProducts();
  const product = products.find((candidate) => candidate.id === productId);

  if (!product || !canCheckoutOnSite(product)) {
    return NextResponse.json({ error: "This item is not available for direct checkout." }, { status: 409 });
  }

  try {
    const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
    const session = await createCheckoutSession({ product, origin });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error("Stripe checkout failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to start checkout." },
      { status: 502 }
    );
  }
}
