import type { Metadata } from "next";
import { CartClient } from "@/components/cart/CartClient";
import { Container } from "@/components/layout/Container";

type PageProps = {
  searchParams?: Promise<{ checkout?: string }>;
};

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your Rockin Rare Collectibles cart and checkout securely."
};

export default async function CartPage({ searchParams }: PageProps) {
  const checkoutStatus = (await searchParams)?.checkout;

  return (
    <Container className="py-12">
      <CartClient checkoutStatus={checkoutStatus} />
    </Container>
  );
}
