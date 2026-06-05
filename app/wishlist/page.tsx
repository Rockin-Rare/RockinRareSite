import type { Metadata } from "next";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { WishlistWorkspace } from "@/components/wishlist/WishlistWorkspace";
import { getCurrentAuthUser } from "@/lib/auth/current";
import { hasNeonAuth } from "@/lib/auth/server";
import { getWishlistItemsForUser, rareRadarStorageConfigured, rareRadarWishlistTableReady } from "@/lib/rare-radar/wishlist";
import { createWishlistItemAction, deleteWishlistItemAction, updateWishlistItemAction } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Rare Radar",
  description: "Create and manage your Rockin Rare chase list for cards, slabs, sealed product, and sets.",
  alternates: {
    canonical: "/wishlist"
  }
};

export default async function WishlistPage() {
  const user = await getCurrentAuthUser();
  const authConfigured = hasNeonAuth();
  const storageConfigured = rareRadarStorageConfigured();
  const storageReady = storageConfigured ? await rareRadarWishlistTableReady() : false;
  const items = user && storageReady ? await getWishlistItemsForUser(user.id) : [];

  return (
    <Container className="py-14">
      <section className="mx-auto max-w-3xl text-center">
        <p className="mb-3 text-sm font-semibold uppercase text-vault-gold">Rare Radar</p>
        <h1 className="text-4xl font-black text-vault-text sm:text-5xl">Tell us what you&apos;re chasing.</h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-vault-secondaryText">
          Add cards, sealed product, slabs, or sets you want. When Rockin Rare can offer a match at a strong price,
          we&apos;ll use this list to reach the right collectors before public listing.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {user ? (
            <>
              <Button href="/inventory" variant="secondary">
                Browse Inventory
              </Button>
              <SignOutButton />
            </>
          ) : (
            <>
              <Button href="/auth/sign-up?redirectTo=/wishlist">Create Account</Button>
              <Button href="/auth/sign-in?redirectTo=/wishlist" variant="secondary">
                Sign In
              </Button>
            </>
          )}
        </div>
        {user ? <p className="mt-4 text-sm text-vault-secondaryText">Signed in as {user.email}</p> : null}
      </section>

      <div className="mt-10">
        {!authConfigured || !storageConfigured || !storageReady || !user ? (
          <div className="mx-auto max-w-2xl rounded-2xl border border-vault-border bg-vault-card p-6 text-center shadow-vault">
            {!authConfigured ? (
              <SetupNotice title="Neon Auth is not configured" text="Set NEON_AUTH_BASE_URL and NEON_AUTH_COOKIE_SECRET before account sign-in can run." />
            ) : !storageConfigured ? (
              <SetupNotice title="Database is not configured" text="Set DATABASE_URL and apply the Rare Radar schema before wishlists can be stored." />
            ) : !storageReady ? (
              <SetupNotice
                title="Rare Radar setup is almost ready"
                text="Your account is working, but this deployment cannot see the wishlist table yet. Check that DATABASE_URL points to the Neon branch where the Rare Radar schema was applied."
              />
            ) : (
              <SetupNotice
                title="Create a free account"
                text="Your account keeps your Rare Radar list editable, private, and tied to your email for future offer alerts."
              />
            )}
          </div>
        ) : (
          <WishlistWorkspace createAction={createWishlistItemAction} deleteAction={deleteWishlistItemAction} items={items} updateAction={updateWishlistItemAction} />
        )}
      </div>

    </Container>
  );
}

function SetupNotice({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h2 className="text-2xl font-black text-vault-text">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-vault-secondaryText">{text}</p>
    </div>
  );
}
