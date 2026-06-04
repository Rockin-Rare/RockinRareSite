"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent, InputHTMLAttributes } from "react";
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
  buttonLabel: string;
  isPending?: boolean;
  item?: RareRadarWishlistItem;
  onSubmit: (formData: FormData) => void;
  pendingLabel?: string;
};

export function WishlistItemForm({ buttonLabel, isPending = false, item, onSubmit, pendingLabel }: WishlistItemFormProps) {
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
  const [imageUrl, setImageUrl] = useState(item?.imageUrl ?? "");
  const [catalogResults, setCatalogResults] = useState<SellTradeQuoteCatalogCandidate[]>([]);
  const [catalogError, setCatalogError] = useState("");
  const [isSearchingCatalog, setIsSearchingCatalog] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [catalogMatchLabel, setCatalogMatchLabel] = useState(item ? wishlistItemMeta(item) : "");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const skipNextSearchRef = useRef(false);

  useEffect(() => {
    setProductName(item?.productName ?? "");
    setGame(item?.game ?? wishlistGameOptions[0]);
    setCategory(item?.category ?? wishlistCategoryOptions[0]);
    setSetName(item?.setName ?? "");
    setCardNumber(item?.cardNumber ?? "");
    setLanguage(item?.language ?? wishlistLanguageOptions[0]);
    setDesiredCondition(item?.desiredCondition ?? wishlistConditionOptions[0]);
    setMaxPrice(formatCentsForInput(item?.maxPriceCents));
    setAlertThreshold(item?.alertThreshold ?? wishlistAlertThresholdOptions[0]);
    setNotes(item?.notes ?? "");
    setImageUrl(item?.imageUrl ?? "");
    setCatalogResults([]);
    setCatalogError("");
    setCatalogOpen(false);
    setCatalogMatchLabel(item ? wishlistItemMeta(item) : "");
    setAdvancedOpen(false);
  }, [item]);

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
    setImageUrl(candidate.imageUrl ?? "");
    setCatalogMatchLabel(candidateMeta(candidate) || candidate.name);
    setCatalogResults([]);
    setCatalogError("");
    setCatalogOpen(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(new FormData(event.currentTarget));
  }

  return (
    <form className="grid gap-3" onSubmit={handleSubmit}>
      {item ? <input name="itemId" type="hidden" value={item.id} /> : null}
      <input name="imageUrl" type="hidden" value={imageUrl} />
      <CatalogNameField
        catalogError={catalogError}
        catalogOpen={catalogOpen}
        isSearchingCatalog={isSearchingCatalog}
        matchLabel={catalogMatchLabel}
        name="productName"
        onBlur={() => window.setTimeout(() => setCatalogOpen(false), 150)}
        onCandidateSelect={applyCatalogCandidate}
        onChange={(value) => {
          setProductName(value);
          if (catalogMatchLabel) setCatalogMatchLabel("");
          if (imageUrl) setImageUrl("");
        }}
        onFocus={() => setCatalogOpen(true)}
        results={catalogResults}
        value={productName}
      />

      {imageUrl ? (
        <div className="grid grid-cols-[56px_1fr] items-center gap-3 rounded-xl border border-vault-border bg-vault-secondary/70 p-3">
          <img
            alt={productName ? `${productName} catalog image` : "Catalog card image"}
            className="aspect-[5/7] w-14 rounded-lg border border-vault-border bg-vault-card object-contain p-1"
            decoding="async"
            height={78}
            loading="lazy"
            referrerPolicy="no-referrer"
            src={imageUrl}
            width={56}
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-vault-text">Stock image attached</p>
            <p className="mt-1 truncate text-xs text-vault-muted">From the Card Intake catalog.</p>
          </div>
        </div>
      ) : null}

      <Field inputMode="decimal" label="Max price optional" name="maxPrice" onChange={setMaxPrice} placeholder="Example: 75" value={maxPrice} />

      <label className="grid min-w-0 gap-2">
        <span className="text-sm font-semibold text-vault-text">Notes optional</span>
        <textarea
          className="min-h-24 min-w-0 rounded-xl border border-vault-border bg-vault-secondary px-4 py-3 text-sm text-vault-text outline-none transition placeholder:text-vault-muted focus:border-vault-gold focus:ring-2 focus:ring-vault-gold/20"
          maxLength={800}
          name="notes"
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Specific art, grading company, centering preference, or deal notes."
          value={notes}
        />
      </label>

      <button
        className="w-fit rounded-lg border border-vault-border px-3 py-2 text-xs font-bold uppercase text-vault-secondaryText transition hover:border-vault-gold hover:text-vault-highlight"
        onClick={() => setAdvancedOpen((current) => !current)}
        type="button"
      >
        {advancedOpen ? "Hide Details" : "More Details"}
      </button>

      <div className={advancedOpen ? "grid gap-3 border-t border-vault-border pt-3" : "hidden"}>
        <div className="grid gap-3">
          <SelectField label="Game" name="game" onChange={setGame} options={wishlistGameOptions} value={game} />
          <SelectField label="Type" name="category" onChange={setCategory} options={wishlistCategoryOptions} value={category} />
        </div>
        <div className="grid gap-3">
          <Field label="Set or version" name="setName" onChange={setSetName} value={setName} />
          <Field label="Card number" name="cardNumber" onChange={setCardNumber} value={cardNumber} />
        </div>
        <div className="grid gap-3">
          <SelectField label="Language" name="language" onChange={setLanguage} options={wishlistLanguageOptions} value={language} />
          <SelectField label="Condition" name="desiredCondition" onChange={setDesiredCondition} options={wishlistConditionOptions} value={desiredCondition} />
        </div>
        <SelectField label="Alert threshold" name="alertThreshold" onChange={setAlertThreshold} options={wishlistAlertThresholdOptions} value={alertThreshold} />
      </div>
      <SubmitButton isPending={isPending} label={buttonLabel} pendingLabel={pendingLabel ?? `${buttonLabel}...`} />
    </form>
  );
}

