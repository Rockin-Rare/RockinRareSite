"use client";

import { FormEvent, useState } from "react";
import { FormInput } from "@/components/forms/FormInput";
import { FormTextarea } from "@/components/forms/FormTextarea";
import { Button } from "@/components/ui/Button";

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const initialState: FormState = { name: "", email: "", subject: "", message: "" };
const maxLengths = {
  name: 120,
  email: 254,
  subject: 160,
  message: 3000
};

type ContactFormProps = {
  initialSubject?: string;
  initialMessage?: string;
};

export function ContactForm({ initialSubject = "", initialMessage = "" }: ContactFormProps) {
  const [form, setForm] = useState<FormState>({
    ...initialState,
    subject: initialSubject,
    message: initialMessage
  });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function update(key: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");
    const nextErrors: Partial<FormState> = {};
    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!form.email.trim()) nextErrors.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = "Enter a valid email address.";
    if (!form.message.trim()) nextErrors.message = "Message is required.";
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    const formData = new FormData(event.currentTarget);
    const payload = {
      ...form,
      company: String(formData.get("company") ?? "")
    };

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error || "Message failed. Please try again.");
      }

      setSubmitted(true);
      setForm(initialState);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Message failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
      <input aria-hidden="true" autoComplete="off" className="hidden" name="company" tabIndex={-1} type="text" />
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
      <FormInput label="Subject" maxLength={maxLengths.subject} onChange={(event) => update("subject", event.target.value)} value={form.subject} />
      <FormTextarea error={errors.message} label="Message" maxLength={maxLengths.message} onChange={(event) => update("message", event.target.value)} value={form.message} />
      {submitError ? (
        <p className="rounded-xl border border-vault-error/30 bg-vault-error/10 px-4 py-3 text-sm text-vault-error" role="alert">
          {submitError}
        </p>
      ) : null}
      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
}
