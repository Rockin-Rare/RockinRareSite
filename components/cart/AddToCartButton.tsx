"use client";

import { useState } from "react";
import { useCart, type CartItem } from "@/components/cart/CartProvider";
import { Button } from "@/components/ui/Button";

type AddToCartButtonProps = {
  item: CartItem;
  className?: string;
};

export function AddToCartButton({ item, className }: AddToCartButtonProps) {
  const cart = useCart();
  const [added, setAdded] = useState(false);
  const inCart = cart.hasItem(item.id);

  return (
    <Button
      className={className}
      onClick={() => {
        cart.addItem(item);
        setAdded(true);
      }}
      type="button"
      variant={inCart ? "secondary" : "primary"}
    >
      {inCart || added ? "In Cart" : "Add to Cart"}
    </Button>
  );
}
