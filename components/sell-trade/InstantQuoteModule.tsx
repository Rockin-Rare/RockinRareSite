"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import { Button } from "@/components/ui/Button";
import { compressImageFile, compressImageFiles } from "@/lib/browser-image-compression";
import { createId } from "@/lib/id";
import { sellTradeOfferTiers } from "@/lib/sell-trade-offer-rates";
import { sellTradeMaxPhotoSizeMb, sellTradeMaxPhotos } from "@/lib/sell-trade-upload-limits";
import type { SellTradeQuote, SellTradeQuoteCatalogCandidate } from "@/lib/types";

export type InstantQuoteModuleState = {
  files: File[];
  photoSession: string;
  quote: SellTradeQuote | null;
  selectedPhotoCount: number;
};

type InstantQuoteModuleProps = {
  franchise?: string;
  approximateQuantity?: string;
  conditionEstimate?: string;
  description?: string;
  onChange?: (state: InstantQuoteModuleState) => void;
  onContinueWithQuote?: (quote: SellTradeQuote, offerPreference?: "Cash payout" | "Trade credit" | "Decide after final review") => void;
};

type PhonePhoto = {
  id: string;
  name: string;
  size: number;
};

type FilePreview = {
  key: string;
  name: string;
  size: number;
  url: string;
};

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", { currency: "USD", style: "currency" }).format(cents / 100);
}


function getTotalMarketValueCents(quote: SellTradeQuote) {
  const detectedMarketValueCents = quote.detectedCards.reduce((total, card) => total + Math.max(0, card.marketPriceCents ?? 0), 0);
  if (detectedMarketValueCents > 0) return detectedMarketValueCents;

  return Math.max(Math.round(quote.cashOfferCents / 0.45), Math.round(quote.tradeCreditCents / 0.6));
}


function formatRate(rate: number) {
  return rate > 0 ? `${Math.round(rate * 100)}%` : "Review";
}

function cardFromCandidate(candidate: SellTradeQuoteCatalogCandidate) {
  return {
    cardReferenceId: candidate.id,
    name: candidate.name,
    franchise: candidate.franchise,
    setName: candidate.setName,
    cardNumber: candidate.cardNumber,
    confidence: 1
  };
}

function applyCandidateToQuote(quote: SellTradeQuote, index: number, candidate: SellTradeQuoteCatalogCandidate): SellTradeQuote {
  return {
    ...quote,
    detectedCards: quote.detectedCards.map((card, cardIndex) =>
      cardIndex === index
        ? {
            ...card,
            ...cardFromCandidate(candidate),
            catalogCandidates: card.catalogCandidates
          }
        : card
    )
  };
}

function mergeCorrectedQuote(previousQuote: SellTradeQuote, correctedQuote: SellTradeQuote, correctedIndex: number, candidate: SellTradeQuoteCatalogCandidate): SellTradeQuote {
  const correctedCardsById = new Map(correctedQuote.detectedCards.map((card) => [card.cardReferenceId, card]));

  return {
    ...correctedQuote,
    detectedCards: previousQuote.detectedCards.map((card, index) => {
      const correctedCard =
        index === correctedIndex
          ? correctedQuote.detectedCards.find((item) => item.cardReferenceId === candidate.id) ?? correctedQuote.detectedCards[index]
          : card.cardReferenceId
            ? correctedCardsById.get(card.cardReferenceId)
            : undefined;

      if (!correctedCard && index !== correctedIndex) return card;

      return {
        ...card,
        ...(index === correctedIndex ? cardFromCandidate(candidate) : {}),
        ...(correctedCard ?? {}),
        catalogCandidates: card.catalogCandidates
      };
    })
  };
}

function phonePhotoPreviewUrl(sessionId: string, photoId: string) {
  return `/api/sell-trade/photos?session=${encodeURIComponent(sessionId)}&photo=${encodeURIComponent(photoId)}`;
}

function dataUrlToFile(dataUrl: string, name: string) {
  const [metadata, data] = dataUrl.split(",");
  const mimeMatch = metadata.match(/data:(.*);base64/);
  const mime = mimeMatch?.[1] ?? "image/jpeg";
  const bytes = Uint8Array.from(atob(data), (character) => character.charCodeAt(0));

  return new File([bytes], name, { type: mime });
}

