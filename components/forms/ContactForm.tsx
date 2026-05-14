"use client";

import { FormEvent, useState } from "react";
import { FormInput } from "@/components/forms/FormInput";
import { FormTextarea } from "@/components/forms/FormTextarea";
import { Button } from "@/components/ui/Button";
import type { ContactSubmission } from "@/lib/types";

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const initialState: FormState = { name: "", email: "", subject: "", message: "" };

export function ContactForm() {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [submitted, setSubmitted] = useState(false);

  function update(key: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: Partial<FormState> = {};
    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!form.email.trim()) nextErrors.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = "Enter a valid email address.";
    if (!form.message.trim()) nextErrors.message = "Message is required.";
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    const payload: ContactSubmission = { ...form, createdAt: new Date().toISOString() };
    console.log("Contact submission", payload);
    // TODO: Submit to a contact API route or Supabase contact_submissions table.
    setSubmitted(true);
    setForm(initialState);
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-vault-success/30 bg-vault-success/10 p-6 shadow-vault" role="status">
        <h3 className="text-xl font-black text-vault-text">Message submitted</h3>
        <p className="mt-2 text-sm text-vault-secondaryText">Thanks. We&apos;ll review your message and reply within 1-2 business days.</p>
      </div>
    );
  }

  return (
    <form className="grid gap-4 rounded-2xl border border-vault-border bg-vault-card p-5 shadow-vault" onSubmit={handleSubmit} noValidate>
      <FormInput error={errors.name} label="Name" onChange={(event) => update("name", event.target.value)} value={form.name} />
      <FormInput error={errors.email} inputMode="email" label="Email" onChange={(event) => update("email", event.target.value)} type="text" value={form.email} />
      <FormInput label="Subject" onChange={(event) => update("subject", event.target.value)} value={form.subject} />
      <FormTextarea error={errors.message} label="Message" onChange={(event) => update("message", event.target.value)} value={form.message} />
      <Button type="submit">Send Message</Button>
    </form>
  );
}
