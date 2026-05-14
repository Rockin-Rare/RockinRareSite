"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

const navLinks = [
  { href: "/inventory", label: "Inventory" },
  { href: "/sell-trade", label: "Sell / Trade" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" }
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-vault-border/80 bg-vault-bg/86 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[1200px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link className="flex items-center gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-vault-highlight" href="/">
          <span className="grid h-10 w-10 place-items-center rounded-xl border border-vault-gold/40 bg-vault-gold/10 text-vault-highlight">
            RR
          </span>
          <span className="text-base font-black text-vault-text sm:text-lg">Rockin Rare Collectibles</span>
        </Link>
        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary navigation">
          {navLinks.map((link) => (
            <Link
              className="text-sm font-medium text-vault-secondaryText transition hover:text-vault-highlight focus-visible:outline focus-visible:outline-2 focus-visible:outline-vault-highlight"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
          <Button href="/inventory" className="px-4 py-2.5">
            Shop Inventory
          </Button>
        </nav>
        <button
          aria-expanded={open}
          aria-label="Toggle menu"
          className="rounded-xl border border-vault-border px-3 py-2 text-sm font-semibold text-vault-text md:hidden"
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          Menu
        </button>
      </div>
      {open ? (
        <nav className="border-t border-vault-border bg-vault-secondary px-4 py-4 md:hidden" aria-label="Mobile navigation">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                className="rounded-xl px-3 py-3 text-sm font-semibold text-vault-secondaryText hover:bg-vault-elevated hover:text-vault-highlight"
                href={link.href}
                key={link.href}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Button href="/inventory" onClick={() => setOpen(false)}>
              Shop Inventory
            </Button>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
