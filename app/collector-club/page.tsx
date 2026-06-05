import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CollectorClubForm } from "@/components/forms/CollectorClubForm";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { getCurrentAuthUser } from "@/lib/auth/current";
import { hasNeonAuth } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Collector Club",
  description:
    "Manage your free Rockin Rare Collector Club profile for drop alerts, Rare Radar matches, fair pack updates, Discord invites, and Founding Pro interest.",
  alternates: {
    canonical: "/collector-club"
  }
};

export const dynamic = "force-dynamic";

const benefits = [
  {
    title: "Drop Alerts",
    text: "Get notified when new Pokemon, One Piece, Riftbound, Magic, singles, sealed product, slabs, and themed drops are ready."
  },
  {
    title: "Rare Radar Matches",
    text: "Manage your Rare Radar wishlist so we can match new inventory to specific chase cards."
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
  "Priority Rare Radar matches when new inventory is scanned",
  "Pro-only deal previews",
  "One custom bundle request per month",
  "Priority collection estimate review"
];

export default async function CollectorClubPage() {
  const authConfigured = hasNeonAuth();
  const user = await getCurrentAuthUser();
  const headline = user ? "Your Rockin Rare Collector Club" : "Create your Rockin Rare Collector Club account";

  return (
    <Container className="py-10">
      {user ? (
        <section className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(520px,1.2fr)] lg:items-start">
          <div className="lg:sticky lg:top-24">
            <p className="mb-3 text-sm font-semibold uppercase text-vault-gold">Free Collector Club</p>
            <h1 className="text-4xl font-black text-vault-text sm:text-5xl">{headline}</h1>
            <p className="mt-5 text-base leading-7 text-vault-secondaryText">
              Keep your member profile current so Rockin Rare can tailor drop alerts, Rare Radar matches, and future
              community invites around what you actually collect.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="/collector-club/account" variant="secondary">
                Account
              </Button>
              <Button href="/wishlist" variant="secondary">
                Rare Radar
              </Button>
              <SignOutButton />
            </div>
          </div>
          <CollectorClubForm initialEmail={user.email} initialName={user.name} />
        </section>
      ) : (
        <section className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div>
          <p className="mb-3 text-sm font-semibold uppercase text-vault-gold">Free Collector Club</p>
          <h1 className="text-4xl font-black text-vault-text sm:text-5xl">{headline}</h1>
          <p className="mt-5 text-lg leading-8 text-vault-secondaryText">
            Collector Club is the free member account for Rockin Rare collectors. Keep your profile current, manage
            Rare Radar matches, and get updates for drops, fair pack details, and community invites.
          </p>
          <p className="mt-4 text-base leading-7 text-vault-secondaryText">
            Rare Radar is the wishlist inside your Collector Club account. Use it for specific chase cards;
            use this profile for broader collecting notes, preferences, and Founding Pro interest.
          </p>
          <div className="mt-8 rounded-2xl border border-vault-border bg-vault-card p-5">
            <h2 className="text-lg font-black text-vault-text">Founding Collector Club Pro</h2>
            <p className="mt-3 text-sm leading-6 text-vault-secondaryText">
              Founding Pro interest helps us invite collectors who want early access, priority Rare Radar matches, deal
              previews, custom bundle requests, and faster collection estimate reviews.
            </p>
          </div>
        </div>
          {!authConfigured ? (
            <CollectorClubNotice
              title="Collector Club accounts are not configured"
              text="Set Neon Auth environment variables before Collector Club accounts can be created."
            />
          ) : (
            <CollectorClubNotice
              title="Create your Collector Club account"
              text="Collector Club membership uses the same sign-in as Rare Radar, so your profile and wishlist stay under one account."
            >
              <Button href="/auth/sign-up?redirectTo=/collector-club">Create Account</Button>
              <Button href="/auth/sign-in?redirectTo=/collector-club" variant="secondary">
                Sign In
              </Button>
            </CollectorClubNotice>
          )}
        </section>
      )}

      {user ? (
        <section className="py-7">
          <div className="grid gap-3 md:grid-cols-3">
            {benefits.slice(0, 3).map((benefit) => (
              <article className="rounded-xl border border-vault-border bg-vault-card px-4 py-3" key={benefit.title}>
                <h2 className="text-sm font-black text-vault-text">{benefit.title}</h2>
                <p className="mt-1 text-xs leading-5 text-vault-secondaryText">{benefit.text}</p>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className="py-8">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {benefits.map((benefit) => (
              <article className="rounded-xl border border-vault-border bg-vault-card p-4" key={benefit.title}>
                <h2 className="font-black text-vault-text">{benefit.title}</h2>
                <p className="mt-2 text-sm leading-6 text-vault-secondaryText">{benefit.text}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {!user ? (
        <section className="grid gap-5 py-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase text-vault-gold">Founding Pro Interest</p>
            <h2 className="mt-3 text-3xl font-black text-vault-text">Get first notice when early-access spots open.</h2>
            <p className="mt-4 text-base leading-7 text-vault-secondaryText">
              Tell us you&apos;re interested and we&apos;ll reach out when Founding Pro spots are available for collectors
              who want priority access and more personalized collecting help.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {proBenefits.map((benefit) => (
              <div className="rounded-xl border border-vault-border bg-vault-card p-4" key={benefit}>
                <p className="text-sm font-bold leading-6 text-vault-text">{benefit}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-xl border border-vault-gold/20 bg-vault-elevated p-4 shadow-vault md:p-5">
        <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase text-vault-gold">Have cards to sell?</p>
            <h2 className="mt-2 text-xl font-black text-vault-text">Sell or trade cards with Rockin Rare.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-vault-secondaryText">
              If you have Pokemon, One Piece, Riftbound, Magic, singles, slabs, sealed product, or a collection, send
              the details for review.
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

function CollectorClubNotice({ children, text, title }: { children?: ReactNode; text: string; title: string }) {
  return (
    <div className="rounded-2xl border border-vault-border bg-vault-card p-6 shadow-vault">
      <h2 className="text-2xl font-black text-vault-text">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-vault-secondaryText">{text}</p>
      {children ? <div className="mt-5 flex flex-wrap gap-3">{children}</div> : null}
    </div>
  );
}
