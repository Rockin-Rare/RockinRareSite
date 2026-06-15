import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { getAuthUserIdFromWishlistShareToken } from "@/lib/rare-radar/share";
import { getWishlistItemsForUser, rareRadarStorageConfigured, rareRadarWishlistTableReady, type RareRadarWishlistItem } from "@/lib/rare-radar/wishlist";

type SharedWishlistPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shared Rare Radar Wishlist",
  description: "A read-only Rockin Rare Rare Radar wishlist shared by a collector.",
  robots: {
    index: false,
    follow: false
  }
};

export default async function SharedWishlistPage({ params }: SharedWishlistPageProps) {
  const { token } = await params;
  const authUserId = getAuthUserIdFromWishlistShareToken(token);
  if (!authUserId) return <SharedWishlistUnavailable />;

  const storageReady = rareRadarStorageConfigured() ? await rareRadarWishlistTableReady() : false;
  if (!storageReady) return <SharedWishlistUnavailable />;

  const items = await getWishlistItemsForUser(authUserId);
  const ownerName = items.find((item) => item.userName)?.userName;

  return (
    <Container className="py-14">
      <section className="max-w-3xl">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <p className="text-sm font-semibold uppercase text-vault-gold">Shared Rare Radar</p>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-vault-border bg-vault-secondary/70 px-2.5 py-1 text-xs font-bold uppercase text-vault-secondaryText">
            <span aria-hidden="true" className="material-symbols-outlined text-[16px]">
              lock
            </span>
            Read-only
          </span>
        </div>
        <h1 className="text-4xl font-black text-vault-text sm:text-5xl">
          {ownerName ? `${ownerName}'s wishlist` : "Collector wishlist"}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-vault-secondaryText">
          This is a read-only chase list. Use it to compare inventory, suggest a lead, or send a match back to the collector.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button href="/wishlist">Build Your Wishlist</Button>
          <Button href="/inventory" variant="secondary">
            Browse Inventory
          </Button>
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-5 flex flex-col gap-2 border-b border-vault-border pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-vault-gold">Read-only list</p>
            <h2 className="mt-2 text-2xl font-black text-vault-text">Current Chases</h2>
          </div>
          <p className="w-fit rounded-lg border border-vault-border bg-vault-card px-3 py-2 text-sm font-semibold text-vault-secondaryText">{items.length} saved</p>
        </div>

        {items.length > 0 ? (
          <ul className="grid gap-3">
            {items.map((item) => (
              <SharedWishlistItemCard item={item} key={item.id} />
            ))}
          </ul>
        ) : (
          <div className="rounded-xl border border-dashed border-vault-border bg-vault-card/70 p-5 text-sm leading-6 text-vault-secondaryText">
            This shared wishlist is empty right now.
          </div>
        )}
      </section>
    </Container>
  );
}

function SharedWishlistUnavailable() {
  return (
    <Container className="py-14">
      <section className="mx-auto max-w-2xl rounded-2xl border border-vault-border bg-vault-card p-6 text-center shadow-vault">
        <span className="mx-auto grid size-12 place-items-center rounded-xl border border-vault-border bg-vault-secondary text-vault-secondaryText">
          <span aria-hidden="true" className="material-symbols-outlined">
            link_off
          </span>
        </span>
        <p className="mt-4 text-sm font-semibold uppercase text-vault-gold">Shared Rare Radar</p>
        <h1 className="mt-3 text-3xl font-black text-vault-text">Wishlist link unavailable</h1>
        <p className="mt-4 text-sm leading-6 text-vault-secondaryText">
          This read-only wishlist link is invalid, expired by configuration, or temporarily unavailable.
        </p>
        <div className="mt-6 flex justify-center">
          <Button href="/wishlist">Build Your Wishlist</Button>
        </div>
      </section>
    </Container>
  );
}

function SharedWishlistItemCard({ item }: { item: RareRadarWishlistItem }) {
  const metadata = wishlistItemMeta(item);

  return (
    <li className="grid min-w-0 grid-cols-[80px_minmax(0,1fr)] gap-3 rounded-xl border border-vault-border bg-vault-card p-3 shadow-vault sm:grid-cols-[96px_minmax(0,1fr)] sm:gap-4">
      {item.imageUrl ? (
        <span className="relative aspect-[144/202] w-20 overflow-hidden rounded-lg border border-vault-border bg-vault-secondary p-1.5 sm:w-24">
          <img
            alt=""
            className="h-full w-full object-contain"
            decoding="async"
            height={202}
            loading="lazy"
            referrerPolicy="no-referrer"
            src={item.imageUrl}
            width={144}
          />
        </span>
      ) : (
        <span className="flex aspect-[144/202] w-20 items-center justify-center rounded-lg border border-dashed border-vault-border bg-vault-secondary/60 px-2 text-center sm:w-24">
          <span className="text-[10px] font-bold uppercase leading-3 text-vault-muted">Image pending</span>
        </span>
      )}
      <div className="min-w-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h3 className="break-words text-base font-black leading-snug text-vault-text sm:text-lg">{item.productName}</h3>
            {metadata ? <p className="mt-1 break-words text-sm font-medium leading-5 text-vault-secondaryText">{metadata}</p> : null}
          </div>
          {item.maxPriceCents ? (
            <p className="w-fit shrink-0 rounded-lg border border-vault-gold/25 bg-vault-gold/10 px-3 py-2 text-sm font-semibold text-vault-highlight">
              Up to ${(item.maxPriceCents / 100).toFixed(2)}
            </p>
          ) : null}
        </div>

        <dl className="mt-4 grid gap-2 text-sm text-vault-secondaryText sm:grid-cols-2 lg:grid-cols-4">
          <InfoRow label="Type" value={item.category} />
          <InfoRow label="Condition" value={item.desiredCondition} />
          <InfoRow label="Alert" value={item.alertThreshold} />
          <InfoRow label="Status" value={formatStatus(item.status)} />
        </dl>

        {item.notes ? (
          <p className="mt-4 rounded-lg border border-vault-border bg-vault-card/70 px-3 py-2 text-sm leading-6 text-vault-secondaryText">{item.notes}</p>
        ) : null}
      </div>
    </li>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold uppercase text-vault-muted">{label}</dt>
      <dd className="mt-1 break-words text-vault-secondaryText">{value}</dd>
    </div>
  );
}

function wishlistItemMeta(item: RareRadarWishlistItem) {
  return [item.game, item.setName, item.cardNumber ? `#${item.cardNumber}` : "", item.language].filter(Boolean).join(" / ");
}

function formatStatus(status: RareRadarWishlistItem["status"]) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}
