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
      <div className="relative mx-auto min-h-[330px] w-full max-w-[520px] lg:mt-4" aria-label="Rockin Rare vault preview">
        <VaultPlaceholder className="absolute left-4 top-12 h-56 w-40 -rotate-6 opacity-80 sm:h-64 sm:w-48" label="Sealed" />
        <VaultPlaceholder className="absolute right-4 top-8 h-56 w-40 rotate-6 opacity-80 sm:h-64 sm:w-48" label="Slabs" />
        <VaultPlaceholder className="absolute left-1/2 top-0 h-[300px] w-52 -translate-x-1/2 gold-glow sm:h-[330px] sm:w-60" label="Singles" featured />
        <PreviewPanel />
      </div>
    );
  }

  return (
    <div className="relative mx-auto min-h-[330px] w-full max-w-[520px] lg:mt-4">
      {third ? (
        <ProductImageFrame
          alt={third.alt}
          src={third.src}
          fit="cover"
          padded={false}
          className="absolute left-4 top-12 h-56 w-40 -rotate-6 opacity-80 sm:h-64 sm:w-48"
        />
      ) : null}
      {second ? (
        <ProductImageFrame
          alt={second.alt}
          src={second.src}
          fit="cover"
          padded={false}
          className="absolute right-4 top-8 h-56 w-40 rotate-6 opacity-80 sm:h-64 sm:w-48"
        />
      ) : null}
      {first ? (
        <ProductImageFrame
          alt={first.alt}
          src={first.src}
          priority
          fit="cover"
          padded={false}
          className="absolute left-1/2 top-0 h-[300px] w-52 -translate-x-1/2 gold-glow sm:h-[330px] sm:w-60"
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
          <p className="mt-3 text-xs text-vault-secondaryText">Fresh inventory rotates in regularly</p>
        </div>
      </div>
    </div>
  );
}

function PreviewPanel() {
  return (
    <div className="absolute bottom-0 left-1/2 w-[78%] -translate-x-1/2 rounded-xl border border-vault-border bg-vault-secondary/90 p-3 shadow-vault backdrop-blur">
      <p className="text-xs font-semibold uppercase text-vault-gold">Current Inventory Preview</p>
      <p className="mt-1 text-sm text-vault-secondaryText">Real product photos, condition notes, and listing links.</p>
    </div>
  );
}
