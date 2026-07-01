"use client";

import { useState } from "react";
import { SellTradeForm } from "@/components/forms/SellTradeForm";
import { InstantQuoteModule, type InstantQuoteModuleState } from "@/components/sell-trade/InstantQuoteModule";
import type { SellTradeQuote } from "@/lib/types";

const initialQuoteState: InstantQuoteModuleState = {
  files: [],
  photoSession: "",
  quote: null,
  selectedPhotoCount: 0
};

export function SellTradePageClient() {
  const [quoteState, setQuoteState] = useState<InstantQuoteModuleState>(initialQuoteState);
  const [quoteDescriptionFill, setQuoteDescriptionFill] = useState({ text: "", requestId: 0 });
  const [quotePreferenceFill, setQuotePreferenceFill] = useState<{
    value: "Cash payout" | "Trade credit" | "Decide after final review";
    requestId: number;
  }>({ value: "Decide after final review", requestId: 0 });

  function buildQuoteDescription(quote: SellTradeQuote) {
    const matchedCards = quote.detectedCards.map((card, index) => {
      const details = [card.franchise, card.setName, card.cardNumber ? `#${card.cardNumber}` : "", card.condition].filter(Boolean).join(" / ");
      const marketValue = typeof card.marketPriceCents === "number" && card.marketPriceCents > 0 ? ` - estimated market ${formatCurrency(card.marketPriceCents)}` : "";
      return `${index + 1}. ${card.name}${details ? ` (${details})` : ""}${marketValue}`;
    });

    const totalMarketValueCents = quote.detectedCards.reduce((total, card) => total + Math.max(0, card.marketPriceCents ?? 0), 0);

    if (quote.source === "manual-review") {
      return [
        "Manual review requested.",
        "Instant pricing was unavailable, so Rockin Rare will review these photos manually before confirming any offer.",
        "",
        "Uploaded scans:",
        ...(matchedCards.length > 0 ? matchedCards : ["No matched cards returned."])
      ]
        .filter(Boolean)
        .join("\n");
    }

    return [
      "Matched cards:",
      ...(matchedCards.length > 0 ? matchedCards : ["No matched cards returned."]),
      "",
      totalMarketValueCents > 0 ? `Estimated market value: ${formatCurrency(totalMarketValueCents)}` : "",
      `Cash offer: ${formatCurrency(quote.cashOfferCents)}`,
      `Trade credit: ${formatCurrency(quote.tradeCreditCents)}`
    ]
      .filter(Boolean)
      .join("\n");
  }

  return (
    <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] xl:items-start">
      <InstantQuoteModule
        onChange={setQuoteState}
        onContinueWithQuote={(quote, offerPreference = "Decide after final review") => {
          setQuoteDescriptionFill((current) => ({
            text: buildQuoteDescription(quote),
            requestId: current.requestId + 1
          }));
          setQuotePreferenceFill((current) => ({
            value: offerPreference,
            requestId: current.requestId + 1
          }));
        }}
      />
      <SellTradeForm quoteDescriptionFill={quoteDescriptionFill} quotePreferenceFill={quotePreferenceFill} quoteState={quoteState} />
    </div>
  );
}

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", { currency: "USD", style: "currency" }).format(cents / 100);
}
