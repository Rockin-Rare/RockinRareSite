import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductImageFrame } from "@/components/inventory/ProductImageFrame";
import { ProductMetaRow } from "@/components/inventory/ProductMetaRow";
import { ProductStatusBadge } from "@/components/inventory/ProductStatusBadge";
import { RelatedProducts } from "@/components/inventory/RelatedProducts";
import { Container } from "@/components/layout/Container";
import { TrustPromise } from "@/components/marketing/TrustPromise";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getProductBySlug, getRelatedProducts } from "@/lib/products";
import { categoryLabel, formatPrice } from "@/lib/utils";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return {
    title: product ? `${product.name} | Rockin Rare Collectibles` : "Inventory Item | Rockin Rare Collectibles",
    description: product?.description ?? "Rockin Rare Collectibles product detail page."
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const related = await getRelatedProducts(product);
  const sold = product.publicStatus === "sold";
  const mailSubject = encodeURIComponent(`Question about ${product.name}`);

  return (
    <Container className="py-12">
      <nav className="mb-6 text-sm text-vault-secondaryText" aria-label="Breadcrumb">
        <Link className="hover:text-vault-highlight" href="/inventory">
          Inventory
        </Link>
        <span className="mx-2 text-vault-muted">/</span>
        <span className="text-vault-text">{product.name}</span>
      </nav>

      <section className="grid gap-8 lg:grid-cols-[0.95fr_1fr]">
        <div className="group">
          <ProductImageFrame
            alt={product.name}
            className="aspect-[4/5] w-full"
            priority
            sold={sold}
            src={product.primaryImageUrl}
          />
        </div>
        <div className="rounded-2xl border border-vault-border bg-vault-card p-6">
          <div className="flex flex-wrap gap-2">
            <ProductStatusBadge status={product.publicStatus} />
            {product.actualPhoto ? <Badge>Actual Product Photo</Badge> : null}
            {product.conditionReviewed ? <Badge tone="gold">Condition Reviewed</Badge> : null}
          </div>
          <h1 className="mt-5 text-3xl font-black text-vault-text sm:text-4xl">{product.name}</h1>
          <p className="mt-4 text-3xl font-black text-vault-highlight">{formatPrice(product.price)}</p>
          <dl className="mt-6">
            <ProductMetaRow label="Category" value={categoryLabel(product.category)} />
            <ProductMetaRow label="Franchise" value={product.franchise} />
            <ProductMetaRow label="Set" value={product.setName} />
            <ProductMetaRow label="Card Number" value={product.cardNumber} />
            <ProductMetaRow label="Language" value={product.language} />
            <ProductMetaRow label="Condition" value={product.condition} />
            <ProductMetaRow label="Grade" value={product.gradeCompany && product.grade ? `${product.gradeCompany} ${product.grade}` : undefined} />
            <ProductMetaRow label="Quantity" value={product.quantity} />
          </dl>
          {product.description ? <p className="mt-6 leading-7 text-vault-secondaryText">{product.description}</p> : null}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {!sold && product.externalListingUrl ? (
              <Button href={product.externalListingUrl} target="_blank" rel="noreferrer">
                View on {product.externalListingPlatform ?? "Listing"}
              </Button>
            ) : (
              <Button href={`mailto:contact@rockinrarecollectibles.com?subject=${mailSubject}`}>
                {sold ? "Contact About Similar Items" : "Contact About This Item"}
              </Button>
            )}
            <Button href="/inventory" variant="secondary">
              Back to Inventory
            </Button>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border border-vault-border bg-vault-card p-6">
          <h2 className="text-xl font-black text-vault-text">Condition Notes</h2>
          <p className="mt-4 leading-7 text-vault-secondaryText">
            {product.conditionNotes ?? "Condition notes are pending manual review."}
          </p>
        </div>
        <div className="rounded-2xl border border-vault-border bg-vault-card p-6">
          <h2 className="text-xl font-black text-vault-text">Packaging & Shipping</h2>
          <p className="mt-4 leading-7 text-vault-secondaryText">
            Cards and sealed product are packed with collector-level care using sleeves, top loaders, team bags, boxes,
            and padding when appropriate.
          </p>
        </div>
      </section>

      <div className="mt-10">
        <TrustPromise compact />
      </div>
      <RelatedProducts products={related} />
    </Container>
  );
}
