import { ProductImageFrame } from "@/components/inventory/ProductImageFrame";
import type { Product } from "@/lib/types";

const heroCards = [
  {
    alt: "Holographic Charizard card in a protective case",
    src: "https://images.pexels.com/photos/9661257/pexels-photo-9661257.jpeg?auto=compress&cs=tinysrgb&w=640"
  },
  {
    alt: "Vintage collectible Pokemon cards in protective cases",
    src: "https://images.pexels.com/photos/9661252/pexels-photo-9661252.jpeg?auto=compress&cs=tinysrgb&w=640"
  },
  {
    alt: "Holographic Blastoise card in a protective case",
    src: "https://images.pexels.com/photos/9572050/pexels-photo-9572050.jpeg?auto=compress&cs=tinysrgb&w=640"
  }
];

export function HeroProductStack({ products }: { products: Product[] }) {
  void products;
  const [first, second, third] = heroCards;

  if (!first) {
    return (
      <div className="relative min-h-[430px]" aria-label="Rockin Rare vault preview">
        <VaultPlaceholder className="absolute right-0 top-16 h-72 w-52 rotate-6 opacity-80 sm:h-80 sm:w-60" label="Sealed" />
        <VaultPlaceholder className="absolute left-0 top-24 h-72 w-52 -rotate-6 opacity-90 sm:h-80 sm:w-60" label="Slabs" />
        <VaultPlaceholder className="absolute left-1/2 top-0 h-[390px] w-64 -translate-x-1/2 gold-glow sm:w-72" label="Singles" featured />
        <PreviewPanel />
      </div>
    );
  }

  return (
    <div className="relative min-h-[430px]">
      {third ? (
        <ProductImageFrame
          alt={third.alt}
          src={third.src}
          fit="cover"
          padded={false}
          className="absolute right-0 top-16 h-72 w-52 rotate-6 opacity-80 sm:h-80 sm:w-60"
        />
      ) : null}
      {second ? (
        <ProductImageFrame
          alt={second.alt}
          src={second.src}
          fit="cover"
          padded={false}
          className="absolute left-0 top-24 h-72 w-52 -rotate-6 opacity-90 sm:h-80 sm:w-60"
        />
      ) : null}
      {first ? (
        <ProductImageFrame
          alt={first.alt}
          src={first.src}
          priority
          fit="cover"
          padded={false}
          className="absolute left-1/2 top-0 h-[390px] w-64 -translate-x-1/2 gold-glow sm:w-72"
        />
      ) : null}
      <PreviewPanel />
    </div>
  );
}

function VaultPlaceholder({ className, label, featured = false }: { className: string; label: string; featured?: boolean }) {
  return (
    <div
      className={`product-image-frame overflow-hidden rounded-2xl border ${featured ? "border-vault-gold/50" : "border-vault-border"} ${className}`}
    >
      <div className="absolute inset-4 rounded-xl border border-vault-gold/20 bg-vault-secondary/80" />
      <div className="absolute inset-x-8 top-20 h-32 rounded-full bg-vault-gold/10 blur-2xl" />
      <div className="relative grid h-full place-items-center p-6 text-center">
        <div>
          <p className="text-xs font-semibold uppercase text-vault-gold">Rockin Rare</p>
          <p className="mt-3 text-3xl font-black text-vault-text">{label}</p>
          <p className="mt-3 text-xs text-vault-secondaryText">Public inventory activates after review</p>
        </div>
      </div>
    </div>
  );
}

function PreviewPanel() {
  return (
    <div className="absolute bottom-0 left-1/2 w-[88%] -translate-x-1/2 rounded-2xl border border-vault-border bg-vault-secondary/90 p-4 shadow-vault backdrop-blur">
      <p className="text-xs font-semibold uppercase text-vault-gold">Current Inventory Preview</p>
      <p className="mt-1 text-sm text-vault-secondaryText">Real intake photos, condition notes, and external listing links.</p>
    </div>
  );
}
