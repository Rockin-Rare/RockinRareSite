"use client";

import { useState } from "react";

export type AccordionItem = {
  question: string;
  answer: string;
};

export function Accordion({ items }: { items: AccordionItem[] }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="divide-y divide-vault-border overflow-hidden rounded-2xl border border-vault-border bg-vault-card">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.question}>
            <button
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-vault-text transition hover:bg-vault-elevated focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-vault-highlight"
              onClick={() => setOpenIndex(isOpen ? -1 : index)}
              type="button"
            >
              <span>{item.question}</span>
              <span className="text-xl text-vault-gold">{isOpen ? "-" : "+"}</span>
            </button>
            {isOpen ? <p className="px-5 pb-5 text-sm leading-6 text-vault-secondaryText">{item.answer}</p> : null}
          </div>
        );
      })}
    </div>
  );
}
