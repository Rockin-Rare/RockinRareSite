"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

type CheckoutButtonProps = {
  productId: string;
};

export function CheckoutButton({ productId }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function startCheckout() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId })
      });
      const payload = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !payload.url) {
        throw new Error(payload.error || "Unable to start checkout.");
      }

      window.location.href = payload.url;
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Unable to start checkout.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={startCheckout} disabled={loading}>
        {loading ? "Opening Checkout..." : "Buy"}
      </Button>
      {error ? <p className="text-sm font-medium text-red-300">{error}</p> : null}
    </div>
  );
}
