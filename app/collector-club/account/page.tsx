import type { Metadata } from "next";
import { getCurrentCollectorClubEntitlement } from "@/lib/collector-club/current";
import { hasCollectorClubFeature, isCollectorClubPro } from "@/lib/collector-club/entitlements";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Collector Club Account",
  description: "View your Rockin Rare Collector Club membership status and available perks.",
  alternates: {
    canonical: "/collector-club/account"
  },
  robots: {
    index: false,
    follow: false
  }
};

export const dynamic = "force-dynamic";

const proFeatures = [
  { label: "Early drop access", feature: "early_drop_access" as const },
  { label: "Priority Rare Radar matches", feature: "priority_wishlist" as const },
  { label: "Custom bundle requests", feature: "custom_bundle_request" as const },
  { label: "Priority collection estimates", feature: "priority_collection_estimate" as const },
  { label: "Store credit", feature: "store_credit" as const }
];

function tierLabel(tier: string) {
  return tier
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default async function CollectorClubAccountPage() {
  const entitlement = await getCurrentCollectorClubEntitlement();
  const isMember = entitlement.tier !== "none";
  const isSignedIn = Boolean(entitlement.email);
  const headline = isMember ? tierLabel(entitlement.tier) : "No active Collector Club profile";

  return (
    <Container className="py-14">
      <div className="max-w-3xl">
        <p className="mb-3 text-sm font-semibold uppercase text-vault-gold">Collector Club Account</p>
        <h1 className="text-4xl font-black text-vault-text sm:text-5xl">{headline}</h1>
        <p className="mt-4 text-base leading-7 text-vault-secondaryText">
          {isMember
            ? "Your member profile, Rare Radar wishlist, and future Collector Club perks all live under this signed-in account."
            : "Join the free Collector Club to save your member profile, manage Rare Radar, and unlock future club inventory gates."}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button href="/collector-club">{isMember ? "Update Collector Profile" : "Join Collector Club"}</Button>
          <Button href="/wishlist" variant="secondary">
            Manage Rare Radar
          </Button>
          <Button href="/inventory" variant="secondary">
            Browse Inventory
          </Button>
          {isSignedIn ? <SignOutButton /> : null}
        </div>
      </div>

      {isMember ? (
        <section className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-vault-border bg-vault-card p-6">
            <h2 className="text-xl font-black text-vault-text">Member Details</h2>
            <dl className="mt-5 grid gap-3 text-sm">
              <div className="flex justify-between gap-4 border-b border-vault-border/70 pb-3">
                <dt className="font-semibold text-vault-secondaryText">Email</dt>
                <dd className="text-right font-bold text-vault-text">{entitlement.email}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="font-semibold text-vault-secondaryText">Tier</dt>
                <dd className="text-right font-bold text-vault-highlight">{tierLabel(entitlement.tier)}</dd>
              </div>
            </dl>
          </div>
          <div className="rounded-2xl border border-vault-border bg-vault-card p-6">
            <h2 className="text-xl font-black text-vault-text">Available Pro Perks</h2>
            <div className="mt-5 grid gap-2">
              {proFeatures.map((item) => {
                const active = hasCollectorClubFeature(entitlement, item.feature);
                return (
                  <div className="flex items-center justify-between gap-4 rounded-xl border border-vault-border bg-vault-secondary px-4 py-3" key={item.feature}>
                    <span className="text-sm font-semibold text-vault-text">{item.label}</span>
                    <span className={active ? "text-xs font-black uppercase text-vault-success" : "text-xs font-black uppercase text-vault-muted"}>
                      {active ? "Active" : "Locked"}
                    </span>
                  </div>
                );
              })}
            </div>
            {!isCollectorClubPro(entitlement) ? (
              <p className="mt-4 text-sm leading-6 text-vault-secondaryText">
                Founding Pro access is enabled manually while the offer is tested. Mark Pro interest on the Collector Club form to join the early list.
              </p>
            ) : null}
          </div>
        </section>
      ) : null}
    </Container>
  );
}
