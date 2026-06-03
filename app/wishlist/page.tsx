import type { Metadata } from "next";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { WishlistItemForm } from "@/components/wishlist/WishlistItemForm";
import { getCurrentAuthUser } from "@/lib/auth/current";
import { hasNeonAuth } from "@/lib/auth/server";
import { rareRadarStorageConfigured, getWishlistItemsForUser } from "@/lib/rare-radar/wishlist";
import { createWishlistItemAction, deleteWishlistItemAction, updateWishlistItemAction } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Rare Radar Wishlist",
  description: "Create and manage your Rockin Rare Rare Radar wishlist for cards, slabs, sealed product, and sets.",
  alternates: {
    canonical: "/wishlist"
  }
};

export default async function WishlistPage() {
  const user = await getCurrentAuthUser();
  const items = user ? await getWishlistItemsForUser(user.id) : [];

  return (
    <Container className="py-14">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase text-vault-gold">Rare Radar Wishlist</p>
          <h1 className="text-4xl font-black text-vault-text sm:text-5xl">Tell us what you&apos;re chasing.</h1>
          <p className="mt-5 text-base leading-7 text-vault-secondaryText">
            Add cards, sealed product, slabs, or sets you want. When Rockin Rare can offer a match at a strong price,
            we&apos;ll use this list to reach the right collectors before public listing.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
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
        </div>

        <div className="rounded-2xl border border-vault-border bg-vault-card p-5 shadow-vault">
          {!hasNeonAuth() ? (
            <SetupNotice title="Neon Auth is not configured" text="Set NEON_AUTH_BASE_URL and NEON_AUTH_COOKIE_SECRET before account sign-in can run." />
          ) : !rareRadarStorageConfigured() ? (
            <SetupNotice title="Database is not configured" text="Set DATABASE_URL and apply the Rare Radar schema before wishlists can be stored." />
          ) : user ? (
            <>
              <h2 className="text-2xl font-black text-vault-text">Add a wishlist item</h2>
              <p className="mt-2 text-sm leading-6 text-vault-secondaryText">
                Keep entries specific when you can. Set names, card numbers, and max prices make matching more reliable.
              </p>
              <div className="mt-5">
                <WishlistItemForm action={createWishlistItemAction} buttonLabel="Add to Rare Radar" />
              </div>
            </>
          ) : (
            <SetupNotice
              title="Create a free account"
              text="Your account keeps your Rare Radar list editable, private, and tied to your email for future offer alerts."
            />
          )}
        </div>
      </div>

      {user ? (
        <section className="mt-10">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase text-vault-gold">Your saved radar</p>
              <h2 className="mt-2 text-3xl font-black text-vault-text">Wishlist Items</h2>
            </div>
            <p className="text-sm text-vault-secondaryText">{items.length} saved</p>
          </div>
          {items.length > 0 ? (
            <div className="grid gap-5">
              {items.map((item) => (
                <article className="rounded-2xl border border-vault-border bg-vault-card p-5" key={item.id}>
                  <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-xl font-black text-vault-text">{item.productName}</h3>
                      <p className="mt-1 text-sm text-vault-secondaryText">
                        {item.game} / {item.category} / {item.language}
                      </p>
                    </div>
                    <span className="w-fit rounded-full border border-vault-border bg-vault-secondary px-3 py-1 text-xs font-black uppercase text-vault-highlight">
                      {item.status}
                    </span>
                  </div>
                  <WishlistItemForm action={updateWishlistItemAction} buttonLabel="Save Changes" item={item} />
                  <form action={deleteWishlistItemAction} className="mt-3">
                    <input name="itemId" type="hidden" value={item.id} />
                    <Button type="submit" variant="ghost">
                      Delete Item
                    </Button>
                  </form>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-vault-border bg-vault-card p-8 text-sm leading-6 text-vault-secondaryText">
              No wishlist items yet. Add your first chase above.
            </div>
          )}
        </section>
      ) : null}

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
