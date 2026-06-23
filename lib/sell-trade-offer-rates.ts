import type { SellTradeQuoteDetectedCard } from "@/lib/types";

export const sellTradeOfferTiers = [
  {
    label: "Under $1",
    maxCents: 99,
    cashRate: 0,
    tradeRate: 0,
    note: "Cards under $1 are handled as bulk or reviewed with the full submission."
  },
  {
    label: "$1-$4.99",
    maxCents: 499,
    cashRate: 0.45,
    tradeRate: 0.6,
    note: "$1-$4.99 cards use lower rates because sorting, fees, and listing time are a larger share of the card value."
  },
  {
    label: "$5-$24.99",
    maxCents: 2499,
    cashRate: 0.6,
    tradeRate: 0.75,
    note: "$5-$24.99 cards receive stronger rates when they are easier to verify and resell."
  },
  {
    label: "$25-$99.99",
    maxCents: 9999,
    cashRate: 0.68,
    tradeRate: 0.82,
    note: "$25-$99.99 cards receive stronger rates because they are more efficient to process individually."
  },
  {
    label: "$100+",
    maxCents: Number.POSITIVE_INFINITY,
    cashRate: 0.7,
    tradeRate: 0.85,
    note: "$100+ cards receive a preliminary premium estimate and may be manually reviewed before final offer."
  }
] as const;

export function getSellTradeOfferTier(marketValueCents: number) {
  const normalizedValue = Math.max(0, Math.round(marketValueCents));
  return sellTradeOfferTiers.find((tier) => normalizedValue <= tier.maxCents) ?? sellTradeOfferTiers[sellTradeOfferTiers.length - 1];
}

export function calculateTieredSellTradeOffers(marketValuesCents: number[]) {
  return marketValuesCents.reduce(
    (totals, marketValueCents) => {
      const normalizedValue = Math.max(0, Math.round(marketValueCents));
      const tier = getSellTradeOfferTier(normalizedValue);

      totals.marketValueCents += normalizedValue;
      totals.cashOfferCents += Math.round(normalizedValue * tier.cashRate);
      totals.tradeCreditCents += Math.round(normalizedValue * tier.tradeRate);

      if (normalizedValue > 0 && tier.note) totals.notes.add(tier.note);

      return totals;
    },
    {
      marketValueCents: 0,
      cashOfferCents: 0,
      tradeCreditCents: 0,
      notes: new Set<string>()
    }
  );
}

export function calculateTieredSellTradeQuoteValues(detectedCards: SellTradeQuoteDetectedCard[]) {
  return calculateTieredSellTradeOffers(detectedCards.map((card) => card.marketPriceCents ?? 0));
}
