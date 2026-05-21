import type { Metadata } from "next";
import { CollectorClubForm } from "@/components/forms/CollectorClubForm";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Join the Collector Club",
  description:
    "Join the free Rockin Rare Collector Club for drop alerts, wishlist matching, fair pack updates, Discord invites, and Founding Pro interest.",
  alternates: {
    canonical: "/collector-club"
  }
};

const benefits = [
  {
    title: "Drop Alerts",
    text: "Get notified when new Pokemon, One Piece, Magic, singles, sealed product, slabs, and themed drops are ready."
  },
  {
    title: "Wishlist Matching",
    text: "Tell us what you collect so new inventory can be matched to real buyer interest as the catalog grows."
  },
  {
    title: "Fair Pack Updates",
    text: "Follow batch details, chase-card updates, and community pull posts."
  },
  {
    title: "Discord Invites",
    text: "Be first in line when the Rockin Rare Discord opens for early buyers and collectors."
  }
];

const proBenefits = [
  "24-hour early access to selected drops",
  "Priority wishlist matching when new inventory is scanned",
  "Pro-only deal previews",
  "One custom bundle request per month",
  "Priority collection estimate review"
];

export default function CollectorClubPage() {
  return (
    <Container>
      <section className="grid gap-8 py-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start lg:py-10">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase text-vault-gold">Free Collector Club</p>
          <h1 className="text-4xl font-black text-vault-text sm:text-5xl">Join the Rockin Rare Collector Club</h1>
          <p className="mt-5 text-lg leading-8 text-vault-secondaryText">
            The Collector Club is the free home for drop alerts, wishlist matching, fair pack transparency, Discord
            invites, and collector-friendly card discussion.
          </p>
          <p className="mt-4 text-base leading-7 text-vault-secondaryText">
            Join now and we&apos;ll email you when invites, new drops, and community updates are ready. If you want
            early-access perks later, mark your interest in Founding Pro.
          </p>
          <div className="mt-8 rounded-2xl border border-vault-border bg-vault-card p-5">
            <h2 className="text-lg font-black text-vault-text">Founding Collector Club Pro</h2>
            <p className="mt-3 text-sm leading-6 text-vault-secondaryText">
              Pro will start as a limited founding test before a public subscription. The first perks should stay practical:
              early access, priority wishlist matching, deal previews, bundle requests, and collection estimate priority.
            </p>
          </div>
        </div>
        <CollectorClubForm />
      </section>

      <section className="py-6">
        <div className="grid gap-4 md:grid-cols-4">
          {benefits.map((benefit) => (
            <article className="rounded-2xl border border-vault-border bg-vault-card p-5" key={benefit.title}>
              <h2 className="font-black text-vault-text">{benefit.title}</h2>
              <p className="mt-3 text-sm leading-6 text-vault-secondaryText">{benefit.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-5 py-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-sm font-semibold uppercase text-vault-gold">Founding Pro Test</p>
          <h2 className="mt-3 text-3xl font-black text-vault-text">Start small before opening paid memberships.</h2>
          <p className="mt-4 text-base leading-7 text-vault-secondaryText">
            Founding Pro spots will be used to test whether priority access and personalized collecting help are useful
            before store credit and automated subscriptions are added.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {proBenefits.map((benefit) => (
            <div className="rounded-2xl border border-vault-border bg-vault-card p-4" key={benefit}>
              <p className="text-sm font-bold leading-6 text-vault-text">{benefit}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-vault-gold/30 bg-vault-elevated p-8 shadow-gold md:p-10">
        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase text-vault-gold">Have cards to sell?</p>
            <h2 className="mt-3 text-3xl font-black text-vault-text">Collector interest helps shape upcoming drops.</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-vault-secondaryText">
              If you have Pokemon, One Piece, Magic, singles, slabs, sealed product, or a collection, send the details
              for review.
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
