import Link from "next/link";

import type { Product } from "@/lib/types";
import { categoryLabel, formatPrice } from "@/lib/utils";

const heroCards = [
  {
    label: "Featured Card",
    title: "Vault Spotlight",
    meta: "Rotating trading card games, slabs, and favorites",
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
        <div className="grid gap-4 sm:grid-cols-[1.12fr_0.88fr] sm:items-start">
          <div className="grid gap-4 self-center">
            <VaultShowpiece card={fallbackFirst} featured />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-1">
            <VaultShowpiece card={fallbackSecond} compact />
            <VaultShowpiece card={fallbackThird} compact />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vault-panel relative mx-auto grid w-full max-w-[520px] gap-4 overflow-hidden rounded-2xl p-5 lg:mt-4">
      <div className="grid gap-4 sm:grid-cols-[1.12fr_0.88fr] sm:items-start">
        <div className="grid gap-4 self-center">
          <ProductShowpiece product={first} label="Top Value" featured />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-1">
          {second ? <ProductShowpiece product={second} label="Collector Pick" compact /> : <VaultShowpiece card={fallbackSecond} compact />}
          {third ? <ProductShowpiece product={third} label="Fresh Pick" compact /> : <VaultShowpiece card={fallbackThird} compact />}
        </div>
      </div>
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
  const displayPrice = formatPrice(product.price);
  const details = [categoryLabel(product.category), product.condition].filter(Boolean).join(" / ");

  return (
    <Link
      className={`group relative flex overflow-hidden rounded-2xl border ${
        featured ? "min-h-[360px] border-vault-gold/50 gold-glow" : "min-h-[252px] border-vault-border"
      } bg-vault-secondary transition duration-300 hover:-translate-y-0.5 hover:border-vault-gold/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-vault-highlight`}
      href={`/inventory/${product.slug}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_18%,rgba(214,168,79,0.22),transparent_34%),linear-gradient(145deg,#20242d,#101216)]" />
      <div className="absolute right-4 top-4 z-20 whitespace-nowrap rounded-full border border-vault-gold/30 bg-black/55 px-3 py-1 text-[10px] font-black uppercase text-vault-highlight">
        {label}
      </div>
      <div className={featured ? "relative flex h-full min-h-[360px] flex-1 flex-col p-4" : "relative flex min-h-[252px] flex-1 flex-col p-3"}>
        <div className={featured ? "flex h-[296px] items-center justify-center pb-1 pt-10" : "flex h-[150px] items-center justify-center overflow-hidden pb-1 pt-9"}>
          {imageUrl ? (
            <img
              alt={product.name}
              className={featured ? "relative z-10 h-full w-full object-contain drop-shadow-[0_18px_35px_rgba(0,0,0,0.55)] transition duration-500 group-hover:scale-[1.03]" : "relative z-10 h-full w-full scale-[1.08] object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,0.5)] transition duration-500 group-hover:scale-[1.12]"}
              loading={featured ? "eager" : "lazy"}
              src={imageUrl}
            />
          ) : (
            <div className="h-full w-full rounded-xl border border-vault-gold/30 bg-vault-bg shadow-[0_18px_50px_rgba(0,0,0,0.42)]" />
          )}
        </div>
        <div className={featured ? "relative z-10 px-2 pb-1 pt-2 text-center" : "relative z-10 mt-auto px-1 pb-1 pt-4 text-center"}>
          <p className="text-xs font-black uppercase text-white/85">{product.franchise}</p>
          <h3 className={compact ? "mt-1 line-clamp-2 text-base font-black leading-tight text-white" : "mt-1 line-clamp-2 text-2xl font-black leading-tight text-white"}>{product.name}</h3>
          <p className={compact ? "mt-1 text-xs leading-4 text-white/75" : "mt-1 text-sm leading-5 text-white/80"}>
            {details ? `${details} / ` : ""}
            <span className="font-black text-vault-highlight">{displayPrice}</span>
          </p>
        </div>
      </div>
    </Link>
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

