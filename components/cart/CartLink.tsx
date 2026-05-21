"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { cn } from "@/lib/utils";

export function CartLink({ className, onClick }: { className?: string; onClick?: () => void }) {
  const { count } = useCart();

  return (
    <Link
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-xl border border-vault-border bg-vault-secondary/80 px-4 py-2.5 text-sm font-semibold text-vault-text transition hover:border-vault-gold hover:bg-vault-elevated hover:text-vault-highlight focus-visible:outline focus-visible:outline-2 focus-visible:outline-vault-highlight",
        className
      )}
      href="/cart"
      onClick={onClick}
    >
      Cart
      {count > 0 ? (
        <span className="ml-2 inline-flex min-w-6 items-center justify-center rounded-full bg-vault-gold px-2 py-0.5 text-xs font-black text-vault-bg">
          {count}
        </span>
      ) : null}
    </Link>
  );
}
