import type { Metadata } from "next";
import { InventoryClient } from "@/components/inventory/InventoryClient";
import { Container } from "@/components/layout/Container";
import { getPublishedProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Current Inventory | Rockin Rare Collectibles",
  description: "Browse current Rockin Rare Collectibles inventory with product photos, conditions, status, and listing links."
};

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const products = await getPublishedProducts();

  return (
    <Container className="py-14">
      <div className="mb-8 max-w-3xl">
        <p className="mb-3 text-sm font-semibold uppercase text-vault-gold">Current Inventory</p>
        <h1 className="text-4xl font-black text-vault-text sm:text-5xl">Browse The Vault</h1>
        <p className="mt-4 text-base leading-7 text-vault-secondaryText">
          Browse current singles, sealed product, slabs, and collector pieces with real photos and clear condition notes.
          Sold items stay visible to show recent activity.
        </p>
      </div>
      <InventoryClient products={products} />
    </Container>
  );
}
