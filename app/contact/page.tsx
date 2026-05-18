import type { Metadata } from "next";
import { ContactForm } from "@/components/forms/ContactForm";
import { Container } from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "Contact Rockin Rare Collectibles",
  description: "Contact Rockin Rare Collectibles for inventory questions, collection submissions, and trading card inquiries."
};

export default function ContactPage() {
  return (
    <Container className="grid gap-10 py-14 lg:grid-cols-[0.8fr_1.2fr]">
      <div>
        <p className="mb-3 text-sm font-semibold uppercase text-vault-gold">Contact</p>
        <h1 className="text-4xl font-black text-vault-text sm:text-5xl">Contact Rockin Rare Collectibles</h1>
        <p className="mt-5 text-lg leading-8 text-vault-secondaryText">
          Send inventory questions, collection details, or listing inquiries. We typically respond within 1-2 business
          days.
        </p>
        <div className="mt-8 grid gap-3 rounded-2xl border border-vault-border bg-vault-card p-5 text-sm text-vault-secondaryText">
          <span>Email: contact@rockinrarecollectibles.com</span>
          <span>Instagram: @rockinrarecollectibles</span>
          <span>Marketplace listings available from individual inventory pages</span>
          <span>Southern California based</span>
        </div>
      </div>
      <ContactForm />
    </Container>
  );
}
