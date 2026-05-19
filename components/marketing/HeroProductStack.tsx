import type { Product } from "@/lib/types";
import { categoryLabel, formatPrice } from "@/lib/utils";

const heroCards = [
  {
    label: "Featured Card",
    title: "Vault Spotlight",
    meta: "Rotating Pokemon, One Piece, Magic, slabs, and favorites",
    tone: "from-[#f2c76e] via-[#b8572f] to-[#16191f]"
  },
  {
    label: "Fresh Pick",
    title: "New Arrival",
    meta: "Recently reviewed cards and display pieces",
    tone: "from-[#5fd0ff] via-[#276b9f] to-[#111318]"
  },
  {
    label: "Collector Ready",
    title: "Clean Listing",
    meta: "Clear photos and condition notes",
    tone: "from-[#f4f1ea] via-[#7d8594] to-[#101216]"
  }
];

export function HeroProductStack({ products }: { products: Product[] }) {
  const [first, second, third] = products;
  const [fallbackFirst, fallbackSecond, fallbackThird] = heroCards;

  if (!first) {
    return (
      <div className="vault-panel relative mx-auto grid w-full max-w-[520px] gap-4 overflow-hidden rounded-2xl p-5 lg:mt-4" aria-label="Rockin Rare vault preview">
        <div className="grid gap-4 sm:grid-cols-[1.05fr_0.95fr]">
          <VaultShowpiece card={fallbackFirst} featured />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-1">
            <VaultShowpiece card={fallbackSecond} compact />
            <VaultShowpiece card={fallbackThird} compact />
          </div>
        </div>
        <PreviewPanel />
      </div>
    );
  }

  return (
    <div className="vault-panel relative mx-auto grid w-full max-w-[520px] gap-4 overflow-hidden rounded-2xl p-5 lg:mt-4">
      <div className="grid gap-4 sm:grid-cols-[1.05fr_0.95fr]">
        <ProductShowpiece product={first} label="Top Value" featured />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-1">
          {second ? <ProductShowpiece product={second} label="Collector Pick" compact /> : <VaultShowpiece card={fallbackSecond} compact />}
          {third ? <ProductShowpiece product={third} label="Fresh Pick" compact /> : <VaultShowpiece card={fallbackThird} compact />}
        </div>
      </div>
      <PreviewPanel />
    </div>
  );
}

type HeroCard = (typeof heroCards)[number];

function ProductShowpiece({
  product,
  label,
  featured = false,
  compact = false
}: {
  product: Product;
  label: string;
  featured?: boolean;
  compact?: boolean;
}) {
  const imageUrl = product.primaryImageUrl || product.imageUrls[0] || "";
  const displayPrice = formatPrice(product.sitePrice ?? product.price);
  const meta = [categoryLabel(product.category), product.condition, displayPrice].filter(Boolean).join(" / ");

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${
        featured ? "min-h-[360px] border-vault-gold/50 gold-glow" : "min-h-[230px] border-vault-border"
      } bg-vault-secondary`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_18%,rgba(214,168,79,0.22),transparent_34%),linear-gradient(145deg,#20242d,#101216)]" />
      <div className="absolute right-4 top-4 rounded-full border border-vault-gold/30 bg-black/35 px-3 py-1 text-[10px] font-black uppercase text-vault-highlight">
        {label}
      </div>
      <div className={featured ? "relative flex h-full min-h-[360px] flex-col p-5" : "relative flex min-h-[230px] flex-col p-4 text-center"}>
        <div className={featured ? "mt-3 flex h-[250px] items-center justify-center sm:h-[275px]" : "mt-5 flex h-[135px] items-center justify-center"}>
          {imageUrl ? (
            <img
              alt={product.name}
              className="max-h-full max-w-full object-contain drop-shadow-[0_18px_35px_rgba(0,0,0,0.55)]"
              loading={featured ? "eager" : "lazy"}
              src={imageUrl}
            />
          ) : (
            <div className="h-full w-full rounded-xl border border-vault-gold/30 bg-vault-bg shadow-[0_18px_50px_rgba(0,0,0,0.42)]" />
          )}
        </div>
        <div className={featured ? "mt-auto pt-5" : "mt-auto pt-3"}>
          <p className="text-xs font-black uppercase text-white/85">{product.franchise}</p>
          <h3 className={compact ? "mt-1 line-clamp-2 text-base font-black text-white" : "mt-2 line-clamp-2 text-2xl font-black text-white"}>{product.name}</h3>
          {!compact ? <p className="mt-2 text-sm leading-5 text-white/80">{meta}</p> : null}
        </div>
      </div>
    </div>
  );
}

function VaultShowpiece({ card, featured = false, compact = false }: { card: HeroCard; featured?: boolean; compact?: boolean }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${
        featured ? "min-h-[300px] border-vault-gold/50 gold-glow" : "min-h-[190px] border-vault-border"
      } bg-vault-secondary`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${card.tone} opacity-90`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.22),transparent_34%),linear-gradient(135deg,rgba(0,0,0,0.08),rgba(0,0,0,0.42))]" />
      <div className="absolute right-4 top-4 rounded-full border border-white/20 bg-black/30 px-3 py-1 text-[10px] font-black uppercase text-white/90">
        Vault Pick
      </div>
      <div
        className={`absolute rounded-2xl border border-white/25 bg-black/25 shadow-[0_18px_60px_rgba(0,0,0,0.35)] ${
          featured ? "left-1/2 top-10 h-52 w-36 -translate-x-1/2 rotate-3 sm:h-60 sm:w-40" : "left-1/2 top-5 h-28 w-20 -translate-x-1/2 rotate-3"
        }`}
      >
        <div className="absolute inset-2 rounded-xl border border-white/20 bg-white/10" />
        <div className="absolute inset-x-4 top-5 h-10 rounded-lg bg-white/25" />
        <div className="absolute inset-x-4 bottom-5 grid gap-1">
          <span className="h-1 rounded bg-white/45" />
          <span className="h-1 rounded bg-white/30" />
          <span className="h-1 rounded bg-white/20" />
        </div>
      </div>
      <div className={featured ? "relative flex min-h-[300px] flex-col justify-end p-5" : "relative flex min-h-[190px] flex-col justify-end p-4 text-center"}>
        <p className="text-xs font-black uppercase text-white/85">{card.label}</p>
        <h3 className={compact ? "mt-1 text-lg font-black text-white" : "mt-2 text-3xl font-black text-white"}>{card.title}</h3>
        {!compact ? <p className="mt-2 text-sm leading-5 text-white/80">{card.meta}</p> : null}
      </div>
    </div>
  );
}

function PreviewPanel() {
  return (
    <div className="grid gap-3 rounded-xl border border-vault-border bg-vault-secondary/90 p-3 shadow-vault sm:grid-cols-[1fr_auto] sm:items-center">
      <div>
        <p className="text-xs font-semibold uppercase text-vault-gold">Current Inventory Preview</p>
        <p className="mt-1 text-sm text-vault-secondaryText">Pokemon, One Piece, Magic, photos, condition notes, and links.</p>
      </div>
      <div className="rounded-lg border border-vault-gold/30 px-3 py-2 text-sm font-black text-vault-highlight">Live</div>
    </div>
  );
}
