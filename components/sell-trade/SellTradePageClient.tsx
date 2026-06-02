"use client";

import { useState } from "react";
import { SellTradeForm } from "@/components/forms/SellTradeForm";
import { InstantQuoteModule, type InstantQuoteModuleState } from "@/components/sell-trade/InstantQuoteModule";

const initialQuoteState: InstantQuoteModuleState = {
  files: [],
  photoSession: "",
  quote: null,
  selectedPhotoCount: 0
};

export function SellTradePageClient() {
  const [quoteState, setQuoteState] = useState<InstantQuoteModuleState>(initialQuoteState);

  return (
    <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] xl:items-start">
      <InstantQuoteModule onChange={setQuoteState} />
      <SellTradeForm quoteState={quoteState} />
    </div>
  );
}
