"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function CollectorClubSignOutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState("");

  async function signOut() {
    setIsSigningOut(true);
    setError("");

    try {
      const response = await fetch("/api/collector-club/session", {
        method: "DELETE"
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error || "Unable to sign out.");
      }

      router.refresh();
    } catch (signOutError) {
      setError(signOutError instanceof Error ? signOutError.message : "Unable to sign out.");
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <div className="grid gap-2">
      <Button disabled={isSigningOut} onClick={signOut} type="button" variant="secondary">
        {isSigningOut ? "Signing Out..." : "Sign Out"}
      </Button>
      {error ? <p className="text-sm font-medium text-vault-error">{error}</p> : null}
    </div>
  );
}
