"use client";

import { FormEvent, useState } from "react";
import { FormInput } from "@/components/forms/FormInput";
import { FormSelect } from "@/components/forms/FormSelect";
import { FormTextarea } from "@/components/forms/FormTextarea";
import { Button } from "@/components/ui/Button";

type FormState = {
  name: string;
  email: string;
  collectingFocus: string;
  favoriteSets: string;
  wishlist: string;
  discordUsername: string;
  interestedInPro: boolean;
};

const initialState: FormState = {
  name: "",
  email: "",
  collectingFocus: "Pokemon",
  favoriteSets: "",
  wishlist: "",
  discordUsername: "",
  interestedInPro: false
};

const maxLengths = {
  name: 120,
  email: 254,
  collectingFocus: 80,
  favoriteSets: 300,
  wishlist: 1200,
  discordUsername: 80
};

export function CollectorClubForm() {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");

    const nextErrors: Partial<FormState> = {};
    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!form.email.trim()) nextErrors.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = "Enter a valid email address.";
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    const formData = new FormData(event.currentTarget);
    const payload = {
      ...form,
      company: String(formData.get("company") ?? "")
    };

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/collector-club", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error || "Signup failed. Please try again.");
      }

      setSubmitted(true);
      setForm(initialState);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Signup failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-vault-success/30 bg-vault-success/10 p-6 shadow-vault" role="status">
        <h3 className="text-xl font-black text-vault-text">You&apos;re on the Collector Club list.</h3>
        <p className="mt-2 text-sm leading-6 text-vault-secondaryText">
          Thanks. We&apos;ll use this list for future drop alerts, wishlist updates, and Discord launch invites.
        </p>
      </div>
    );
  }

  return (
    <form className="grid gap-4 rounded-2xl border border-vault-border bg-vault-card p-5 shadow-vault" onSubmit={handleSubmit} noValidate>
      <input aria-hidden="true" autoComplete="off" className="hidden" name="company" tabIndex={-1} type="text" />
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
        <FormSelect
          label="Main collecting focus"
          onChange={(event) => update("collectingFocus", event.target.value)}
          options={["Pokemon", "Japanese cards", "English singles", "Sealed product", "Slabs", "Mixed collection", "Other"]}
          value={form.collectingFocus}
        />
        <FormInput
          label="Discord username optional"
          maxLength={maxLengths.discordUsername}
          onChange={(event) => update("discordUsername", event.target.value)}
          placeholder="Example: rockinrare"
          value={form.discordUsername}
        />
      </div>
      <FormInput
        label="Favorite sets or characters optional"
        maxLength={maxLengths.favoriteSets}
        onChange={(event) => update("favoriteSets", event.target.value)}
        placeholder="Example: 151, Eeveelutions, vintage holos"
        value={form.favoriteSets}
      />
      <FormTextarea
        label="Wishlist or collecting notes optional"
        maxLength={maxLengths.wishlist}
        onChange={(event) => update("wishlist", event.target.value)}
        placeholder="Tell us what you want alerts for, what you collect, or what you are trying to finish."
        value={form.wishlist}
      />
      <label className="flex items-start gap-3 rounded-xl border border-vault-border bg-vault-secondary p-4">
        <input
          checked={form.interestedInPro}
          className="mt-1 h-4 w-4 accent-vault-gold"
          onChange={(event) => update("interestedInPro", event.target.checked)}
          type="checkbox"
        />
        <span>
          <span className="block text-sm font-semibold text-vault-text">I may be interested in Collector Club Pro later.</span>
          <span className="mt-1 block text-xs leading-5 text-vault-secondaryText">
            Pro is not live yet. This only helps us understand future interest in early access, wishlist matching, store credit, and custom bundles.
          </span>
        </span>
      </label>
      {submitError ? (
        <p className="rounded-xl border border-vault-error/30 bg-vault-error/10 px-4 py-3 text-sm text-vault-error" role="alert">
          {submitError}
        </p>
      ) : null}
      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? "Joining..." : "Join the Waitlist"}
      </Button>
    </form>
  );
}
