"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { FormInput } from "@/components/forms/FormInput";
import { FormSelect } from "@/components/forms/FormSelect";
import { FormTextarea } from "@/components/forms/FormTextarea";
import { Button } from "@/components/ui/Button";
import type { CollectorClubProfile } from "@/lib/collector-club/types";

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
  collectingFocus: "Mixed collection",
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

type CollectorClubFormProps = {
  initialEmail: string;
  initialName: string;
  initialProfile?: CollectorClubProfile | null;
};

export function CollectorClubForm({ initialEmail, initialName, initialProfile }: CollectorClubFormProps) {
  const router = useRouter();
  const hasExistingProfile = Boolean(initialProfile);
  const initialForm = {
    ...initialState,
    email: initialEmail,
    name: initialProfile?.name ?? initialName,
    collectingFocus: initialProfile?.collectingFocus ?? initialState.collectingFocus,
    favoriteSets: initialProfile?.favoriteSets ?? "",
    wishlist: initialProfile?.wishlist ?? "",
    discordUsername: initialProfile?.discordUsername ?? "",
    interestedInPro: initialProfile?.interestedInPro ?? false
  };
  const [form, setForm] = useState(initialForm);
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
      const result = (await response.json().catch(() => ({}))) as { accountReady?: boolean; error?: string };

      if (!response.ok) {
        throw new Error(result.error || "Signup failed. Please try again.");
      }

      setSubmitted(true);
      setForm(initialForm);
      if (result.accountReady) {
        router.push("/collector-club/account");
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Signup failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-vault-success/30 bg-vault-success/10 p-6 shadow-vault" role="status">
        <h3 className="text-xl font-black text-vault-text">Profile saved.</h3>
        <p className="mt-2 text-sm leading-6 text-vault-secondaryText">
          We&apos;ll use these preferences for future drop alerts and Rare Radar matches.
        </p>
      </div>
    );
  }

  return (
    <form className="grid gap-5 rounded-2xl border border-vault-border bg-vault-card p-5 shadow-vault md:p-6" onSubmit={handleSubmit} noValidate>
      <input aria-hidden="true" autoComplete="off" className="hidden" name="company" tabIndex={-1} type="text" />
      <section className="grid gap-3">
        <div>
          <h2 className="text-xl font-black text-vault-text">{hasExistingProfile ? "Update Member Profile" : "Create Member Profile"}</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <FormInput error={errors.name} label="Name" maxLength={maxLengths.name} onChange={(event) => update("name", event.target.value)} value={form.name} />
          <FormInput error={errors.email} inputMode="email" label="Email" maxLength={maxLengths.email} readOnly type="text" value={form.email} />
        </div>
        <p className="-mt-1 text-xs leading-5 text-vault-muted">Email is tied to your signed-in Collector Club account.</p>
        <FormInput
          label="Discord username optional"
          maxLength={maxLengths.discordUsername}
          onChange={(event) => update("discordUsername", event.target.value)}
          placeholder="Example: rockinrare"
          value={form.discordUsername}
        />
      </section>

      <section className="grid gap-4 border-t border-vault-border pt-5">
        <div>
          <h2 className="text-xl font-black text-vault-text">Collecting Preferences</h2>
          <p className="mt-2 text-sm leading-6 text-vault-secondaryText">
            These preferences help us match future inventory, restocks, and collector-first drops to what you actually collect.
          </p>
        </div>
        <FormSelect
          label="Main collecting focus"
          onChange={(event) => update("collectingFocus", event.target.value)}
          options={["Mixed collection", "Pokémon", "Yu-Gi-Oh!", "One Piece", "Riftbound", "Magic", "Sports cards", "Sealed collector", "Singles collector"]}
          value={form.collectingFocus}
        />
        <FormInput
          label="Favorite sets or characters optional"
          maxLength={maxLengths.favoriteSets}
          onChange={(event) => update("favoriteSets", event.target.value)}
          placeholder="Example: 151, Eeveelutions, vintage holos"
          value={form.favoriteSets}
        />
        <FormTextarea
          label="Collecting notes optional"
          maxLength={maxLengths.wishlist}
          onChange={(event) => update("wishlist", event.target.value)}
          placeholder="Tell us what you collect, favorite eras, condition preferences, or sealed/slab interests. Use Rare Radar for specific chase cards."
          value={form.wishlist}
        />
      </section>

      <section className="grid gap-3 border-t border-vault-border pt-5">
        <div>
          <h2 className="text-xl font-black text-vault-text">Founding Pro Interest</h2>
        </div>
        <label className="flex items-start gap-3 rounded-xl border border-vault-border bg-vault-secondary px-4 py-3">
          <input
            checked={form.interestedInPro}
            className="mt-1 h-4 w-4 accent-vault-gold"
            onChange={(event) => update("interestedInPro", event.target.checked)}
            type="checkbox"
          />
          <span>
            <span className="block text-sm font-semibold text-vault-text">I may be interested in a Founding Pro spot.</span>
            <span className="mt-1 block text-xs leading-5 text-vault-secondaryText">
              We&apos;ll contact interested members first when early access, priority Rare Radar matches, deal previews,
              and custom bundle requests become available.
            </span>
          </span>
        </label>
      </section>

      <p className="text-xs leading-5 text-vault-muted">
        By saving your profile, you agree that Rockin Rare may email you about Collector Club updates, drop alerts, and Discord invites.
      </p>
      {submitError ? (
        <p className="rounded-xl border border-vault-error/30 bg-vault-error/10 px-4 py-3 text-sm text-vault-error" role="alert">
          {submitError}
        </p>
      ) : null}
      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? "Saving..." : hasExistingProfile ? "Update Collector Profile" : "Save Collector Profile"}
      </Button>
    </form>
  );
}
