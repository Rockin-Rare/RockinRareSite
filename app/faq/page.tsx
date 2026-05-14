import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Accordion } from "@/components/ui/Accordion";

export const metadata: Metadata = {
  title: "FAQ | Rockin Rare Collectibles",
  description: "Answers about buying, selling, trading, shipping, authenticity, condition, and listings."
};

const items = [
  {
    question: "Do you buy collections?",
    answer: "Yes. We review singles, slabs, sealed product, bulk, and mixed collections. Use the Sell / Trade page to send details and photos."
  },
  {
    question: "Do you sell Japanese cards?",
    answer: "Yes. Japanese Pokemon cards and sealed products are a core part of the Rockin Rare inventory."
  },
  {
    question: "Are your cards authentic?",
    answer: "We review inventory before listing and avoid publishing scanner-only records without manual review."
  },
  {
    question: "Do you ship?",
    answer: "Yes. Cards and sealed product are packed with collector-level care using appropriate protection for the item."
  },
  {
    question: "Do you offer local pickup?",
    answer: "Local options may be available in Southern California for select purchases or larger collection deals."
  },
  {
    question: "How do you describe condition?",
    answer: "We use common card condition language and add specific notes when there is whitening, wear, dents, case scuffing, or mixed condition."
  },
  {
    question: "Do you accept returns?",
    answer: "Return terms depend on the external platform where the item is listed. Contact us before buying if you have condition questions."
  },
  {
    question: "Can I trade cards instead of selling?",
    answer: "Yes. Submit your trade details through the Sell / Trade form and include what you are looking for."
  },
  {
    question: "Where can I buy your listed items?",
    answer: "V1 uses external listing links such as eBay, TCGplayer, Whatnot, Instagram, or direct contact. There is no checkout on this site yet."
  }
];

export default function FaqPage() {
  return (
    <Container className="py-14">
      <div className="mb-8 max-w-3xl">
        <p className="mb-3 text-sm font-semibold uppercase text-vault-gold">FAQ</p>
        <h1 className="text-4xl font-black text-vault-text sm:text-5xl">Common Buyer & Seller Questions</h1>
        <p className="mt-4 text-base leading-7 text-vault-secondaryText">
          Straight answers about buying, selling, trading, condition, shipping, and external listings.
        </p>
      </div>
      <Accordion items={items} />
    </Container>
  );
}
