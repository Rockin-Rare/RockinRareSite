"use client";

import { useEffect, useRef, useState } from "react";
import type { InputHTMLAttributes } from "react";
import {
  wishlistAlertThresholdOptions,
  wishlistCategoryOptions,
  wishlistConditionOptions,
  wishlistGameOptions,
  wishlistLanguageOptions
} from "@/lib/rare-radar/options";
import type { RareRadarWishlistItem } from "@/lib/rare-radar/wishlist";
import type { SellTradeQuoteCatalogCandidate } from "@/lib/types";
import { Button } from "@/components/ui/Button";

type WishlistItemFormProps = {
  action: (formData: FormData) => Promise<void>;
  buttonLabel: string;
  item?: RareRadarWishlistItem;
};

export function WishlistItemForm({ action, buttonLabel, item }: WishlistItemFormProps) {
  const [productName, setProductName] = useState(item?.productName ?? "");
  const [game, setGame] = useState(item?.game ?? wishlistGameOptions[0]);
  const [category, setCategory] = useState(item?.category ?? wishlistCategoryOptions[0]);
  const [setName, setSetName] = useState(item?.setName ?? "");
  const [cardNumber, setCardNumber] = useState(item?.cardNumber ?? "");
  const [language, setLanguage] = useState(item?.language ?? wishlistLanguageOptions[0]);
  const [desiredCondition, setDesiredCondition] = useState(item?.desiredCondition ?? wishlistConditionOptions[0]);
  const [maxPrice, setMaxPrice] = useState(formatCentsForInput(item?.maxPriceCents));
  const [alertThreshold, setAlertThreshold] = useState(item?.alertThreshold ?? wishlistAlertThresholdOptions[0]);
  const [notes, setNotes] = useState(item?.notes ?? "");
  const [catalogResults, setCatalogResults] = useState<SellTradeQuoteCatalogCandidate[]>([]);
  const [catalogError, setCatalogError] = useState("");
  const [isSearchingCatalog, setIsSearchingCatalog] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const skipNextSearchRef = useRef(false);

  useEffect(() => {
    if (skipNextSearchRef.current) {
      skipNextSearchRef.current = false;
      return;
    }

    const query = productName.trim();
    if (!catalogOpen || query.length < 2) {
      setCatalogResults([]);
      setCatalogError("");
      setIsSearchingCatalog(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setIsSearchingCatalog(true);
      setCatalogError("");

      try {
        const response = await fetch(`/api/sell-trade/catalog?q=${encodeURIComponent(query)}&productType=TCG`, {
          signal: controller.signal
        });
        const result = (await response.json().catch(() => ({}))) as { cards?: SellTradeQuoteCatalogCandidate[]; error?: string };

        if (!response.ok) throw new Error(result.error || "Unable to search catalog.");
        setCatalogResults(result.cards ?? []);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setCatalogError(error instanceof Error ? error.message : "Unable to search catalog.");
      } finally {
        if (!controller.signal.aborted) setIsSearchingCatalog(false);
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [catalogOpen, productName]);

  function applyCatalogCandidate(candidate: SellTradeQuoteCatalogCandidate) {
    skipNextSearchRef.current = true;
    setProductName(candidate.name);
    setGame(normalizeGame(candidate.franchise));
    setCategory("Single");
    setSetName(candidate.setName ?? "");
    setCardNumber(candidate.cardNumber ?? "");
    setCatalogResults([]);
    setCatalogError("");
    setCatalogOpen(false);
  }

  return (
    <form action={action} className="grid gap-4">
      {item ? <input name="itemId" type="hidden" value={item.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <CatalogNameField
          catalogError={catalogError}
          catalogOpen={catalogOpen}
          isSearchingCatalog={isSearchingCatalog}
          name="productName"
          onBlur={() => window.setTimeout(() => setCatalogOpen(false), 150)}
          onCandidateSelect={applyCatalogCandidate}
          onChange={setProductName}
          onFocus={() => setCatalogOpen(true)}
          results={catalogResults}
          value={productName}
        />
        <SelectField label="Game" name="game" onChange={setGame} options={wishlistGameOptions} value={game} />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <SelectField label="Type" name="category" onChange={setCategory} options={wishlistCategoryOptions} value={category} />
        <Field label="Set or version" name="setName" onChange={setSetName} value={setName} />
        <Field label="Card number" name="cardNumber" onChange={setCardNumber} value={cardNumber} />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <SelectField label="Language" name="language" onChange={setLanguage} options={wishlistLanguageOptions} value={language} />
        <SelectField label="Condition" name="desiredCondition" onChange={setDesiredCondition} options={wishlistConditionOptions} value={desiredCondition} />
        <Field inputMode="decimal" label="Max price optional" name="maxPrice" onChange={setMaxPrice} placeholder="Example: 75" value={maxPrice} />
      </div>
      <SelectField label="Alert threshold" name="alertThreshold" onChange={setAlertThreshold} options={wishlistAlertThresholdOptions} value={alertThreshold} />
      <label className="grid gap-2">
        <span className="text-sm font-semibold text-vault-text">Notes optional</span>
        <textarea
          className="min-h-28 rounded-xl border border-vault-border bg-vault-secondary px-4 py-3 text-sm text-vault-text outline-none transition placeholder:text-vault-muted focus:border-vault-gold focus:ring-2 focus:ring-vault-gold/20"
          maxLength={800}
          name="notes"
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Specific art, grading company, centering preference, or deal notes."
          value={notes}
        />
      </label>
      <Button type="submit">{buttonLabel}</Button>
    </form>
  );
}

function CatalogNameField({
  catalogError,
  catalogOpen,
  isSearchingCatalog,
  name,
  onBlur,
  onCandidateSelect,
  onChange,
  onFocus,
  results,
  value
}: {
  catalogError: string;
  catalogOpen: boolean;
  isSearchingCatalog: boolean;
  name: string;
  onBlur: () => void;
  onCandidateSelect: (candidate: SellTradeQuoteCatalogCandidate) => void;
  onChange: (value: string) => void;
  onFocus: () => void;
  results: SellTradeQuoteCatalogCandidate[];
  value: string;
}) {
  return (
    <label className="relative grid gap-2">
      <span className="text-sm font-semibold text-vault-text">Card or product name</span>
      <input
        autoComplete="off"
        className="min-h-12 rounded-xl border border-vault-border bg-vault-secondary px-4 py-3 text-sm text-vault-text outline-none transition placeholder:text-vault-muted focus:border-vault-gold focus:ring-2 focus:ring-vault-gold/20"
        maxLength={160}
        name={name}
        onBlur={onBlur}
        onChange={(event) => onChange(event.target.value)}
        onFocus={onFocus}
        required
        type="text"
        value={value}
      />
      {catalogOpen && (isSearchingCatalog || catalogError || results.length > 0) ? (
        <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-80 overflow-auto rounded-xl border border-vault-border bg-vault-card p-2 shadow-vault">
          {isSearchingCatalog ? <p className="px-3 py-2 text-xs font-semibold uppercase text-vault-muted">Searching catalog...</p> : null}
          {catalogError ? <p className="px-3 py-2 text-xs text-vault-error">{catalogError}</p> : null}
          {results.map((candidate) => (
            <button
              className="grid w-full gap-1 rounded-lg px-3 py-2 text-left transition hover:bg-vault-secondary focus:bg-vault-secondary focus:outline-none"
              key={candidate.id}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onCandidateSelect(candidate)}
              type="button"
            >
              <span className="text-sm font-semibold text-vault-text">{candidate.name}</span>
              {candidateMeta(candidate) ? <span className="text-xs leading-5 text-vault-muted">{candidateMeta(candidate)}</span> : null}
            </button>
          ))}
        </div>
      ) : null}
    </label>
  );
}

function Field({
  label,
  name,
  onChange,
  value,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> & {
  label: string;
  name: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-vault-text">{label}</span>
      <input
        className="min-h-12 rounded-xl border border-vault-border bg-vault-secondary px-4 py-3 text-sm text-vault-text outline-none transition placeholder:text-vault-muted focus:border-vault-gold focus:ring-2 focus:ring-vault-gold/20"
        maxLength={160}
        name={name}
        onChange={(event) => onChange(event.target.value)}
        type="text"
        value={value}
        {...props}
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  onChange,
  options,
  value
}: {
  label: string;
  name: string;
  onChange: (value: string) => void;
  options: string[];
  value: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-vault-text">{label}</span>
      <select
        className="min-h-12 rounded-xl border border-vault-border bg-vault-secondary px-4 py-3 text-sm text-vault-text outline-none transition focus:border-vault-gold focus:ring-2 focus:ring-vault-gold/20"
        name={name}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function formatCentsForInput(value?: number) {
  return typeof value === "number" ? String(value / 100) : "";
}

function normalizeGame(franchise?: string) {
  if (!franchise) return "Other";
  const matchingOption = wishlistGameOptions.find((option) => option.toLowerCase() === franchise.toLowerCase());
  return matchingOption ?? "Other";
}

function candidateMeta(candidate: Pick<SellTradeQuoteCatalogCandidate, "franchise" | "setName" | "cardNumber" | "variant">) {
  return [candidate.franchise, candidate.setName, candidate.cardNumber ? `#${candidate.cardNumber}` : "", candidate.variant].filter(Boolean).join(" / ");
}
