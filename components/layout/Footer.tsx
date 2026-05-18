import Link from "next/link";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { Container } from "@/components/layout/Container";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-vault-border bg-vault-secondary/70">
      <Container className="grid gap-10 py-12 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <BrandLogo compact mark="gem" />
          <p className="mt-4 max-w-md text-sm leading-6 text-vault-secondaryText">
            Collector-first trading cards, sealed product, slabs, and rare finds with real photos, clear condition notes,
            and secure packaging. Southern California based.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-bold text-vault-text">Quick Links</h3>
          <div className="mt-4 grid gap-3 text-sm text-vault-secondaryText">
            <Link href="/inventory">Inventory</Link>
            <Link href="/collector-club">Collector Club</Link>
            <Link href="/sell-trade">Sell / Trade</Link>
            <Link href="/about">About</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-bold text-vault-text">Shop & Contact</h3>
          <div className="mt-4 grid gap-3 text-sm text-vault-secondaryText">
            <span>contact@rockinrarecollectibles.com</span>
            <span>Instagram: @rockinrarecollectibles</span>
            <span>eBay / TCGplayer / Whatnot listings coming online</span>
          </div>
        </div>
      </Container>
      <Container className="border-t border-vault-border py-5 text-sm text-vault-muted">
        Copyright {year} Rockin Rare Collectibles. All rights reserved.
      </Container>
    </footer>
  );
}
