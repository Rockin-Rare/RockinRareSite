"use client";

import Link from "next/link";
import { useEffect } from "react";
import { CheckoutButton } from "@/components/inventory/CheckoutButton";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/components/cart/CartProvider";
import { formatPrice } from "@/lib/utils";

export function CartClient({ checkoutStatus }: { checkoutStatus?: string }) {
  const cart = useCart();

  useEffect(() => {
    if (checkoutStatus === "success") {
      cart.clearCart();
    }
  }, [cart, checkoutStatus]);

  if (cart.items.length === 0) {
    return (
      <div className="rounded-2xl border border-vault-border bg-vault-card p-8 shadow-vault">
        {checkoutStatus === "success" ? (
          <p className="mb-4 rounded-xl border border-vault-gold/40 bg-vault-gold/10 px-4 py-3 text-sm font-semibold text-vault-highlight">
            Payment received. We will review the order and prepare your items for shipment.
          </p>
        ) : null}
        <h1 className="text-3xl font-black text-vault-text">Your cart is empty</h1>
        <p className="mt-3 max-w-2xl leading-7 text-vault-secondaryText">
          Add available direct-buy items from inventory, then checkout securely through Stripe.
        </p>
        <Button className="mt-6" href="/inventory">
          Shop Inventory
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <section className="rounded-2xl border border-vault-border bg-vault-card p-5 shadow-vault">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-vault-border pb-4">
          <div>
            <p className="text-sm font-semibold uppercase text-vault-gold">Cart</p>
            <h1 className="mt-2 text-3xl font-black text-vault-text">Ready For Checkout</h1>
          </div>
          <button className="text-sm font-semibold text-vault-secondaryText hover:text-vault-highlight" onClick={cart.clearCart} type="button">
            Clear cart
          </button>
        </div>
        <div className="divide-y divide-vault-border">
          {cart.items.map((item) => (
            <article className="grid gap-4 py-5 sm:grid-cols-[96px_1fr_auto] sm:items-center" key={item.id}>
              <Link className="relative aspect-[4/5] overflow-hidden rounded-lg border border-vault-border bg-vault-bg" href={`/inventory/${item.slug}`}>
                {item.imageUrl ? <img alt={item.name} className="h-full w-full object-contain p-2" src={item.imageUrl} /> : null}
              </Link>
              <div>
                <Link className="font-black text-vault-text hover:text-vault-highlight" href={`/inventory/${item.slug}`}>
                  {item.name}
                </Link>
                {item.sku ? <p className="mt-1 text-xs font-semibold text-vault-muted">SKU {item.sku}</p> : null}
                <p className="mt-2 text-lg font-black text-vault-highlight">{formatPrice(item.price)}</p>
              </div>
              <button
                className="min-h-10 rounded-xl border border-vault-border px-4 py-2 text-sm font-semibold text-vault-secondaryText hover:border-vault-gold hover:text-vault-highlight"
                onClick={() => cart.removeItem(item.id)}
                type="button"
              >
                Remove
              </button>
            </article>
          ))}
        </div>
      </section>
      <aside className="h-fit rounded-2xl border border-vault-border bg-vault-card p-5 shadow-vault">
        {checkoutStatus === "cancelled" ? (
          <p className="mb-4 rounded-xl border border-vault-border bg-vault-secondary px-4 py-3 text-sm font-semibold text-vault-secondaryText">
            Checkout was cancelled. Items stay in your cart, but availability can change.
          </p>
        ) : null}
        <h2 className="text-xl font-black text-vault-text">Order Summary</h2>
        <div className="mt-5 space-y-3 border-y border-vault-border py-4 text-sm">
          <div className="flex justify-between gap-4 text-vault-secondaryText">
            <span>Items</span>
            <span>{cart.count}</span>
          </div>
          <div className="flex justify-between gap-4 text-vault-secondaryText">
            <span>Subtotal</span>
            <span>{formatPrice(cart.subtotal)}</span>
          </div>
          <p className="text-xs leading-5 text-vault-muted">Shipping and any applicable tax are calculated in Stripe Checkout.</p>
        </div>
        <CheckoutButton
          label={`Checkout ${formatPrice(cart.subtotal)}`}
          loadingLabel="Opening Checkout..."
          productIds={cart.items.map((item) => item.id)}
        />
        <Button className="mt-3 w-full" href="/inventory" variant="secondary">
          Continue Shopping
        </Button>
      </aside>
    </div>
  );
}