function SubmitButton({ isPending, label, pendingLabel }: { isPending: boolean; label: string; pendingLabel: string }) {
  return (
    <Button disabled={isPending} type="submit">
      {isPending ? pendingLabel : label}
    </Button>
  );
}

function CatalogNameField({
  catalogError,
  catalogOpen,
  isSearchingCatalog,
  matchLabel,
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
  matchLabel: string;
  name: string;
  onBlur: () => void;
  onCandidateSelect: (candidate: SellTradeQuoteCatalogCandidate) => void;
  onChange: (value: string) => void;
  onFocus: () => void;
  results: SellTradeQuoteCatalogCandidate[];
  value: string;
}) {
  return (
    <label className="relative grid min-w-0 gap-2">
      <span className="text-sm font-semibold text-vault-text">Card or product name</span>
      <input
        autoComplete="off"
        className="min-h-12 min-w-0 rounded-xl border border-vault-border bg-vault-secondary px-4 py-3 text-sm text-vault-text outline-none transition placeholder:text-vault-muted focus:border-vault-gold focus:ring-2 focus:ring-vault-gold/20"
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
              className="grid w-full grid-cols-[44px_1fr] items-center gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-vault-secondary focus:bg-vault-secondary focus:outline-none"
              key={candidate.id}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onCandidateSelect(candidate)}
              type="button"
            >
              {candidate.imageUrl ? (
                <img
                  alt=""
                  className="aspect-[5/7] w-11 rounded border border-vault-border bg-vault-card object-contain p-0.5"
                  decoding="async"
                  height={62}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  src={candidate.imageUrl}
                  width={44}
                />
              ) : (
                <span className="aspect-[5/7] w-11 rounded border border-vault-border bg-vault-secondary" />
              )}
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-vault-text">{candidate.name}</span>
                {candidateMeta(candidate) ? <span className="block truncate text-xs leading-5 text-vault-muted">{candidateMeta(candidate)}</span> : null}
              </span>
            </button>
          ))}
        </div>
      ) : null}
      {matchLabel ? (
        <span className="w-fit rounded-lg border border-vault-gold/30 bg-vault-gold/10 px-3 py-2 text-xs font-semibold text-vault-highlight">
          Catalog match selected: {matchLabel}
        </span>
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
    <label className="grid min-w-0 gap-2">
      <span className="text-sm font-semibold text-vault-text">{label}</span>
      <input
        className="min-h-12 min-w-0 rounded-xl border border-vault-border bg-vault-secondary px-4 py-3 text-sm text-vault-text outline-none transition placeholder:text-vault-muted focus:border-vault-gold focus:ring-2 focus:ring-vault-gold/20"
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
    <label className="grid min-w-0 gap-2">
      <span className="text-sm font-semibold text-vault-text">{label}</span>
      <select
        className="min-h-12 min-w-0 rounded-xl border border-vault-border bg-vault-secondary px-4 py-3 text-sm text-vault-text outline-none transition focus:border-vault-gold focus:ring-2 focus:ring-vault-gold/20"
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

function wishlistItemMeta(item: RareRadarWishlistItem) {
  return [item.game, item.setName, item.cardNumber ? `#${item.cardNumber}` : "", item.language].filter(Boolean).join(" / ");
}
