import type { Product } from "@/lib/types";

const heroCards = [
  {
    label: "Showpiece Single",
    title: "Vintage Holo Spotlight",
    meta: "Chase cards, clean fronts, collector appeal",
    tone: "from-[#f2c76e] via-[#b8572f] to-[#16191f]"
  },
  {
    label: "Sealed Heat",
    title: "Japanese Drops",
    meta: "Sealed product and themed batches",
    tone: "from-[#5fd0ff] via-[#276b9f] to-[#111318]"
  },
  {
    label: "Graded Vault",
    title: "Slabs & Grails",
    meta: "Display pieces and graded favorites",
    tone: "from-[#f4f1ea] via-[#7d8594] to-[#101216]"
  }
];

export function HeroProductStack({ products }: { products: Product[] }) {
  void products;
  const [first, second, third] = heroCards;

  if (!first) {
    return (
      <div className="vault-panel relative mx-auto grid w-full max-w-[520px] gap-4 overflow-hidden rounded-2xl p-5 lg:mt-4" aria-label="Rockin Rare vault preview">
        <div className="grid gap-4 sm:grid-cols-[1.05fr_0.95fr]">
          <VaultShowpiece card={first} featured />
          <div className="grid gap-4">
            <VaultShowpiece card={second} compact />
            <VaultShowpiece card={third} compact />
          </div>
        </div>
        <PreviewPanel />
      </div>
    );
  }

  return (
    <div className="vault-panel relative mx-auto grid w-full max-w-[520px] gap-4 overflow-hidden rounded-2xl p-5 lg:mt-4">
      <div className="grid gap-4 sm:grid-cols-[1.05fr_0.95fr]">
        <VaultShowpiece card={first} featured />
        <div className="grid gap-4">
          <VaultShowpiece card={second} compact />
          <VaultShowpiece card={third} compact />
        </div>
      </div>
      <PreviewPanel />
    </div>
  );
}

type HeroCard = (typeof heroCards)[number];

function VaultShowpiece({ card, featured = false, compact = false }: { card: HeroCard; featured?: boolean; compact?: boolean }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${
        featured ? "min-h-[300px] border-vault-gold/50 gold-glow" : "min-h-[142px] border-vault-border"
      } bg-vault-secondary`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${card.tone} opacity-90`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.22),transparent_34%),linear-gradient(135deg,rgba(0,0,0,0.08),rgba(0,0,0,0.42))]" />
      <div className="absolute right-4 top-4 rounded-full border border-white/20 bg-black/30 px-3 py-1 text-[10px] font-black uppercase text-white/90">
        Vault Pick
      </div>
      <div
        className={`absolute rounded-2xl border border-white/25 bg-black/25 shadow-[0_18px_60px_rgba(0,0,0,0.35)] ${
          featured ? "left-1/2 top-12 h-48 w-32 -translate-x-1/2 rotate-3 sm:h-56 sm:w-36" : "right-5 top-7 h-24 w-16 rotate-6"
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
      <div className={featured ? "relative flex min-h-[300px] flex-col justify-end p-5" : "relative flex min-h-[142px] flex-col justify-end p-4 pr-24"}>
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
        <p className="mt-1 text-sm text-vault-secondaryText">Real product photos, condition notes, and listing links.</p>
      </div>
      <div className="rounded-lg border border-vault-gold/30 px-3 py-2 text-sm font-black text-vault-highlight">Live</div>
    </div>
  );
}
