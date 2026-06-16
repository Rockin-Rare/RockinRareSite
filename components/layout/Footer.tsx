import Link from "next/link";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { Container } from "@/components/layout/Container";
import { contactEmail, instagramHandle, tcgplayerRating, tcgplayerSales, tcgplayerStoreUrl } from "@/lib/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-vault-border bg-vault-secondary/70">
      <Container className="grid gap-10 py-12 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <BrandLogo compact mark="gem" />
          <p className="mt-4 max-w-md text-sm leading-6 text-vault-secondaryText">
            Southern California card shop buying, selling, and trading Pokemon, One Piece, Riftbound, Magic, slabs,
            sealed product, and collection finds.
          </p>
          <p className="mt-3 max-w-md text-sm leading-6 text-vault-muted">
            TCGplayer: {tcgplayerRating} across {tcgplayerSales}.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-bold text-vault-text">Quick Links</h3>
          <div className="mt-4 grid gap-3 text-sm text-vault-secondaryText">
            <Link href="/inventory">Inventory</Link>
            <Link href="/wishlist">Rare Radar</Link>
            <Link href="/collector-club">Collector Club</Link>
            <Link href="/sell-trade">Sell / Trade</Link>
            <Link href="/about">About</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/return-policy">Return Policy</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-bold text-vault-text">Shop & Contact</h3>
          <div className="mt-4 grid gap-3 text-sm text-vault-secondaryText">
            <span>{contactEmail}</span>
            <a
              className="transition hover:text-vault-highlight focus-visible:outline focus-visible:outline-2 focus-visible:outline-vault-highlight"
              href={`https://www.instagram.com/${instagramHandle}/`}
              rel="noreferrer"
              target="_blank"
            >
              Instagram: @{instagramHandle}
            </a>
            <a
              className="transition hover:text-vault-highlight focus-visible:outline focus-visible:outline-2 focus-visible:outline-vault-highlight"
              href={tcgplayerStoreUrl}
              rel="noreferrer"
              target="_blank"
            >
              Shop TCGplayer Store
            </a>
          </div>
        </div>
      </Container>
      <Container className="border-t border-vault-border py-5 text-sm text-vault-muted">
        Copyright {year} Rockin Rare Collectibles. All rights reserved.
      </Container>
    </footer>
  );
}
