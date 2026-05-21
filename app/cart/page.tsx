import type { Metadata } from "next";
import { CartClient } from "@/components/cart/CartClient";
import { Container } from "@/components/layout/Container";

type PageProps = {
  searchParams?: Promise<{ checkout?: string; session_id?: string }>;
};

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your Rockin Rare Collectibles cart and checkout securely."
};

export default async function CartPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const checkoutStatus = params?.checkout;
  const checkoutSessionId = params?.session_id;

  return (
    <Container className="py-12">
      <CartClient checkoutSessionId={checkoutSessionId} checkoutStatus={checkoutStatus} />
    </Container>
  );
}
