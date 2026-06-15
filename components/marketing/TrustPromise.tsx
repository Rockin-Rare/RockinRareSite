import { cn } from "@/lib/utils";

const promises = [
  {
    title: "Actual product photos",
    text: "We use real listing photos whenever we can, especially for singles, slabs, and anything where condition matters."
  },
  {
    title: "Plain condition notes",
    text: "Wear, language, sealed status, grading company, and obvious issues should be clear before checkout."
  },
  {
    title: "Packed like cards matter",
    text: "Singles are protected with sleeves, top loaders or semi-rigids, team bags, and rigid mailers when the order calls for it."
  },
  {
    title: "No bait-and-switch listings",
    text: "No fake scarcity, no mystery condition, and no swapping a pictured card for a worse copy."
  }
];

export function TrustPromise({ compact = false }: { compact?: boolean }) {
  return (
    <section className={cn(!compact && "py-16")}>
      {!compact ? (
        <div className="mb-8 max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase text-vault-gold">The Rockin Rare Promise</p>
          <h2 className="text-3xl font-black text-vault-text sm:text-4xl">What We Check Before We List</h2>
        </div>
      ) : null}
      <div className={cn("divide-y divide-vault-border border-y border-vault-border", compact ? "" : "md:grid md:grid-cols-2 md:divide-y-0")}>
        {promises.map((item) => (
          <div key={item.title} className={cn("py-5", compact ? "" : "md:border-b md:border-vault-border md:p-6 md:first:pl-0 md:[&:nth-child(2)]:pr-0 md:[&:nth-child(3)]:pl-0 md:[&:nth-child(n+3)]:border-b-0")}>
            <h3 className="font-black text-vault-text">{item.title}</h3>
            <p className="mt-3 max-w-xl text-sm leading-6 text-vault-secondaryText">{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
