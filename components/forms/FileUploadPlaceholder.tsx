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

type FilePreview = {
  key: string;
  name: string;
  size: number;
  url: string;
};

function formatFileSize(size: number) {
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function phonePhotoPreviewUrl(sessionId: string, photoId: string) {
  return `/api/sell-trade/photos?session=${encodeURIComponent(sessionId)}&photo=${encodeURIComponent(photoId)}`;
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
  const [filePreviews, setFilePreviews] = useState<FilePreview[]>([]);
  const [isDeletingPhonePhoto, setIsDeletingPhonePhoto] = useState(false);
  const [uploadUrl, setUploadUrl] = useState("");
  const [isPreparingPhotos, setIsPreparingPhotos] = useState(false);

  useEffect(() => {
    const session = createId();
    setPhotoSession(session);
    onSessionChange?.(session);
    setUploadUrl(`${window.location.origin}/sell-trade/photos/${session}`);
  }, [onSessionChange]);

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

  function removeFile(indexToRemove: number) {
    onFilesSelected(files.filter((_, index) => index !== indexToRemove));
  }

  async function deletePhonePhoto(photoId?: string) {
    if (!photoSession) return;

    setIsDeletingPhonePhoto(true);

    try {
      const query = new URLSearchParams({ session: photoSession });
      if (photoId) query.set("photo", photoId);

      const response = await fetch(`/api/sell-trade/photos?${query.toString()}`, { method: "DELETE" });
      const result = (await response.json().catch(() => ({}))) as { photos?: PhonePhoto[] };
      const nextPhotos = response.ok ? (result.photos ?? []) : phonePhotos;
      setPhonePhotos(nextPhotos);
      onPhonePhotoCountChange?.(nextPhotos.length);
    } finally {
      setIsDeletingPhonePhoto(false);
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
        <div className="grid justify-items-center gap-4 rounded-xl border border-vault-border bg-vault-secondary p-5 text-center md:grid-cols-[auto_minmax(0,1fr)] md:items-center md:justify-items-start md:text-left">
          {qrCodeUrl ? (
            <img alt="Sell trade upload QR code" className="h-[168px] w-[168px] rounded-lg bg-white p-2 sm:h-[180px] sm:w-[180px]" height={180} src={qrCodeUrl} width={180} />
          ) : (
            <div className="h-[168px] w-[168px] rounded-lg bg-vault-elevated sm:h-[180px] sm:w-[180px]" />
          )}
          <div className="min-w-0 max-w-sm">
            <p className="text-sm font-semibold text-vault-text">Scan to add photos from your phone</p>
            <p className="mt-2 text-sm leading-6 text-vault-secondaryText">The QR opens a photo-only upload page. Photos added there will appear here automatically.</p>
          </div>
        </div>
      )}

      {files.length > 0 || phonePhotos.length > 0 ? (
        <div className="grid gap-3 rounded-xl border border-vault-border bg-vault-secondary p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-semibold uppercase text-vault-gold">{files.length + phonePhotos.length} selected</span>
            <div className="flex flex-wrap justify-end gap-2">
              {files.length > 0 ? (
                <button className="text-xs font-semibold text-vault-secondaryText hover:text-vault-highlight" onClick={() => onFilesSelected([])} type="button">
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
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {filePreviews.map((preview, index) => (
                <li className="overflow-hidden rounded-lg border border-vault-border bg-vault-card" key={preview.key}>
                  <img alt={`Selected photo ${index + 1}`} className="aspect-[5/7] w-full bg-vault-secondary object-cover" src={preview.url} />
                  <div className="grid gap-2 p-2">
                    <div className="min-w-0 text-xs text-vault-secondaryText">
                      <p className="truncate">{preview.name}</p>
                      <p className="text-vault-muted">{formatFileSize(preview.size)}</p>
                    </div>
                    <button className="rounded-lg border border-vault-border px-2 py-1 text-xs font-semibold text-vault-secondaryText hover:border-vault-gold hover:text-vault-highlight" onClick={() => removeFile(index)} type="button">
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
          {phonePhotos.length > 0 ? (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {phonePhotos.map((photo, index) => (
                <li className="overflow-hidden rounded-lg border border-vault-border bg-vault-card" key={photo.id}>
                  <img alt={`Phone photo ${index + 1}`} className="aspect-[5/7] w-full bg-vault-secondary object-cover" src={phonePhotoPreviewUrl(photoSession, photo.id)} />
                  <div className="grid gap-2 p-2">
                    <div className="min-w-0 text-xs text-vault-secondaryText">
                      <p className="truncate">{photo.name}</p>
                      <p className="text-vault-muted">{formatFileSize(photo.size)}</p>
                    </div>
                    <button className="rounded-lg border border-vault-border px-2 py-1 text-xs font-semibold text-vault-secondaryText hover:border-vault-gold hover:text-vault-highlight disabled:text-vault-muted" disabled={isDeletingPhonePhoto} onClick={() => void deletePhonePhoto(photo.id)} type="button">
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

