import type { Metadata } from "next";
import { InventoryClient } from "@/components/inventory/InventoryClient";
import { Container } from "@/components/layout/Container";
import { getCurrentCollectorClubEntitlement } from "@/lib/collector-club/current";
import { isCollectorClubPro } from "@/lib/collector-club/entitlements";
import { getPublishedProductsForEntitlement } from "@/lib/products";

export const metadata: Metadata = {
  title: "Current Inventory",
  description: "Browse current Rockin Rare Collectibles inventory with product photos, conditions, status, and listing links.",
  alternates: {
    canonical: "/inventory"
  }
};

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const entitlement = await getCurrentCollectorClubEntitlement();
  const products = await getPublishedProductsForEntitlement(entitlement);
  const memberLabel = entitlement.tier === "none" ? null : isCollectorClubPro(entitlement) ? "Collector Club Pro access active" : "Collector Club access active";

  return (
    <Container className="py-14">
      <div className="mb-8 max-w-3xl">
        <p className="mb-3 text-sm font-semibold uppercase text-vault-gold">Current Inventory</p>
        <h1 className="text-4xl font-black text-vault-text sm:text-5xl">Browse The Vault</h1>
        {memberLabel ? (
          <p className="mt-4 rounded-xl border border-vault-gold/30 bg-vault-gold/10 px-4 py-3 text-sm font-semibold text-vault-highlight">
            {memberLabel}
          </p>
        ) : null}
        <p className="mt-4 text-base leading-7 text-vault-secondaryText">
          Browse current Pokemon, One Piece, Magic, singles, sealed product, slabs, and collector pieces with real photos
          and clear condition notes. Sold items stay visible to show recent activity.
        </p>
      </div>
      <InventoryClient products={products} />
    </Container>
  );
}
