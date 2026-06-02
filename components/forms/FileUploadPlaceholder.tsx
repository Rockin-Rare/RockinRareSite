"use client";

import { useEffect, useState } from "react";
import { compressImageFiles } from "@/lib/browser-image-compression";
import { createId } from "@/lib/id";
import { sellTradeMaxPhotoSizeMb, sellTradeMaxPhotos } from "@/lib/sell-trade-upload-limits";

type PhonePhoto = {
  id: string;
  name: string;
  size: number;
};

function formatFileSize(size: number) {
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export function FileUploadPlaceholder({
  files,
  helpText,
  onFilesSelected,
  onPhonePhotoCountChange,
  onSessionChange,
  title = "Photos"
}: {
  files: File[];
  helpText?: string;
  onFilesSelected: (files: File[]) => void;
  onPhonePhotoCountChange?: (count: number) => void;
  onSessionChange?: (sessionId: string) => void;
  title?: string;
}) {
  const [mode, setMode] = useState<"computer" | "phone">("computer");
  const [photoSession, setPhotoSession] = useState("");
  const [phonePhotos, setPhonePhotos] = useState<PhonePhoto[]>([]);
  const [uploadUrl, setUploadUrl] = useState("");
  const [isPreparingPhotos, setIsPreparingPhotos] = useState(false);

  useEffect(() => {
    const session = createId();
    setPhotoSession(session);
    onSessionChange?.(session);
    setUploadUrl(`${window.location.origin}/sell-trade/photos/${session}`);
  }, [onSessionChange]);

  useEffect(() => {
    if (!photoSession || mode !== "phone") return;

    async function pollPhonePhotos() {
      const response = await fetch(`/api/sell-trade/photos?session=${encodeURIComponent(photoSession)}`);
      const result = (await response.json().catch(() => ({}))) as { photos?: PhonePhoto[] };
      const nextPhotos = result.photos ?? [];
      setPhonePhotos(nextPhotos);
      onPhonePhotoCountChange?.(nextPhotos.length);
    }

    pollPhonePhotos();
    const intervalId = window.setInterval(pollPhonePhotos, 3000);

    return () => window.clearInterval(intervalId);
  }, [mode, onPhonePhotoCountChange, photoSession]);

  const qrCodeUrl = uploadUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=12&data=${encodeURIComponent(uploadUrl)}`
    : "";

  async function handleFilesSelected(selectedFiles: FileList | null) {
    setIsPreparingPhotos(true);

    try {
      onFilesSelected(await compressImageFiles(Array.from(selectedFiles ?? []).slice(0, sellTradeMaxPhotos)));
    } finally {
      setIsPreparingPhotos(false);
    }
  }

  return (
    <div className="grid gap-3 border-t border-vault-border pt-4">
      <input name="photoSession" type="hidden" value={photoSession} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-vault-text">{title}</p>
          {helpText ? <p className="mt-1 text-sm leading-6 text-vault-secondaryText">{helpText}</p> : null}
        </div>
        <div className="inline-flex rounded-xl border border-vault-border bg-vault-secondary p-1">
          <button
            className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
              mode === "computer" ? "bg-vault-gold text-[#111318]" : "text-vault-secondaryText hover:text-vault-highlight"
            }`}
            onClick={() => setMode("computer")}
            type="button"
          >
            Computer
          </button>
          <button
            className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
              mode === "phone" ? "bg-vault-gold text-[#111318]" : "text-vault-secondaryText hover:text-vault-highlight"
            }`}
            onClick={() => setMode("phone")}
            type="button"
          >
            Phone QR
          </button>
        </div>
      </div>

      {mode === "computer" ? (
        <label className="grid cursor-pointer gap-3 rounded-xl border border-dashed border-vault-border bg-vault-secondary p-5 text-center transition hover:border-vault-gold">
          <span className="text-sm font-semibold text-vault-text">Choose photos</span>
          <span className="text-sm text-vault-secondaryText">JPG, PNG, WebP, GIF, HEIC, or HEIF. Up to {sellTradeMaxPhotos} photos, {sellTradeMaxPhotoSizeMb} MB each.</span>
          {isPreparingPhotos ? <span className="text-xs font-semibold uppercase text-vault-gold">Preparing photos...</span> : null}
          <input
            accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif"
            className="sr-only"
            multiple
            name="photos"
            onChange={(event) => void handleFilesSelected(event.target.files)}
            type="file"
          />
        </label>
      ) : (
        <div className="grid gap-4 rounded-xl border border-vault-border bg-vault-secondary p-5 sm:grid-cols-[auto_1fr] sm:items-center">
          {qrCodeUrl ? (
            <img alt="Sell trade upload QR code" className="h-[180px] w-[180px] rounded-lg bg-white p-2" height={180} src={qrCodeUrl} width={180} />
          ) : (
            <div className="h-[180px] w-[180px] rounded-lg bg-vault-elevated" />
          )}
          <div>
            <p className="text-sm font-semibold text-vault-text">Scan to add photos from your phone</p>
            <p className="mt-2 text-sm leading-6 text-vault-secondaryText">The QR opens a photo-only upload page. Photos added there will appear here automatically.</p>
          </div>
        </div>
      )}

      {files.length > 0 || phonePhotos.length > 0 ? (
        <div className="grid gap-2 rounded-xl border border-vault-border bg-vault-secondary p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-semibold uppercase text-vault-gold">{files.length + phonePhotos.length} selected</span>
            <button className="text-xs font-semibold text-vault-secondaryText hover:text-vault-highlight" onClick={() => onFilesSelected([])} type="button">
              Clear computer photos
            </button>
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
    </div>
  );
}
