import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

const promises = [
  {
    title: "Real product photos",
    text: "What you see is what you're buying whenever possible."
  },
  {
    title: "Clear condition notes",
    text: "We aim to describe condition honestly and avoid vague listings."
  },
  {
    title: "Secure packaging",
    text: "Cards and sealed product are packed with collector-level care."
  },
  {
    title: "Fair collector-first pricing",
    text: "No fake scarcity, no misleading hype, no bait-and-switch listings."
  }
];

export function TrustPromise({ compact = false }: { compact?: boolean }) {
  return (
    <section className={cn(!compact && "py-16")}>
      {!compact ? (
        <div className="mb-8 max-w-2xl">
          <p className="mb-3 text-sm font-semibold uppercase text-vault-gold">The Rockin Rare Promise</p>
          <h2 className="text-3xl font-black text-vault-text sm:text-4xl">Built Around Collector Trust</h2>
        </div>
      ) : null}
      <div className={cn("grid gap-4", compact ? "sm:grid-cols-2" : "md:grid-cols-4")}>
        {promises.map((item) => (
          <Card key={item.title} className={compact ? "p-4" : ""}>
            <h3 className="font-black text-vault-text">{item.title}</h3>
            <p className="mt-3 text-sm leading-6 text-vault-secondaryText">{item.text}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
