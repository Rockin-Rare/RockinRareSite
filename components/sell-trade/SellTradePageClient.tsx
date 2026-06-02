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

  function buildQuoteDescription(quote: SellTradeQuote) {
    const matchedCards = quote.detectedCards.map((card, index) => {
      const details = [card.franchise, card.setName, card.cardNumber ? `#${card.cardNumber}` : "", card.condition].filter(Boolean).join(" / ");
      return `${index + 1}. ${card.name}${details ? ` (${details})` : ""}`;
    });

    return ["Matched cards:", ...(matchedCards.length > 0 ? matchedCards : ["No matched cards returned."])].join("\n");
  }

  return (
    <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] xl:items-start">
      <InstantQuoteModule
        onChange={setQuoteState}
        onContinueWithQuote={(quote) => {
          setQuoteDescriptionFill((current) => ({
            text: buildQuoteDescription(quote),
            requestId: current.requestId + 1
          }));
        }}
      />
      <SellTradeForm quoteDescriptionFill={quoteDescriptionFill} quoteState={quoteState} />
    </div>
  );
}
