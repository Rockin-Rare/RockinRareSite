import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { hasAdminSession } from "@/lib/admin-session";
import { listingEditorConfigured } from "@/lib/listing-editor";
import { getProducts } from "@/lib/products";
import { categoryLabel, formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminListingsPage() {
  if (!(await hasAdminSession())) {
    redirect("/admin");
  }

  const products = await getProducts();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-vault-highlight">Admin</p>
          <h1 className="mt-2 text-3xl font-black text-vault-text">Listings</h1>
        </div>
        <Button href="/inventory" variant="secondary">
          View Storefront
        </Button>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-vault-border bg-vault-card">
        <div className="grid grid-cols-[1fr_auto] gap-4 border-b border-vault-border bg-vault-secondary px-4 py-3 text-sm font-semibold text-vault-secondaryText md:grid-cols-[1.6fr_0.8fr_0.8fr_0.7fr_auto]">
          <span>Listing</span>
          <span className="hidden md:block">Type</span>
          <span className="hidden md:block">Details</span>
          <span className="hidden md:block">Price</span>
          <span>Edit</span>
        </div>
        <div className="divide-y divide-vault-border">
          {products.map((product) => (
            <div
              className="grid grid-cols-[1fr_auto] gap-4 px-4 py-4 text-sm md:grid-cols-[1.6fr_0.8fr_0.8fr_0.7fr_auto] md:items-center"
              key={product.id}
            >
              <div>
                <Link className="font-black text-vault-text hover:text-vault-highlight" href={`/inventory/${product.slug}`}>
                  {product.name}
                </Link>
                <p className="mt-1 text-vault-secondaryText">{product.sku ?? product.scanId ?? product.id}</p>
              </div>
              <div className="hidden text-vault-secondaryText md:block">
                {categoryLabel(product.category)}
                <br />
                {product.franchise}
              </div>
              <div className="hidden text-vault-secondaryText md:block">
                {product.language ?? "No language"}
                {product.gradeCompany && product.grade ? (
                  <>
                    <br />
                    {product.gradeCompany} {product.grade}
                  </>
                ) : null}
              </div>
              <div className="hidden font-semibold text-vault-highlight md:block">{formatPrice(product.price)}</div>
              <div className="flex items-center justify-end gap-3">
                {!listingEditorConfigured(product.id) ? <Badge>Read Only</Badge> : null}
                <Button href={`/admin/listings/${product.slug}/edit`} variant="secondary">
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
