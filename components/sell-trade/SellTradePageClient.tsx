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
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr] xl:items-start">
      <InstantQuoteModule onChange={setQuoteState} />
      <SellTradeForm quoteState={quoteState} />
    </div>
  );
}
