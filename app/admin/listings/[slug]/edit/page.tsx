import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { Button } from "@/components/ui/Button";
import { hasAdminSession } from "@/lib/admin-session";
import {
  conditionOptions,
  externalListingPlatformOptions,
  gradeCompanyOptions,
  languageOptions,
  listingEditorConfigured,
  parseListingUpdates,
  productCategoryOptions,
  publicStatusOptions,
  salesChannelOptions,
  statusOptions,
  updateListing
} from "@/lib/listing-editor";
import { getProductBySlugForEntitlement } from "@/lib/products";
import type { Product } from "@/lib/types";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ saved?: string; error?: string }>;
};

export const dynamic = "force-dynamic";

export default async function EditListingPage({ params, searchParams }: PageProps) {
  if (!(await hasAdminSession())) {
    redirect("/admin");
  }

  const { slug } = await params;
  const product = await getProductBySlugForEntitlement(slug, { tier: "admin" });
  const status = await searchParams;

  if (!product) {
    notFound();
  }

  async function saveListing(formData: FormData) {
    "use server";

    if (!(await hasAdminSession())) {
      redirect("/admin");
    }

    const productId = String(formData.get("productId") ?? "");
    const productSlug = String(formData.get("slug") ?? "");

    try {
      await updateListing({
        productId,
        slug: productSlug,
        updates: parseListingUpdates(formData)
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not save listing.";
      redirect(`/admin/listings/${productSlug}/edit?error=${encodeURIComponent(message.slice(0, 180))}`);
    }

    revalidatePath("/inventory");
    revalidatePath(`/inventory/${productSlug}`);
    revalidatePath("/admin/listings");
    redirect(`/admin/listings/${productSlug}/edit?saved=1`);
  }

  const canSave = listingEditorConfigured(product.id);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-vault-highlight">Edit Listing</p>
          <h1 className="mt-2 text-3xl font-black text-vault-text">{product.name}</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button href={`/inventory/${product.slug}`} variant="secondary">
            View Listing
          </Button>
          <Button href="/admin/listings" variant="secondary">
            All Listings
          </Button>
        </div>
      </div>

      {status?.saved ? (
        <div className="mt-6 rounded-xl border border-vault-gold/40 bg-vault-gold/10 px-4 py-3 text-sm font-semibold text-vault-highlight">
          Listing saved.
        </div>
      ) : null}
      {status?.error ? (
        <div className="mt-6 rounded-xl border border-vault-error/50 bg-vault-error/10 px-4 py-3 text-sm font-semibold text-vault-error">
          {status.error}
        </div>
      ) : null}
      {!canSave ? (
        <div className="mt-6 rounded-xl border border-vault-border bg-vault-secondary px-4 py-3 text-sm text-vault-secondaryText">
          Configure <code>CARD_INTAKE_LISTING_EDIT_URL</code> or <code>CARD_INTAKE_API_BASE_URL</code> to save edits.
        </div>
      ) : null}

      <form action={saveListing} className="mt-8 grid gap-6 rounded-2xl border border-vault-border bg-vault-card p-6">
        <input name="productId" type="hidden" value={product.id} />
        <input name="slug" type="hidden" value={product.slug} />

        <section className="grid gap-4 md:grid-cols-2">
          <TextField label="Name" name="name" required value={product.name} />
          <TextField label="Franchise" name="franchise" required value={product.franchise} />
          <SelectField label="Category" name="category" options={productCategoryOptions} value={product.category} />
          <SelectField allowEmpty label="Language" name="language" options={languageOptions} value={product.language} />
          <TextField label="Set" name="setName" value={product.setName} />
          <TextField label="Card Number" name="cardNumber" value={product.cardNumber} />
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <SelectField allowEmpty label="Condition" name="condition" options={conditionOptions} value={product.condition} />
          <SelectField label="Grade Company" name="gradeCompany" options={gradeCompanyOptions} value={product.gradeCompany} />
          <TextField label="Grade" name="grade" placeholder="10, 9.5, Authentic..." value={product.grade} />
          <NumberField label="Quantity" min={0} name="quantity" step={1} value={product.quantity} />
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <NumberField label="Site Price" min={0} name="price" step="0.01" value={product.price} />
          <NumberField label="Direct Checkout Price" min={0} name="sitePrice" step="0.01" value={product.sitePrice} />
          <SelectField label="Internal Status" name="status" options={statusOptions} value={product.status} />
          <SelectField label="Public Status" name="publicStatus" options={publicStatusOptions} value={product.publicStatus} />
          <SelectField label="Primary Channel" name="primaryChannel" options={salesChannelOptions} value={product.primaryChannel} />
          <SelectField
            label="External Platform"
            name="externalListingPlatform"
            options={externalListingPlatformOptions}
            value={product.externalListingPlatform}
          />
          <TextField className="md:col-span-2" label="External Listing URL" name="externalListingUrl" type="url" value={product.externalListingUrl} />
        </section>

        <section className="grid gap-4">
          <TextAreaField label="Description" name="description" value={product.description} />
          <TextAreaField label="Condition Notes" name="conditionNotes" value={product.conditionNotes} />
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          <CheckboxField checked={product.actualPhoto} label="Actual product photo" name="actualPhoto" />
          <CheckboxField checked={product.conditionReviewed} label="Condition reviewed" name="conditionReviewed" />
          <CheckboxField checked={product.checkoutEnabled ?? true} label="Checkout enabled" name="checkoutEnabled" />
        </section>

        <div className="flex justify-end">
          <Button disabled={!canSave} type="submit">
            Save Listing
          </Button>
        </div>
      </form>
    </main>
  );
}

function TextField({
  className,
  label,
  value,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; value?: Product[keyof Product]; className?: string }) {
  return (
    <label className={`grid gap-2 ${className ?? ""}`}>
      <span className="text-sm font-semibold text-vault-text">{label}</span>
      <input
        className="min-h-12 rounded-xl border border-vault-border bg-vault-secondary px-4 py-3 text-sm text-vault-text outline-none transition focus:border-vault-gold focus:ring-2 focus:ring-vault-gold/20"
        defaultValue={typeof value === "string" || typeof value === "number" ? value : ""}
        {...props}
      />
    </label>
  );
}

function NumberField({ value, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; value?: number }) {
  return <TextField type="number" value={value} {...props} />;
}

function SelectField({
  label,
  name,
  options,
  value,
  allowEmpty = false
}: {
  allowEmpty?: boolean;
  label: string;
  name: string;
  options: readonly string[];
  value?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-vault-text">{label}</span>
      <select
        className="min-h-12 rounded-xl border border-vault-border bg-vault-secondary px-4 py-3 text-sm text-vault-text outline-none transition focus:border-vault-gold focus:ring-2 focus:ring-vault-gold/20"
        defaultValue={value ?? ""}
        name={name}
      >
        {allowEmpty ? <option value="">None</option> : null}
        {options.map((option) => (
          <option key={option || "blank"} value={option}>
            {option || "None"}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextAreaField({ label, value, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; value?: string }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-vault-text">{label}</span>
      <textarea
        className="min-h-32 rounded-xl border border-vault-border bg-vault-secondary px-4 py-3 text-sm text-vault-text outline-none transition focus:border-vault-gold focus:ring-2 focus:ring-vault-gold/20"
        defaultValue={value ?? ""}
        {...props}
      />
    </label>
  );
}

function CheckboxField({ checked, label, name }: { checked?: boolean; label: string; name: string }) {
  return (
    <label className="flex min-h-12 items-center gap-3 rounded-xl border border-vault-border bg-vault-secondary px-4 py-3 text-sm font-semibold text-vault-text">
      <input className="size-4 accent-vault-gold" defaultChecked={checked} name={name} type="checkbox" />
      <span>{label}</span>
    </label>
  );
}
