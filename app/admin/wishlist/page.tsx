import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { hasAdminSession } from "@/lib/admin-session";
import {
  getCardIntakeRareRadarAdminUrl,
  getCardIntakeRareRadarMatches,
  hasCardIntakeRareRadarMatchesApi
} from "@/lib/rare-radar/card-intake-matches";
import { getWishlistMatches } from "@/lib/rare-radar/matching";
import { getAdminWishlistItems, rareRadarStorageConfigured, rareRadarWishlistTableReady } from "@/lib/rare-radar/wishlist";
import { getProducts } from "@/lib/products";
import { formatPrice } from "@/lib/utils";
import { updateWishlistStatusAction } from "./actions";

export const dynamic = "force-dynamic";

const statusOptions = ["waiting", "matched", "offered", "claimed", "passed", "expired"];

export default async function AdminWishlistPage() {
  if (!(await hasAdminSession())) {
    redirect("/admin");
  }

  const internalMatches = hasCardIntakeRareRadarMatchesApi() ? await getCardIntakeRareRadarMatches() : null;
  const storageConfigured = rareRadarStorageConfigured();
  const storageReady = storageConfigured ? await rareRadarWishlistTableReady() : false;
  const items = internalMatches?.results.map((result) => result.wishlist) ?? (storageReady ? await getAdminWishlistItems() : []);
  const products = internalMatches ? [] : storageReady ? await getProducts() : [];
  const internalMatchesByWishlistId = new Map((internalMatches?.results ?? []).map((result) => [result.wishlist.id, result.matches]));
  const openCount = items.filter((item) => item.status === "waiting" || item.status === "matched").length;
  const matchSource = internalMatches ? "private Card Intake inventory" : "public storefront inventory";

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-vault-highlight">Admin</p>
          <h1 className="mt-2 text-3xl font-black text-vault-text">Rare Radar Requests</h1>
          <p className="mt-3 text-sm text-vault-secondaryText">
            {items.length} total requests / {openCount} open or matched / matching against {matchSource}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button href="/admin/listings" variant="secondary">
            Listings
          </Button>
          <Button href="/wishlist" variant="secondary">
            View Customer Page
          </Button>
        </div>
      </div>

      {!storageConfigured ? (
        <div className="mt-8 rounded-xl border border-vault-border bg-vault-secondary px-4 py-3 text-sm text-vault-secondaryText">
          Set <code>DATABASE_URL</code> and apply the Rare Radar schema to manage wishlist entries directly from this admin page.
        </div>
      ) : null}

      {storageConfigured && !storageReady && !internalMatches ? (
        <div className="mt-8 rounded-xl border border-vault-border bg-vault-secondary px-4 py-3 text-sm text-vault-secondaryText">
          Apply the Rare Radar table in <code>docs/neon-collector-club-schema.sql</code> before managing wishlist entries.
        </div>
      ) : null}

      {!internalMatches && hasCardIntakeRareRadarMatchesApi() ? (
        <div className="mt-4 rounded-xl border border-vault-border bg-vault-secondary px-4 py-3 text-sm text-vault-secondaryText">
          Card Intake private matching is configured but unavailable, so this page is using public storefront fallback matching.
        </div>
      ) : null}

      <div className="mt-8 grid gap-5">
        {items.map((item) => {
          const matches = internalMatchesByWishlistId.get(item.id) ?? getWishlistMatches(item, products).map(mapFallbackMatch);
          return (
            <article className="rounded-2xl border border-vault-border bg-vault-card p-5" key={item.id}>
              <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                <div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-xl font-black text-vault-text">{item.productName}</h2>
                      <p className="mt-1 text-sm text-vault-secondaryText">
                        {item.game} / {item.category} / {item.language} / {item.desiredCondition}
                      </p>
                    </div>
                    <Badge>{item.status}</Badge>
                  </div>
                  <dl className="mt-4 grid gap-2 text-sm text-vault-secondaryText sm:grid-cols-2">
                    <Detail label="Customer" value={item.userName ? `${item.userName} (${item.userEmail})` : item.userEmail} />
                    <Detail label="Max price" value={typeof item.maxPriceCents === "number" ? formatPrice(item.maxPriceCents / 100) : "No max"} />
                    <Detail label="Set" value={item.setName || "Any"} />
                    <Detail label="Card number" value={item.cardNumber || "Any"} />
                    <Detail label="Alert threshold" value={item.alertThreshold} />
                    <Detail label="Updated" value={new Date(item.updatedAt).toLocaleDateString("en-US")} />
                  </dl>
                  {item.notes ? <p className="mt-4 rounded-xl border border-vault-border bg-vault-secondary p-4 text-sm leading-6 text-vault-secondaryText">{item.notes}</p> : null}
                  <form action={updateWishlistStatusAction} className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <input name="itemId" type="hidden" value={item.id} />
                    <select
                      className="min-h-11 rounded-xl border border-vault-border bg-vault-secondary px-4 py-3 text-sm text-vault-text outline-none transition focus:border-vault-gold focus:ring-2 focus:ring-vault-gold/20"
                      defaultValue={item.status}
                      name="status"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <Button type="submit">Update Status</Button>
                  </form>
                </div>
                <div className="rounded-xl border border-vault-border bg-vault-secondary p-4">
                  <h3 className="text-sm font-black uppercase text-vault-highlight">Possible inventory matches</h3>
                  {internalMatches ? (
                    <p className="mt-2 text-xs leading-5 text-vault-muted">
                      Private Card Intake candidates include review and hold inventory before public listing.
                    </p>
                  ) : null}
                  {matches.length > 0 ? (
                    <div className="mt-4 grid gap-3">
                      {matches.map((match) => (
                        <MatchLink key={match.inventory.id} match={match} />
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm leading-6 text-vault-secondaryText">No obvious current inventory match.</p>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {(storageReady || internalMatches) && items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-vault-border bg-vault-card p-8 text-sm text-vault-secondaryText">
          No Rare Radar wishlist entries yet.
        </div>
      ) : null}
    </main>
  );
}

type AdminWishlistMatch = {
  inventory: {
    id: string;
    name: string;
    sku?: string;
    status?: string;
    route?: string;
    suggestedPriceCents?: number;
    marketPriceCents?: number;
    adminPath?: string;
    storefrontPath?: string;
  };
  score: number;
  reasons: string[];
};

function MatchLink({ match }: { match: AdminWishlistMatch }) {
  const adminHref = match.inventory.adminPath ? getCardIntakeRareRadarAdminUrl(match.inventory.adminPath) : undefined;
  const href = adminHref ?? match.inventory.storefrontPath ?? "#";
  const priceCents = match.inventory.suggestedPriceCents ?? match.inventory.marketPriceCents;
  const priceLabel = typeof priceCents === "number" ? formatPrice(priceCents / 100) : "No price";
  const meta = [match.inventory.sku, match.inventory.status, match.inventory.route].filter(Boolean).join(" / ");

  const content = (
    <>
      <span className="block font-black text-vault-text">{match.inventory.name}</span>
      <span className="mt-1 block text-sm text-vault-secondaryText">
        {priceLabel} / score {match.score}
      </span>
      {meta ? <span className="mt-1 block text-xs uppercase text-vault-secondaryText">{meta}</span> : null}
      <span className="mt-1 block text-xs uppercase text-vault-muted">{match.reasons.join(", ")}</span>
    </>
  );

  if (adminHref) {
    return (
      <a className="rounded-xl border border-vault-border bg-vault-card p-4 transition hover:border-vault-gold" href={href} rel="noreferrer" target="_blank">
        {content}
      </a>
    );
  }

  return (
    <Link className="rounded-xl border border-vault-border bg-vault-card p-4 transition hover:border-vault-gold" href={href}>
      {content}
    </Link>
  );
}

function mapFallbackMatch(match: ReturnType<typeof getWishlistMatches>[number]): AdminWishlistMatch {
  const price = match.product.sitePrice ?? match.product.price;

  return {
    inventory: {
      id: match.product.id,
      name: match.product.name,
      sku: match.product.sku,
      status: match.product.publicStatus,
      route: match.product.primaryChannel,
      suggestedPriceCents: typeof price === "number" ? Math.round(price * 100) : undefined,
      storefrontPath: `/inventory/${match.product.slug}`
    },
    score: match.score,
    reasons: match.reasons
  };
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-semibold text-vault-muted">{label}</dt>
      <dd className="mt-1 font-semibold text-vault-text">{value}</dd>
    </div>
  );
}
