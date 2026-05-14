"use client";

import { FormEvent, useState } from "react";
import { FileUploadPlaceholder } from "@/components/forms/FileUploadPlaceholder";
import { FormInput } from "@/components/forms/FormInput";
import { FormSelect } from "@/components/forms/FormSelect";
import { FormTextarea } from "@/components/forms/FormTextarea";
import { Button } from "@/components/ui/Button";
import type { SellTradeSubmission } from "@/lib/types";

type FormState = {
  name: string;
  email: string;
  phone: string;
  preferredContactMethod: "Email" | "Phone" | "Instagram";
  description: string;
  franchise: string;
  approximateQuantity: string;
  conditionEstimate: string;
  message: string;
};

const initialState: FormState = {
  name: "",
  email: "",
  phone: "",
  preferredContactMethod: "Email",
  description: "",
  franchise: "Pokemon",
  approximateQuantity: "",
  conditionEstimate: "",
  message: ""
};

export function SellTradeForm() {
  const [form, setForm] = useState(initialState);
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [submitted, setSubmitted] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: Partial<FormState> = {};
    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!form.email.trim()) nextErrors.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = "Enter a valid email address.";
    if (!form.description.trim()) nextErrors.description = "Tell us what you are selling or trading.";
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    const payload: SellTradeSubmission = {
      ...form,
      imageUrls: files.map((file) => file.name),
      createdAt: new Date().toISOString()
    };
    console.log("Sell/trade submission", payload);
    // TODO: Upload files to Supabase Storage, then create a sell_trade_submissions row.
    setSubmitted(true);
    setFiles([]);
    setForm(initialState);
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
    <form className="grid gap-4 rounded-2xl border border-vault-border bg-vault-card p-5 shadow-vault" onSubmit={handleSubmit} noValidate>
      <div className="grid gap-4 md:grid-cols-2">
        <FormInput error={errors.name} label="Name" onChange={(event) => update("name", event.target.value)} value={form.name} />
        <FormInput error={errors.email} inputMode="email" label="Email" onChange={(event) => update("email", event.target.value)} type="text" value={form.email} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <FormInput label="Phone optional" onChange={(event) => update("phone", event.target.value)} value={form.phone} />
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
        onChange={(event) => update("description", event.target.value)}
        value={form.description}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <FormSelect
          label="Franchise/category"
          onChange={(event) => update("franchise", event.target.value)}
          options={["Pokemon", "One Piece", "Yu-Gi-Oh!", "Sports", "Mixed collection", "Other"]}
          value={form.franchise}
        />
        <FormInput
          label="Approximate quantity"
          onChange={(event) => update("approximateQuantity", event.target.value)}
          placeholder="Example: 30 singles, 2 slabs"
          value={form.approximateQuantity}
        />
        <FormInput
          label="Condition estimate"
          onChange={(event) => update("conditionEstimate", event.target.value)}
          placeholder="Near mint, mixed, sealed..."
          value={form.conditionEstimate}
        />
      </div>
      <FileUploadPlaceholder files={files} onFilesSelected={setFiles} />
      <FormTextarea label="Message" onChange={(event) => update("message", event.target.value)} value={form.message} />
      <Button type="submit">Submit Collection Details</Button>
    </form>
  );
}
