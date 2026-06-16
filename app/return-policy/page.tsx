import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { contactEmail, siteName } from "@/lib/site";

export const metadata: Metadata = {
  title: "Return Policy",
  description: "Return policy for Rockin Rare Collectibles orders, including return windows, item condition requirements, shipping costs, and refund timing.",
  alternates: {
    canonical: "/return-policy"
  }
};

const policySections = [
  {
    title: "Return Window",
    body: "Most eligible items may be returned within 14 days of delivery. Please contact us before sending anything back so we can confirm the order, item condition, and return instructions."
  },
  {
    title: "Eligible Condition",
    body: "Returned items must be in the same condition received. Single cards, graded slabs, and collectibles must be returned with all original sleeves, holders, cases, labels, and packaging included. Sealed products must remain factory sealed and unopened."
  },
  {
    title: "Non-Returnable Items",
    body: "Opened sealed products, altered items, damaged items caused after delivery, and items sold as final sale are not eligible for return unless the order arrived damaged or the wrong item was sent."
  },
  {
    title: "Return Shipping",
    body: "Customers are responsible for return shipping costs unless the item arrived damaged, materially not as described, or the wrong item was sent. We recommend using tracked shipping and protective packaging for all returns."
  },
  {
    title: "Exchanges",
    body: "Exchanges are not accepted. Many trading cards, slabs, sealed products, and collectibles are single-quantity or condition-specific, so approved returns are handled as refunds instead of exchanges."
  },
  {
    title: "Restocking Fees",
    body: "We do not charge restocking fees for approved returns."
  },
  {
    title: "Refunds",
    body: "After we receive and inspect the returned item, approved refunds are issued to the original payment method. Refund timing depends on the payment processor or marketplace, but most refunds appear within 5-10 business days after approval."
  },
  {
    title: "Damaged Or Incorrect Orders",
    body: "If an order arrives damaged or incorrect, contact us within 3 days of delivery with your order details and clear photos of the item, packaging, and shipping label. We will review the issue and help with the next step."
  },
  {
    title: "Marketplace Orders",
    body: "Orders placed through third-party marketplaces such as TCGplayer, eBay, Whatnot, or other platforms must follow that marketplace's return and refund process. This page applies to direct Rockin Rare Collectibles website orders unless a marketplace policy controls the transaction."
  }
];

export default function ReturnPolicyPage() {
  return (
    <Container className="py-14">
      <section className="max-w-3xl">
        <p className="mb-3 text-sm font-semibold uppercase text-vault-gold">Returns</p>
        <h1 className="text-4xl font-black text-vault-text sm:text-5xl">{siteName} Return Policy</h1>
        <p className="mt-5 text-lg leading-8 text-vault-secondaryText">
          We want buyers to know what to expect before checking out. Review the terms below for direct website orders,
          then contact us if you have a condition, shipping, or order-specific question.
        </p>
      </section>

      <section className="mt-10 grid gap-4">
        {policySections.map((section) => (
          <article className="rounded-lg border border-vault-border bg-vault-card p-5" key={section.title}>
            <h2 className="text-xl font-black text-vault-text">{section.title}</h2>
            <p className="mt-3 text-base leading-7 text-vault-secondaryText">{section.body}</p>
          </article>
        ))}
      </section>

      <section className="mt-10 rounded-lg border border-vault-border bg-vault-secondary p-5">
        <h2 className="text-xl font-black text-vault-text">Start A Return</h2>
        <p className="mt-3 text-base leading-7 text-vault-secondaryText">
          Email{" "}
          <a className="font-semibold text-vault-highlight hover:text-vault-gold" href={`mailto:${contactEmail}`}>
            {contactEmail}
          </a>{" "}
          with your order number, item name, reason for return, and photos when relevant. You can also use the{" "}
          <Link className="font-semibold text-vault-highlight hover:text-vault-gold" href="/contact">
            contact form
          </Link>
          .
        </p>
      </section>
    </Container>
  );
}