export function InstantQuoteModule({
  franchise = "",
  approximateQuantity = "",
  conditionEstimate = "",
  description = "",
  onChange,
  onContinueWithQuote
}: InstantQuoteModuleProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<FilePreview[]>([]);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [mode, setMode] = useState<"camera" | "computer" | "phone">("camera");
  const [photoSession, setPhotoSession] = useState("");
  const [phonePhotos, setPhonePhotos] = useState<PhonePhoto[]>([]);
  const [uploadUrl, setUploadUrl] = useState("");
  const [quote, setQuote] = useState<SellTradeQuote | null>(null);
  const [quoteError, setQuoteError] = useState("");
  const [editingMatchIndex, setEditingMatchIndex] = useState<number | null>(null);
  const [matchSearchQuery, setMatchSearchQuery] = useState("");
  const [matchSearchResults, setMatchSearchResults] = useState<SellTradeQuoteCatalogCandidate[]>([]);
  const [matchCorrectionError, setMatchCorrectionError] = useState("");
  const [isSearchingMatches, setIsSearchingMatches] = useState(false);
  const [isCorrectingMatch, setIsCorrectingMatch] = useState(false);
  const [isPreparingPhotos, setIsPreparingPhotos] = useState(false);
  const [isDeletingPhonePhoto, setIsDeletingPhonePhoto] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureFeedbackId, setCaptureFeedbackId] = useState(0);
  const [isQuoting, setIsQuoting] = useState(false);
  const selectedPhotoCount = files.length + phonePhotos.length;

  useEffect(() => {
    const session = createId();
    setPhotoSession(session);
    setUploadUrl(`${window.location.origin}/sell-trade/photos/${session}`);

    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    if (!photoSession || mode !== "phone") return;

    async function pollPhonePhotos() {
      const response = await fetch(`/api/sell-trade/photos?session=${encodeURIComponent(photoSession)}`);
      const result = (await response.json().catch(() => ({}))) as { photos?: PhonePhoto[] };
      const nextPhotos = result.photos ?? [];

      setPhonePhotos((currentPhotos) => {
        const currentIds = currentPhotos.map((photo) => photo.id).join(",");
        const nextIds = nextPhotos.map((photo) => photo.id).join(",");

        if (currentIds !== nextIds) {
          setQuote(null);
          setQuoteError("");
        }

        return nextPhotos;
      });
    }

    pollPhonePhotos();
    const intervalId = window.setInterval(pollPhonePhotos, 3000);

    return () => window.clearInterval(intervalId);
  }, [mode, photoSession]);

  useEffect(() => {
    onChange?.({ files, photoSession, quote, selectedPhotoCount });
  }, [files, onChange, photoSession, quote, selectedPhotoCount]);

  useEffect(() => {
    if (captureFeedbackId === 0) return;

    const timeoutId = window.setTimeout(() => setCaptureFeedbackId(0), 900);
    return () => window.clearTimeout(timeoutId);
  }, [captureFeedbackId]);

  useEffect(() => {
    const nextPreviews = files.map((file, index) => ({
      key: `${file.name}-${file.size}-${file.lastModified}-${index}`,
      name: file.name,
      size: file.size,
      url: URL.createObjectURL(file)
    }));

    setFilePreviews(nextPreviews);

    return () => {
      nextPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [files]);

  function updateFiles(nextFiles: File[]) {
    setFiles(nextFiles.slice(0, sellTradeMaxPhotos));
    setQuote(null);
    setQuoteError("");
  }

  async function updateSelectedFiles(nextFiles: File[]) {
    setIsPreparingPhotos(true);
    try {
      updateFiles(await compressImageFiles(nextFiles.slice(0, sellTradeMaxPhotos)));
    } finally {
      setIsPreparingPhotos(false);
    }
  }

  function removeFile(indexToRemove: number) {
    updateFiles(files.filter((_, index) => index !== indexToRemove));
  }

  async function deletePhonePhoto(photoId?: string) {
    if (!photoSession) return;

    setIsDeletingPhonePhoto(true);
    setQuote(null);
    setQuoteError("");

    try {
      const query = new URLSearchParams({ session: photoSession });
      if (photoId) query.set("photo", photoId);

      const response = await fetch(`/api/sell-trade/photos?${query.toString()}`, { method: "DELETE" });
      const result = (await response.json().catch(() => ({}))) as { photos?: PhonePhoto[]; error?: string };
      if (!response.ok) throw new Error(result.error || "Unable to remove phone photo.");

      setPhonePhotos(result.photos ?? []);
    } catch (error) {
      setQuoteError(error instanceof Error ? error.message : "Unable to remove phone photo.");
    } finally {
      setIsDeletingPhonePhoto(false);
    }
  }

  async function startCamera() {
    setCameraError("");

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera access is not available in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraActive(true);
    } catch {
      setCameraError("Unable to open the camera. You can still upload photos.");
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraActive(false);
  }

  async function captureFrame() {
    const video = videoRef.current;
    if (isCapturing || files.length >= sellTradeMaxPhotos || !video || !video.videoWidth || !video.videoHeight) return;

    setIsCapturing(true);

    try {
      const targetRatio = 5 / 7;
      const sourceRatio = video.videoWidth / video.videoHeight;
      const sourceWidth = sourceRatio > targetRatio ? Math.round(video.videoHeight * targetRatio) : video.videoWidth;
      const sourceHeight = sourceRatio > targetRatio ? video.videoHeight : Math.round(video.videoWidth / targetRatio);
      const sourceX = Math.max(0, Math.round((video.videoWidth - sourceWidth) / 2));
      const sourceY = Math.max(0, Math.round((video.videoHeight - sourceHeight) / 2));
      const canvas = document.createElement("canvas");
      canvas.width = sourceWidth;
      canvas.height = sourceHeight;
      const context = canvas.getContext("2d");
      if (!context) return;

      context.drawImage(video, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, sourceWidth, sourceHeight);
      const file = dataUrlToFile(canvas.toDataURL("image/jpeg", 0.9), `seller-scan-${Date.now()}.jpg`);
      const compressedFile = await compressImageFile(file);
      setFiles((currentFiles) => [...currentFiles, compressedFile].slice(0, sellTradeMaxPhotos));
      setCaptureFeedbackId(Date.now());
      setQuote(null);
      setQuoteError("");
    } finally {
      setIsCapturing(false);
    }
  }

  async function requestQuote() {
    setQuoteError("");

    if (selectedPhotoCount === 0) {
      setQuoteError("Add at least one card photo first.");
      return;
    }

    if (cameraActive) stopCamera();
    const payload = new FormData();
    payload.append("franchise", franchise);
    payload.append("approximateQuantity", approximateQuantity);
    payload.append("conditionEstimate", conditionEstimate);
    payload.append("description", description);
    payload.append("photoSession", photoSession);
    files.forEach((file) => payload.append("photos", file));

    setIsQuoting(true);
    track("sell_trade_quote_started", {
      photoCount: selectedPhotoCount,
      inputMode: mode
    });

    try {
      const response = await fetch("/api/sell-trade/quote", {
        method: "POST",
        body: payload
      });
      const result = (await response.json().catch(() => ({}))) as { quote?: SellTradeQuote; error?: string };

      if (!response.ok || !result.quote) {
        throw new Error(result.error || "Unable to generate a quote.");
      }

      setQuote(result.quote);
      track("sell_trade_quote_completed", {
        quoteId: result.quote.id,
        cashOfferCents: result.quote.cashOfferCents,
        tradeCreditCents: result.quote.tradeCreditCents,
        marketValueCents: getTotalMarketValueCents(result.quote),
        matchedCardCount: result.quote.detectedCards.length,
        confidence: result.quote.confidence,
        source: result.quote.source
      });
      setEditingMatchIndex(null);
      setMatchSearchQuery("");
      setMatchSearchResults([]);
      setMatchCorrectionError("");
    } catch (error) {
      setQuoteError(error instanceof Error ? error.message : "Unable to generate a quote.");
    } finally {
      setIsQuoting(false);
    }
  }

  async function searchCatalogMatches() {
    setMatchCorrectionError("");
    const query = matchSearchQuery.trim();
    if (query.length < 2) {
      setMatchSearchResults([]);
      return;
    }

    setIsSearchingMatches(true);
    try {
      const response = await fetch(`/api/sell-trade/catalog?q=${encodeURIComponent(query)}&productType=TCG`);
      const result = (await response.json().catch(() => ({}))) as { cards?: SellTradeQuoteCatalogCandidate[]; error?: string };
      if (!response.ok) throw new Error(result.error || "Unable to search catalog.");
      setMatchSearchResults(result.cards ?? []);
    } catch (error) {
      setMatchCorrectionError(error instanceof Error ? error.message : "Unable to search catalog.");
    } finally {
      setIsSearchingMatches(false);
    }
  }

  async function applyCatalogMatch(index: number, candidate: SellTradeQuoteCatalogCandidate) {
    if (!quote) return;

    const previousQuote = quote;
    const optimisticQuote = applyCandidateToQuote(previousQuote, index, candidate);
    setMatchCorrectionError("");
    setIsCorrectingMatch(true);
    setQuote(optimisticQuote);
    setEditingMatchIndex(null);
    setMatchSearchQuery("");
    setMatchSearchResults([]);

    try {
      const cardReferenceIds = optimisticQuote.detectedCards
        .map((card, cardIndex) => (cardIndex === index ? candidate.id : card.cardReferenceId))
        .filter((id): id is string => Boolean(id));
      const response = await fetch("/api/sell-trade/quote/corrections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardReferenceIds, conditionEstimate })
      });
      const result = (await response.json().catch(() => ({}))) as { quote?: SellTradeQuote; error?: string };
      if (!response.ok || !result.quote) throw new Error(result.error || "Unable to update quote.");

      setQuote(mergeCorrectedQuote(optimisticQuote, result.quote, index, candidate));
      setEditingMatchIndex(null);
      setMatchSearchQuery("");
      setMatchSearchResults([]);
    } catch (error) {
      setQuote(previousQuote);
      setMatchCorrectionError(error instanceof Error ? error.message : "Unable to update quote.");
    } finally {
      setIsCorrectingMatch(false);
    }
  }

  function candidateMeta(candidate: Pick<SellTradeQuoteCatalogCandidate, "franchise" | "setName" | "cardNumber" | "variant">) {
    return [candidate.franchise, candidate.setName, candidate.cardNumber ? `#${candidate.cardNumber}` : "", candidate.variant].filter(Boolean).join(" / ");
  }

  function continueWithQuote() {
    continueWithQuotePreference("Decide after final review");
  }

  function continueWithQuotePreference(offerPreference: "Cash payout" | "Trade credit" | "Decide after final review") {
    if (quote) {
      track("sell_trade_offer_selected", {
        quoteId: quote.id,
        selection: offerPreference,
        cashOfferCents: quote.cashOfferCents,
        tradeCreditCents: quote.tradeCreditCents,
        marketValueCents: getTotalMarketValueCents(quote)
      });
      onContinueWithQuote?.(quote, offerPreference);
    }

    const detailsForm = document.getElementById("sell-trade-details");
    detailsForm?.scrollIntoView({ behavior: "smooth", block: "start" });

    window.setTimeout(() => {
      const firstField = detailsForm?.querySelector<HTMLTextAreaElement>("#sell-trade-description");
      firstField?.focus({ preventScroll: true });
    }, 350);
  }

  return (
    <section className="grid min-w-0 content-start gap-4 rounded-2xl border border-vault-border bg-vault-card p-5 shadow-vault">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase text-vault-gold">Step 1</p>
          <h2 className="mt-2 text-2xl font-black text-vault-text">See what your cards are worth</h2>
        </div>
        <span className="rounded-full border border-vault-gold/30 bg-vault-gold/10 px-3 py-1 text-xs font-semibold uppercase text-vault-gold">
          {selectedPhotoCount}/{sellTradeMaxPhotos} front photos
        </span>
      </div>
      <p className="max-w-2xl text-sm leading-6 text-vault-secondaryText">
        Upload up to 24 raw singles for a fast preliminary market value, cash offer, and trade credit estimate.
      </p>
      <input name="photoSession" type="hidden" value={photoSession} />

      <div className="inline-flex w-fit rounded-xl border border-vault-border bg-vault-card p-1">
        {(["camera", "computer", "phone"] as const).map((option) => (
          <button
            className={`rounded-lg px-3 py-2 text-xs font-semibold capitalize transition ${
              mode === option ? "bg-vault-gold text-[#111318]" : "text-vault-secondaryText hover:text-vault-highlight"
            }`}
            key={option}
            onClick={() => setMode(option)}
            type="button"
          >
            {option === "phone" ? "Phone QR" : option}
          </button>
        ))}
      </div>

      <div className="grid min-w-0 gap-4">
        <div className="grid min-w-0 gap-3">
          {mode === "camera" ? (
            <>
              <div className={`${cameraActive ? "aspect-[5/7]" : "aspect-[5/7] min-h-[320px]"} relative mx-auto w-full max-w-[23rem] overflow-hidden rounded-xl border border-vault-border bg-vault-card`}>
                <video ref={videoRef} className={cameraActive ? "h-full w-full object-cover" : "hidden"} muted playsInline />
                {!cameraActive ? (
                  <div className="grid h-full place-items-center px-5 text-center text-sm leading-6 text-vault-secondaryText">
                    Open camera to capture front photos.
                  </div>
                ) : null}
                {cameraActive ? <div className="pointer-events-none absolute inset-3 rounded-lg border border-vault-gold/45" /> : null}
                {captureFeedbackId > 0 ? (
                  <div className="pointer-events-none absolute inset-0 grid place-items-center bg-white/24 animate-pulse" role="status" aria-live="polite">
                    <div className="rounded-full border border-vault-success/50 bg-vault-bg/90 px-4 py-2 text-sm font-bold text-vault-text shadow-vault">
                      Photo saved - {files.length}/{sellTradeMaxPhotos}
                    </div>
                  </div>
                ) : null}
              </div>
              {cameraActive ? <p className="text-center text-xs leading-5 text-vault-muted">Center one card in the frame. Fill as much of the outline as possible and avoid glare.</p> : null}
              <div className="flex flex-wrap gap-2">
                {cameraActive ? (
                  <>
                    <Button disabled={isCapturing || files.length >= sellTradeMaxPhotos} onClick={captureFrame} type="button">
                      {isCapturing ? "Saving Photo..." : files.length >= sellTradeMaxPhotos ? "Photo Limit Reached" : "Capture Front Photo"}
                    </Button>
                    <Button onClick={stopCamera} type="button" variant="secondary">
                      Stop Camera
                    </Button>
                  </>
                ) : (
                  <Button onClick={startCamera} type="button">
                    Open Camera
                  </Button>
                )}
              </div>
            </>
          ) : null}

          {mode === "computer" ? (
            <label className="grid cursor-pointer gap-3 rounded-xl border border-dashed border-vault-border bg-vault-card p-5 text-center transition hover:border-vault-gold">
              <span className="text-sm font-semibold text-vault-text">Choose Photos</span>
              <span className="text-sm text-vault-secondaryText">
                JPG, PNG, WebP, GIF, HEIC, or HEIF. Up to {sellTradeMaxPhotos} photos, {sellTradeMaxPhotoSizeMb} MB each.
              </span>
              <input
                accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif"
                className="sr-only"
                multiple
                onChange={(event) => void updateSelectedFiles(Array.from(event.target.files ?? []))}
                type="file"
              />
            </label>
          ) : null}

          {mode === "phone" ? (
            <div className="grid min-w-0 justify-items-center gap-4 rounded-xl border border-vault-border bg-vault-card p-5 text-center">
              {uploadUrl ? (
                <img alt="Sell trade upload QR code" className="h-[168px] w-[168px] rounded-lg bg-white p-2 sm:h-[180px] sm:w-[180px]" height={180} src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=12&data=${encodeURIComponent(uploadUrl)}`} width={180} />
              ) : (
                <div className="h-[168px] w-[168px] rounded-lg bg-vault-elevated sm:h-[180px] sm:w-[180px]" />
              )}
              <div className="min-w-0 max-w-[22rem]">
                <p className="text-sm font-semibold text-vault-text">Continue on Phone</p>
                <p className="mt-2 text-sm leading-6 text-vault-secondaryText">Scan the QR code to add front photos from your phone. Photos added there will appear here automatically.</p>
              </div>
            </div>
          ) : null}

          {cameraError ? <p className="text-sm text-vault-error">{cameraError}</p> : null}

          {selectedPhotoCount > 0 ? (
            <div className="grid gap-2 rounded-xl border border-vault-border bg-vault-card p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase text-vault-gold">{selectedPhotoCount} selected</span>
                <div className="flex flex-wrap justify-end gap-2">
                  {quote ? (
                    <button className="text-xs font-semibold text-vault-gold hover:text-vault-highlight disabled:text-vault-muted" disabled={isPreparingPhotos || isQuoting} onClick={requestQuote} type="button">
                      Refresh
                    </button>
                  ) : null}
                  {files.length > 0 ? (
                    <button className="text-xs font-semibold text-vault-secondaryText hover:text-vault-highlight" onClick={() => updateFiles([])} type="button">
                      Clear card photos
                    </button>
                  ) : null}
                  {phonePhotos.length > 0 ? (
                    <button className="text-xs font-semibold text-vault-secondaryText hover:text-vault-highlight disabled:text-vault-muted" disabled={isDeletingPhonePhoto} onClick={() => void deletePhonePhoto()} type="button">
                      Clear phone photos
                    </button>
                  ) : null}
                </div>
              </div>
              {filePreviews.length > 0 ? (
                <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {filePreviews.map((preview, index) => (
                    <li className="overflow-hidden rounded-lg border border-vault-border bg-vault-secondary" key={preview.key}>
                      <img alt={`Selected card photo ${index + 1}`} className="aspect-[5/7] w-full bg-vault-card object-cover" src={preview.url} />
                      <div className="grid gap-1 p-2">
                        <div className="min-w-0 text-xs text-vault-secondaryText">
                          <p className="truncate">{preview.name}</p>
                        </div>
                        <button className="rounded-lg border border-vault-border px-2 py-1 text-[11px] font-semibold text-vault-secondaryText hover:border-vault-gold hover:text-vault-highlight" onClick={() => removeFile(index)} type="button">
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}
              {phonePhotos.length > 0 ? (
                <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {phonePhotos.map((photo, index) => (
                    <li className="overflow-hidden rounded-lg border border-vault-border bg-vault-secondary" key={photo.id}>
                      <img alt={`Phone card photo ${index + 1}`} className="aspect-[5/7] w-full bg-vault-card object-cover" src={phonePhotoPreviewUrl(photoSession, photo.id)} />
                      <div className="grid gap-1 p-2">
                        <div className="min-w-0 text-xs text-vault-secondaryText">
                          <p className="truncate">{photo.name}</p>
                        </div>
                        <button className="rounded-lg border border-vault-border px-2 py-1 text-[11px] font-semibold text-vault-secondaryText hover:border-vault-gold hover:text-vault-highlight disabled:text-vault-muted" disabled={isDeletingPhonePhoto} onClick={() => void deletePhonePhoto(photo.id)} type="button">
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          {selectedPhotoCount > 0 && !quote ? (
            <div className="grid gap-3 border-t border-vault-border pt-3">
              <p className="text-xs leading-5 text-vault-muted">New to Rockin Rare? We are a small collector-run shop with 100% positive TCGplayer feedback across 83 sales. Quotes are no-obligation and final offers are verified before payment.</p>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  className="w-full disabled:border-vault-border disabled:bg-vault-secondary/70 disabled:text-vault-muted disabled:shadow-none"
                  disabled={isPreparingPhotos || isQuoting}
                  onClick={requestQuote}
                  type="button"
                >
                  {isPreparingPhotos ? "Preparing Photos..." : isQuoting ? "Scanning..." : "See What Your Cards Are Worth"}
                </Button>
                {quoteError ? <p className="text-sm text-vault-error">{quoteError}</p> : null}
              </div>
            </div>
          ) : null}
        </div>

        {quote ? (
          <>
          <div className="grid content-start gap-3 rounded-xl border border-vault-border bg-vault-card p-4" role="status">
            <div className="grid gap-1">
              <p className="text-xs font-semibold uppercase text-vault-gold">Preliminary quote</p>
              <p className="text-sm leading-6 text-vault-secondaryText">Preliminary estimate. Final offer confirmed after review. No obligation.</p>
            </div>

            <div className="grid gap-2 rounded-xl border border-vault-border bg-vault-secondary p-4">
              <p className="text-xs font-semibold uppercase leading-4 text-vault-muted">Estimated Market Value</p>
              <p className="text-3xl font-black text-vault-text">{formatCurrency(getTotalMarketValueCents(quote))}</p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid content-start rounded-xl border border-vault-border bg-vault-secondary p-3">
                <p className="text-xs font-semibold uppercase leading-4 text-vault-muted">Cash Offer</p>
                <p className="mt-1 text-2xl font-black text-vault-text">{formatCurrency(quote.cashOfferCents)}</p>
              </div>
              <div className="grid content-start rounded-xl border border-vault-gold/45 bg-vault-gold/10 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase leading-4 text-vault-gold">Trade Credit Offer</p>
                  <span className="rounded-full border border-vault-gold/40 px-2 py-0.5 text-[11px] font-semibold uppercase text-vault-gold">Better value</span>
                </div>
                <p className="mt-1 text-2xl font-black text-vault-text">{formatCurrency(quote.tradeCreditCents)}</p>
              </div>
            </div>

            <p className="text-xs leading-5 text-vault-muted">Our offer is below estimated market value because we take on verification, listing, marketplace fees, shipping, resale time, and buyer issue risk.</p>

            <div className="grid gap-2">
              <button
                className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-vault-gold px-4 py-3 text-sm font-semibold text-[#111318] shadow-vault transition hover:-translate-y-0.5 hover:bg-vault-highlight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vault-highlight"
                onClick={() => continueWithQuotePreference("Trade credit")}
                type="button"
              >
                Accept Trade Credit Offer
              </button>
              <button
                className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-vault-border bg-vault-secondary/80 px-4 py-3 text-sm font-semibold text-vault-text transition hover:border-vault-gold hover:bg-vault-elevated hover:text-vault-highlight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vault-highlight"
                onClick={() => continueWithQuotePreference("Cash payout")}
                type="button"
              >
                Accept Cash Offer
              </button>
              <button
                className="inline-flex min-h-11 w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-vault-secondaryText transition hover:bg-vault-elevated hover:text-vault-highlight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vault-highlight"
                onClick={continueWithQuote}
                type="button"
              >
                Ask a Question
              </button>
            </div>

          </div>
          <div className="grid content-start gap-3 rounded-xl border border-vault-border bg-vault-card p-4">
            <div className="grid gap-1">
              <p className="text-xs font-semibold uppercase text-vault-gold">Quote details</p>
              <p className="text-sm leading-6 text-vault-secondaryText">Review matched cards and optional quote details.</p>
            </div>
            {quote.detectedCards.length > 0 ? (
              <div className="grid gap-2 border-t border-vault-border pt-3">
                <p className="text-xs font-semibold uppercase text-vault-gold">Card breakdown</p>
                <ul className="overflow-hidden rounded-xl border border-vault-border bg-vault-secondary">
                  {quote.detectedCards.map((card, index) => {
                    const cardStatus = typeof card.confidence === "number" && card.confidence >= 0.65 ? "Matched" : "Needs review";
                    const cardDetails = [card.franchise, card.setName, card.cardNumber ? `#${card.cardNumber}` : "", card.condition].filter(Boolean).join(" / ");

                    return (
                      <li className="grid gap-2 border-b border-vault-border px-3 py-2 text-xs last:border-b-0" key={`${card.name}-${index}`}>
                        <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-start gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-vault-text">{card.name}</p>
                            {cardDetails ? <p className="mt-0.5 truncate text-vault-muted">{cardDetails}</p> : null}
                          </div>
                          <span className="shrink-0 font-semibold text-vault-text">{typeof card.marketPriceCents === "number" && card.marketPriceCents > 0 ? formatCurrency(card.marketPriceCents) : "Review"}</span>
                          <span className="shrink-0 text-vault-muted">{cardStatus}</span>
                        </div>
                        {card.catalogCandidates && card.catalogCandidates.length > 0 ? (
                          <button
                            className="w-fit font-semibold text-vault-gold hover:text-vault-highlight"
                            onClick={() => {
                              setEditingMatchIndex(editingMatchIndex === index ? null : index);
                              setMatchSearchQuery(card.name);
                              setMatchSearchResults(card.catalogCandidates ?? []);
                              setMatchCorrectionError("");
                            }}
                            type="button"
                          >
                            Change match
                          </button>
                        ) : null}
                        {editingMatchIndex === index ? (
                          <div className="mt-1 grid gap-2 border-t border-vault-border pt-2">
                            <div className="flex gap-2">
                              <input
                                className="min-h-10 min-w-0 flex-1 rounded-lg border border-vault-border bg-vault-card px-3 py-2 text-xs text-vault-text outline-none placeholder:text-vault-muted focus:border-vault-gold"
                                onChange={(event) => setMatchSearchQuery(event.target.value)}
                                onKeyDown={(event) => {
                                  if (event.key === "Enter") {
                                    event.preventDefault();
                                    void searchCatalogMatches();
                                  }
                                }}
                                placeholder="Search catalog"
                                value={matchSearchQuery}
                              />
                              <button className="rounded-lg border border-vault-border px-3 py-2 font-semibold text-vault-text hover:border-vault-gold" disabled={isSearchingMatches} onClick={() => void searchCatalogMatches()} type="button">
                                {isSearchingMatches ? "..." : "Search"}
                              </button>
                            </div>
                            {matchCorrectionError ? <p className="text-vault-error">{matchCorrectionError}</p> : null}
                            {matchSearchResults.length > 0 ? (
                              <ul className="grid gap-1">
                                {matchSearchResults.map((candidate) => (
                                  <li key={candidate.id}>
                                    <button
                                      className="grid w-full gap-1 rounded-lg border border-vault-border bg-vault-card px-3 py-2 text-left hover:border-vault-gold"
                                      disabled={isCorrectingMatch}
                                      onClick={() => void applyCatalogMatch(index, candidate)}
                                      type="button"
                                    >
                                      <span className="font-semibold text-vault-text">{candidate.name}</span>
                                      {candidateMeta(candidate) ? <span className="text-vault-muted">{candidateMeta(candidate)}</span> : null}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            ) : null}
                          </div>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}

            <div className="grid gap-2 border-t border-vault-border pt-3">
              <details className="rounded-xl border border-vault-border bg-vault-secondary p-3 text-xs leading-5 text-vault-secondaryText">
                <summary className="cursor-pointer font-semibold text-vault-text">How we calculate offers</summary>
                <p className="mt-2">Our offer is below estimated market value because we take on the work and risk of verifying condition, processing inventory, listing cards, paying marketplace and payment fees, shipping, handling customer issues, and waiting for the cards to sell. Trade credit pays more than cash because it keeps value in the shop.</p>
              </details>
              <details className="rounded-xl border border-vault-border bg-vault-secondary p-3 text-xs leading-5 text-vault-secondaryText">
                <summary className="cursor-pointer font-semibold text-vault-text">Offer percentage tiers</summary>
                <ul className="mt-2 grid gap-1">
                  {sellTradeOfferTiers.map((tier) => (
                    <li className="flex justify-between gap-3" key={tier.label}>
                      <span>{tier.label}</span>
                      <span className="shrink-0 text-vault-muted">Cash {formatRate(tier.cashRate)} / Trade {formatRate(tier.tradeRate)}</span>
                    </li>
                  ))}
                </ul>
              </details>
              <details className="rounded-xl border border-vault-border bg-vault-secondary p-3 text-xs leading-5 text-vault-secondaryText">
                <summary className="cursor-pointer font-semibold text-vault-text">What happens next</summary>
                <ol className="mt-2 grid gap-1 pl-4 [list-style:decimal]">
                  <li>Submit your contact details with the quote.</li>
                  <li>We confirm shipping, drop-off, or follow-up questions.</li>
                  <li>Fast payment or trade credit is issued after cards are received, verified, and approved.</li>
                </ol>
              </details>
            </div>
          </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
