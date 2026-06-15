import Link from "next/link";

export function CategoryCard({ title, description, href }: { title: string; description: string; href: string }) {
  return (
    <Link
      className="rounded-lg border border-vault-border bg-vault-card p-5 transition hover:-translate-y-1 hover:border-vault-gold/70 hover:bg-vault-elevated focus-visible:outline focus-visible:outline-2 focus-visible:outline-vault-highlight sm:min-h-[190px]"
      href={href}
    >
      <div className="mb-5 h-1.5 w-16 rounded-full bg-vault-gold" />
      <h3 className="text-[17px] font-black leading-tight text-vault-text">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-vault-secondaryText">{description}</p>
    </Link>
  );
}
