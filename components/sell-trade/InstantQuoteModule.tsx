"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { compressImageFile, compressImageFiles } from "@/lib/browser-image-compression";
import { createId } from "@/lib/id";
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
};

type PhonePhoto = {
  id: string;
  name: string;
  size: number;
};

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", { currency: "USD", style: "currency" }).format(cents / 100);
}

function formatFileSize(size: number) {
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
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
  onChange
}: InstantQuoteModuleProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [files, setFiles] = useState<File[]>([]);
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
    if (!video || !video.videoWidth || !video.videoHeight) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const file = dataUrlToFile(canvas.toDataURL("image/jpeg", 0.88), `seller-scan-${Date.now()}.jpg`);
    updateFiles([...files, await compressImageFile(file)].slice(0, sellTradeMaxPhotos));
  }

  async function requestQuote() {
    setQuoteError("");

    if (selectedPhotoCount === 0) {
      setQuoteError("Add at least one card photo first.");
      return;
    }

    const payload = new FormData();
    payload.append("franchise", franchise);
    payload.append("approximateQuantity", approximateQuantity);
    payload.append("conditionEstimate", conditionEstimate);
    payload.append("description", description);
    payload.append("photoSession", photoSession);
    files.forEach((file) => payload.append("photos", file));

    setIsQuoting(true);

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

    setMatchCorrectionError("");
    setIsCorrectingMatch(true);

    try {
      const cardReferenceIds = quote.detectedCards
        .map((card, cardIndex) => (cardIndex === index ? candidate.id : card.cardReferenceId))
        .filter((id): id is string => Boolean(id));
      const response = await fetch("/api/sell-trade/quote/corrections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardReferenceIds, conditionEstimate })
      });
      const result = (await response.json().catch(() => ({}))) as { quote?: SellTradeQuote; error?: string };
      if (!response.ok || !result.quote) throw new Error(result.error || "Unable to update quote.");

      setQuote(result.quote);
      setEditingMatchIndex(null);
      setMatchSearchQuery("");
      setMatchSearchResults([]);
    } catch (error) {
      setMatchCorrectionError(error instanceof Error ? error.message : "Unable to update quote.");
    } finally {
      setIsCorrectingMatch(false);
    }
  }

  function candidateMeta(candidate: Pick<SellTradeQuoteCatalogCandidate, "franchise" | "setName" | "cardNumber" | "variant">) {
    return [candidate.franchise, candidate.setName, candidate.cardNumber ? `#${candidate.cardNumber}` : "", candidate.variant].filter(Boolean).join(" / ");
  }

  return (
    <section className="grid min-w-0 content-start gap-4 rounded-2xl border border-vault-border bg-vault-card p-5 shadow-vault">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase text-vault-gold">Step 1</p>
          <h2 className="mt-2 text-2xl font-black text-vault-text">Get an instant quote</h2>
        </div>
        <span className="rounded-full border border-vault-gold/30 bg-vault-gold/10 px-3 py-1 text-xs font-semibold uppercase text-vault-gold">
          {selectedPhotoCount}/{sellTradeMaxPhotos} front photos
        </span>
      </div>
      <p className="min-w-0 break-words border-l-2 border-vault-gold/50 pl-3 text-sm leading-6 text-vault-secondaryText">
        Instant quotes are for raw singles only. Slabs, sealed product, bulk, binders, and full collections can be uploaded with your details in Step 2.
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

      <div className={`grid min-w-0 gap-4 ${quote ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]" : ""}`}>
        <div className="grid min-w-0 gap-3">
          {mode === "camera" ? (
            <>
              <div className={`${cameraActive ? "aspect-[4/3]" : "min-h-[220px]"} overflow-hidden rounded-xl border border-vault-border bg-vault-card`}>
                <video ref={videoRef} className={cameraActive ? "h-full w-full object-cover" : "hidden"} muted playsInline />
                {!cameraActive ? (
                  <div className="grid h-full place-items-center px-5 text-center text-sm leading-6 text-vault-secondaryText">
                    Open the camera and capture front photos only.
                  </div>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                {cameraActive ? (
                  <>
                    <Button onClick={captureFrame} type="button">
                      Capture Front Photo
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
              <span className="text-sm font-semibold text-vault-text">Choose front photos</span>
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
            <div className="grid justify-items-center gap-4 rounded-xl border border-vault-border bg-vault-card p-5 text-center 2xl:grid-cols-[auto_minmax(0,1fr)] 2xl:items-center 2xl:justify-items-start 2xl:text-left">
              {uploadUrl ? (
                <img alt="Sell trade upload QR code" className="h-[168px] w-[168px] rounded-lg bg-white p-2 sm:h-[180px] sm:w-[180px]" height={180} src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=12&data=${encodeURIComponent(uploadUrl)}`} width={180} />
              ) : (
                <div className="h-[168px] w-[168px] rounded-lg bg-vault-elevated sm:h-[180px] sm:w-[180px]" />
              )}
              <div className="min-w-0 max-w-sm">
                <p className="text-sm font-semibold text-vault-text">Scan to add front photos from your phone</p>
                <p className="mt-2 text-sm leading-6 text-vault-secondaryText">The QR opens a photo-only upload page. Photos added there will appear here automatically.</p>
              </div>
            </div>
          ) : null}

          {cameraError ? <p className="text-sm text-vault-error">{cameraError}</p> : null}

          {selectedPhotoCount > 0 ? (
            <div className="grid gap-2 rounded-xl border border-vault-border bg-vault-card p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase text-vault-gold">{selectedPhotoCount} selected</span>
                {files.length > 0 ? (
                  <button className="text-xs font-semibold text-vault-secondaryText hover:text-vault-highlight" onClick={() => updateFiles([])} type="button">
                    Clear computer photos
                  </button>
                ) : null}
              </div>
              <ul className="grid gap-1 text-xs text-vault-secondaryText">
                {files.map((file) => (
                  <li className="flex justify-between gap-3" key={`${file.name}-${file.size}`}>
                    <span className="truncate">{file.name}</span>
                    <span className="shrink-0 text-vault-muted">{formatFileSize(file.size)}</span>
                  </li>
                ))}
                {phonePhotos.map((photo) => (
                  <li className="flex justify-between gap-3" key={photo.id}>
                    <span className="truncate">{photo.name} - phone</span>
                    <span className="shrink-0 text-vault-muted">{formatFileSize(photo.size)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3 border-t border-vault-border pt-3">
            <Button
              className="w-full disabled:border-vault-border disabled:bg-vault-secondary/70 disabled:text-vault-muted disabled:shadow-none"
              disabled={isPreparingPhotos || isQuoting || selectedPhotoCount === 0}
              onClick={requestQuote}
              type="button"
            >
              {isPreparingPhotos ? "Preparing Photos..." : isQuoting ? "Scanning..." : "Get Instant Quote"}
            </Button>
            {quoteError ? <p className="text-sm text-vault-error">{quoteError}</p> : null}
          </div>
        </div>

        {quote ? (
          <div className="grid content-start gap-3 rounded-xl border border-vault-border bg-vault-card p-4" role="status">
            <div className="grid grid-cols-2 gap-2">
              <div className="grid content-start rounded-xl border border-vault-border bg-vault-secondary p-3">
                <p className="min-h-8 text-xs font-semibold uppercase leading-4 text-vault-muted">Cash offer</p>
                <p className="text-xl font-black text-vault-text">{formatCurrency(quote.cashOfferCents)}</p>
              </div>
              <div className="grid content-start rounded-xl border border-vault-border bg-vault-secondary p-3">
                <p className="min-h-8 text-xs font-semibold uppercase leading-4 text-vault-muted">Trade credit</p>
                <p className="text-xl font-black text-vault-text">{formatCurrency(quote.tradeCreditCents)}</p>
              </div>
            </div>
            {quote.detectedCards.length > 0 ? (
              <div className="grid gap-2 border-t border-vault-border pt-3">
                <p className="text-xs font-semibold uppercase text-vault-gold">Matched cards</p>
                <ul className="grid gap-2">
                  {quote.detectedCards.map((card, index) => (
                    <li className="grid gap-1 rounded-lg border border-vault-border bg-vault-secondary px-3 py-2 text-xs" key={`${card.name}-${index}`}>
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-semibold text-vault-text">{card.name}</span>
                        {card.catalogCandidates && card.catalogCandidates.length > 0 ? (
                          <button
                            className="shrink-0 font-semibold text-vault-gold hover:text-vault-highlight"
                            onClick={() => {
                              setEditingMatchIndex(editingMatchIndex === index ? null : index);
                              setMatchSearchQuery(card.name);
                              setMatchSearchResults(card.catalogCandidates ?? []);
                              setMatchCorrectionError("");
                            }}
                            type="button"
                          >
                            Change
                          </button>
                        ) : null}
                      </div>
                      <span className="text-vault-muted">
                        {[card.franchise, card.setName, card.cardNumber ? `#${card.cardNumber}` : "", card.condition, typeof card.confidence === "number" ? `${Math.round(card.confidence * 100)}% match` : ""].filter(Boolean).join(" / ")}
                      </span>
                      {editingMatchIndex === index ? (
                        <div className="mt-2 grid gap-2 border-t border-vault-border pt-2">
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
                  ))}
                </ul>
              </div>
            ) : null}
            {quote.source === "site-estimate" ? <p className="text-xs leading-5 text-vault-muted">Preliminary site estimate until the scan is confirmed.</p> : null}
            <a
              className="mt-1 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-vault-gold px-4 py-3 text-sm font-semibold text-[#111318] shadow-vault transition hover:-translate-y-0.5 hover:bg-vault-highlight"
              href="#sell-trade-details"
            >
              Continue with this quote
            </a>
            <p className="text-xs leading-5 text-vault-muted">You can choose cash payout, trade credit, or decide after final review in Step 2.</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
