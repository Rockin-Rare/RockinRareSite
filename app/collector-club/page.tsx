import type { Metadata } from "next";
import { CollectorClubForm } from "@/components/forms/CollectorClubForm";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Join the Collector Club | Rockin Rare Collectibles",
  description:
    "Join the free Rockin Rare Collector Club waitlist for future drop alerts, wishlist matching, fair pack updates, and Discord launch invites."
};

const benefits = [
  {
    title: "Drop Alerts",
    text: "Get notified when new singles, sealed product, slabs, and themed drops are ready."
  },
  {
    title: "Wishlist Matching",
    text: "Tell us what you collect so future inventory can be matched to real buyer interest."
  },
  {
    title: "Fair Pack Updates",
    text: "Follow future batch details, chase-card updates, and community pull posts."
  },
  {
    title: "Discord Invites",
    text: "Be first in line when the Rockin Rare Discord opens for early buyers and collectors."
  }
];

const milestones = [
  "Marketplace sales and shipping stay consistent.",
  "The free Discord is ready with a small useful channel set.",
  "Website commerce and direct drop alerts are stable.",
  "Paid Pro perks are tested later with a small founding group."
];

export default function CollectorClubPage() {
  return (
    <Container>
      <section className="grid gap-10 py-14 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase text-vault-gold">Free Collector Club Waitlist</p>
          <h1 className="text-4xl font-black text-vault-text sm:text-5xl">Join the Rockin Rare Collector Club</h1>
          <p className="mt-5 text-lg leading-8 text-vault-secondaryText">
            The Collector Club is the future free community for drop alerts, wishlist matching, fair pack transparency,
            and collector-friendly card discussion.
          </p>
          <p className="mt-4 text-base leading-7 text-vault-secondaryText">
            We&apos;re building it carefully after marketplace sales and inventory workflows are steady. Join the waitlist now
            and help shape what collectors want from the community.
          </p>
          <div className="mt-8 rounded-2xl border border-vault-border bg-vault-card p-5">
            <h2 className="text-lg font-black text-vault-text">Collector Club Pro is not live yet.</h2>
            <p className="mt-3 text-sm leading-6 text-vault-secondaryText">
              Future paid perks may include early drop access, store credit, priority wishlist matching, and custom bundle
              support once fulfillment can support it.
            </p>
          </div>
        </div>
        <CollectorClubForm />
      </section>

      <section className="py-8">
        <div className="grid gap-4 md:grid-cols-4">
          {benefits.map((benefit) => (
            <article className="rounded-2xl border border-vault-border bg-vault-card p-5" key={benefit.title}>
              <h2 className="font-black text-vault-text">{benefit.title}</h2>
              <p className="mt-3 text-sm leading-6 text-vault-secondaryText">{benefit.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-8 py-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase text-vault-gold">Rollout Guardrails</p>
          <h2 className="mt-3 text-3xl font-black text-vault-text">Built after the selling flow works</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-vault-secondaryText">
            The free club should support the business, not distract from it. The waitlist gives Rockin Rare a clean way to
            collect interest before opening a larger Discord or paid membership.
          </p>
        </div>
        <ol className="grid gap-3 rounded-2xl border border-vault-border bg-vault-card p-5 text-sm leading-6 text-vault-secondaryText">
          {milestones.map((milestone, index) => (
            <li className="flex gap-3" key={milestone}>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-vault-gold/50 text-xs font-black text-vault-highlight">
                {index + 1}
              </span>
              <span>{milestone}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-2xl border border-vault-gold/30 bg-vault-elevated p-8 shadow-gold md:p-10">
        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase text-vault-gold">Have cards to sell?</p>
            <h2 className="mt-3 text-3xl font-black text-vault-text">Collector interest helps shape future drops.</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-vault-secondaryText">
              If you have singles, slabs, sealed product, or a collection, send the details for review.
            </p>
          </div>
          <Button href="/sell-trade" variant="secondary">
            Sell or Trade Cards
          </Button>
        </div>
      </section>
    </Container>
  );
}
