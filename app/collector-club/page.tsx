import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { CollectorClubForm } from "@/components/forms/CollectorClubForm";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { getCurrentAuthUser } from "@/lib/auth/current";
import { hasNeonAuth } from "@/lib/auth/server";
import { getCollectorClubProfileByEmail } from "@/lib/collector-club/members";

export const metadata: Metadata = {
  title: "Collector Club",
  description:
    "Manage your free Rockin Rare Collector Club profile for drop alerts, Rare Radar matches, fair pack updates, Discord invites, and Founding Pro interest.",
  alternates: {
    canonical: "/collector-club"
  }
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<{ edit?: string }>;
};

const benefits = [
  {
    title: "Drop alerts",
    text: "Get notified when new Pokémon, One Piece, Riftbound, Yu-Gi-Oh!, Magic, singles, sealed product, slabs, and themed drops are ready."
  },
  {
    title: "Rare Radar matches",
    text: "Keep your wishlist under the same account so incoming inventory can be matched to specific chases."
  },
  {
    title: "Fair-access drops",
    text: "Follow future release updates, batch details, chase-card updates, and community pull posts."
  },
  {
    title: "Discord invites",
    text: "Be first in line when the Rockin Rare Discord opens for early buyers and collectors."
  },
  {
    title: "Future member perks",
    text: "Tell us if you want first notice when paid Pro perks, member pricing, or priority access options become available."
  }
];

const memberBenefits = [
  {
    title: "Drop alerts",
    text: "Get notified when new inventory and themed drops are ready."
  },
  {
    title: "Rare Radar matches",
    text: "Use your wishlist and preferences to help surface relevant matches."
  },
  {
    title: "Discord invites",
    text: "Be first in line when the Rockin Rare Discord opens."
  },
  {
    title: "Future member perks",
    text: "Get first notice when member pricing, priority access, or Pro options become available."
  }
];

export default async function CollectorClubPage({ searchParams }: PageProps) {
  const authConfigured = hasNeonAuth();
  const user = await getCurrentAuthUser();
  const profile = user ? await getCollectorClubProfileByEmail(user.email) : null;
  const editMode = (await searchParams)?.edit === "1";
  const headline = user ? "Your Rockin Rare Collector Club" : "Join the Rockin Rare Collector Club";

  if (user && profile && !editMode) {
    redirect("/collector-club/account");
  }

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
          <CollectorClubForm initialEmail={user.email} initialName={profile?.name ?? user.name} initialProfile={profile} />
        </section>
      ) : (
        <section className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase text-vault-gold">FREE COLLECTOR CLUB</p>
            <h1 className="text-4xl font-black text-vault-text sm:text-5xl">{headline}</h1>
            <p className="mt-5 text-lg leading-8 text-vault-secondaryText">
              Collector Club is the free Rockin Rare account for drop alerts, Rare Radar matches, collecting preferences,
              and future member perks. Create one account for your profile, wishlist, and future release updates.
            </p>
            <div className="mt-7 divide-y divide-vault-border border-y border-vault-border">
              {benefits.map((benefit) => (
                <div className="grid gap-1 py-4 sm:grid-cols-[170px_1fr] sm:gap-5" key={benefit.title}>
                  <h2 className="text-sm font-black text-vault-text">{benefit.title}</h2>
                  <p className="text-sm leading-6 text-vault-secondaryText">{benefit.text}</p>
                </div>
              ))}
            </div>
          </div>
          {!authConfigured ? (
            <CollectorClubNotice
              title="Collector Club accounts are not configured"
              text="Set Neon Auth environment variables before Collector Club accounts can be created."
            />
          ) : (
            <CollectorClubNotice
              title="Create your free Collector Club account"
              text="Collector Club uses the same sign-in as Rare Radar, so your profile, wishlist, and collecting preferences stay under one account."
            >
              <Button href="/auth/sign-up?redirectTo=/collector-club">Create Free Account</Button>
              <Button href="/auth/sign-in?redirectTo=/collector-club" variant="secondary">
                Sign In
              </Button>
            </CollectorClubNotice>
          )}
        </section>
      )}

      {user ? (
        <section className="py-7">
          <div className="grid gap-3 md:grid-cols-4">
            {memberBenefits.map((benefit) => (
              <article className="rounded-xl border border-vault-border bg-vault-card px-4 py-3" key={benefit.title}>
                <h2 className="text-sm font-black text-vault-text">{benefit.title}</h2>
                <p className="mt-1 text-xs leading-5 text-vault-secondaryText">{benefit.text}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {!user ? (
        <section className="my-7 rounded-xl border border-vault-border bg-vault-card p-6 shadow-vault md:p-8">
          <p className="text-sm font-semibold uppercase text-vault-gold">Collector Community</p>
          <h2 className="mt-3 text-3xl font-black text-vault-text">Useful alerts, not random blasts</h2>
          <p className="mt-4 max-w-5xl text-base leading-7 text-vault-secondaryText">
            Collector Club is free while Rockin Rare grows. We&apos;re using it to send better restock alerts, match
            collectors with cards they actually want, and build future fair-access drops for collectors and players.
            As we grow, we&apos;ll keep member perks realistic: no guaranteed allocations or paid benefits
            until we can reliably support them.
          </p>
        </section>
      ) : null}

      {!user && authConfigured ? (
        <section className="mb-7 rounded-xl border border-vault-border bg-vault-card p-5 shadow-vault md:p-6">
          <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="text-2xl font-black text-vault-text">Ready to join?</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-vault-secondaryText">
                Create a free account to get drop alerts, Rare Radar matches, and future member updates.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button href="/auth/sign-up?redirectTo=/collector-club">Create Free Account</Button>
              <Button href="/auth/sign-in?redirectTo=/collector-club" variant="secondary">
                Sign In
              </Button>
            </div>
          </div>
        </section>
      ) : null}

      <section className="rounded-xl border border-vault-gold/20 bg-vault-elevated p-4 shadow-vault md:p-5">
        <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase text-vault-gold">Have cards to sell?</p>
            <h2 className="mt-2 text-xl font-black text-vault-text">Sell or trade cards with Rockin Rare.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-vault-secondaryText">
              Have Pokémon, One Piece, Riftbound, Yu-Gi-Oh!, Magic, sports cards, singles, slabs, sealed product, or a
              full collection? Send us the details and we&apos;ll review it.
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
