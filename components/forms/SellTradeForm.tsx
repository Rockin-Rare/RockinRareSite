"use client";

import { FormEvent, useState } from "react";
import { FileUploadPlaceholder } from "@/components/forms/FileUploadPlaceholder";
import { FormInput } from "@/components/forms/FormInput";
import { FormSelect } from "@/components/forms/FormSelect";
import { FormTextarea } from "@/components/forms/FormTextarea";
import { Button } from "@/components/ui/Button";
import type { InstantQuoteModuleState } from "@/components/sell-trade/InstantQuoteModule";

type FormState = {
  name: string;
  email: string;
  phone: string;
  preferredContactMethod: "Email" | "Phone" | "Instagram";
  description: string;
  franchise: string;
  approximateQuantity: string;
  conditionEstimate: string;
};

const initialState: FormState = {
  name: "",
  email: "",
  phone: "",
  preferredContactMethod: "Email",
  description: "",
  franchise: "Mixed collection",
  approximateQuantity: "",
  conditionEstimate: ""
};

const maxLengths = {
  name: 120,
  email: 254,
  phone: 40,
  description: 3000,
  approximateQuantity: 120,
  conditionEstimate: 120
};

const emptyQuoteState: InstantQuoteModuleState = {
  files: [],
  photoSession: "",
  quote: null,
  selectedPhotoCount: 0
};

export function SellTradeForm({ quoteState = emptyQuoteState }: { quoteState?: InstantQuoteModuleState }) {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [submitError, setSubmitError] = useState("");
  const [detailFiles, setDetailFiles] = useState<File[]>([]);
  const [detailPhotoSession, setDetailPhotoSession] = useState("");
  const [detailPhonePhotoCount, setDetailPhonePhotoCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function formatQuoteSummary(currentQuote: InstantQuoteModuleState["quote"]) {
    if (!currentQuote) return "";

    const currency = new Intl.NumberFormat("en-US", { currency: "USD", style: "currency" });
    return [
      `Quote ID: ${currentQuote.id}`,
      `Source: ${currentQuote.source}`,
      `Status: ${currentQuote.status}`,
      `Confidence: ${currentQuote.confidence}`,
      `Cash offer: ${currency.format(currentQuote.cashOfferCents / 100)}`,
      `Trade credit: ${currency.format(currentQuote.tradeCreditCents / 100)}`,
      `Range: ${currency.format(currentQuote.rangeLowCents / 100)} - ${currency.format(currentQuote.rangeHighCents / 100)}`
    ].join("\n");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");
    const nextErrors: Partial<FormState> = {};
    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!form.email.trim()) nextErrors.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = "Enter a valid email address.";
    if (!form.description.trim()) nextErrors.description = "Tell us what you are selling or trading.";
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    const currentFormData = new FormData(event.currentTarget);
    const payload = new FormData();
    payload.append("name", form.name);
    payload.append("email", form.email);
    payload.append("phone", form.phone);
    payload.append("preferredContactMethod", form.preferredContactMethod);
    payload.append("description", form.description);
    payload.append("franchise", form.franchise);
    payload.append("approximateQuantity", form.approximateQuantity);
    payload.append("conditionEstimate", form.conditionEstimate);
    payload.append("quoteSummary", formatQuoteSummary(quoteState.quote));
    payload.append("company", String(currentFormData.get("company") ?? ""));
    payload.append("photoSession", detailPhonePhotoCount > 0 ? detailPhotoSession : quoteState.photoSession || String(currentFormData.get("photoSession") ?? ""));
    quoteState.files.forEach((file) => payload.append("photos", file));
    detailFiles.forEach((file) => payload.append("photos", file));

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/sell-trade", {
        method: "POST",
        body: payload
      });

      const result = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error || "Submission failed. Please try again.");
      }

      setSubmitted(true);
      setForm(initialState);
      setDetailFiles([]);
      setDetailPhonePhotoCount(0);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-vault-success/30 bg-vault-success/10 p-6 shadow-vault" role="status">
        <h3 className="text-xl font-black text-vault-text">Thanks - your collection details were submitted.</h3>
        <p className="mt-2 text-sm text-vault-secondaryText">We&apos;ll review and reach out with next steps.</p>
      </div>
    );
  }

  return (
    <form className="grid content-start gap-4 rounded-2xl border border-vault-border bg-vault-card p-5 shadow-vault" onSubmit={handleSubmit} noValidate>
      <input aria-hidden="true" autoComplete="off" className="hidden" name="company" tabIndex={-1} type="text" />
      <div>
        <p className="text-sm font-semibold uppercase text-vault-gold">Step 2</p>
        <h2 className="mt-2 text-2xl font-black text-vault-text">Send your details</h2>
        {quoteState.quote ? (
          <p className="mt-2 text-sm leading-6 text-vault-secondaryText">Your quote will be included with this submission.</p>
        ) : (
          <p className="mt-2 text-sm leading-6 text-vault-secondaryText">You can submit details with or without a quote.</p>
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <FormInput error={errors.name} label="Name" maxLength={maxLengths.name} onChange={(event) => update("name", event.target.value)} value={form.name} />
        <FormInput
          error={errors.email}
          inputMode="email"
          label="Email"
          maxLength={maxLengths.email}
          onChange={(event) => update("email", event.target.value)}
          type="text"
          value={form.email}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <FormInput label="Phone optional" maxLength={maxLengths.phone} onChange={(event) => update("phone", event.target.value)} value={form.phone} />
        <FormSelect
          label="Preferred contact method"
          onChange={(event) => update("preferredContactMethod", event.target.value as FormState["preferredContactMethod"])}
          options={["Email", "Phone", "Instagram"]}
          value={form.preferredContactMethod}
        />
      </div>
      <FormTextarea
        error={errors.description}
        label="What are you selling/trading?"
        maxLength={maxLengths.description}
        onChange={(event) => update("description", event.target.value)}
        value={form.description}
      />
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] 2xl:grid-cols-3">
        <FormSelect
          label="Franchise/category"
          onChange={(event) => update("franchise", event.target.value)}
          options={["Mixed collection", "Pokemon", "One Piece", "Riftbound", "Magic: The Gathering", "Yu-Gi-Oh!", "Sports", "Other"]}
          value={form.franchise}
        />
        <FormInput
          label="Approximate quantity"
          maxLength={maxLengths.approximateQuantity}
          onChange={(event) => update("approximateQuantity", event.target.value)}
          placeholder="Example: 30 singles, 2 slabs"
          value={form.approximateQuantity}
        />
        <FormInput
          label="Condition estimate"
          maxLength={maxLengths.conditionEstimate}
          onChange={(event) => update("conditionEstimate", event.target.value)}
          placeholder="Near mint, mixed, sealed..."
          value={form.conditionEstimate}
        />
      </div>
      <FileUploadPlaceholder
        files={detailFiles}
        onFilesSelected={setDetailFiles}
        onPhonePhotoCountChange={setDetailPhonePhotoCount}
        onSessionChange={setDetailPhotoSession}
      />
      {submitError ? (
        <p className="rounded-xl border border-vault-error/30 bg-vault-error/10 px-4 py-3 text-sm text-vault-error" role="alert">
          {submitError}
        </p>
      ) : null}
      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? "Submitting..." : quoteState.quote ? "Submit This Quote" : "Submit Collection Details"}
      </Button>
    </form>
  );
}
