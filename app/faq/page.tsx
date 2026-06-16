import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { Container } from "@/components/layout/Container";
import { Accordion } from "@/components/ui/Accordion";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers about buying, selling, trading, shipping, authenticity, condition, and listings.",
  alternates: {
    canonical: "/faq"
  }
};

const items = [
  {
    question: "Do you buy collections?",
    answer: "Yes. We review Pokemon, One Piece, Riftbound, Magic: The Gathering, singles, slabs, sealed product, bulk, and mixed collections. Use the Sell / Trade page to send details and photos."
  },
  {
    question: "Which trading card games do you sell?",
    answer: "We support Pokemon, One Piece, Riftbound, Magic: The Gathering, and other collector card categories as inventory is available."
  },
  {
    question: "Do you sell Japanese cards?",
    answer: "Yes. Japanese cards and sealed products are part of the Rockin Rare inventory when available."
  },
  {
    question: "Are your cards authentic?",
    answer: "Yes. We review inventory before listing and focus on clear photos, condition notes, and trustworthy product details."
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
    answer: "Most eligible direct website orders may be returned within 14 days of delivery. Marketplace orders follow the return process for that platform. See the Return Policy page for details."
  },
  {
    question: "Can I trade cards instead of selling?",
    answer: "Yes. Submit your trade details through the Sell / Trade form and include what you are looking for."
  },
  {
    question: "Where can I buy your listed items?",
    answer: "Use the listing links on each item when available, or contact us directly with questions about a card, slab, sealed product, or bundle."
  }
];

export default function FaqPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };

  return (
    <Container className="py-14">
      <JsonLd data={faqSchema} />
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
