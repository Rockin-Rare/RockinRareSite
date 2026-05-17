"use client";

import { useEffect, useState } from "react";
import { createId } from "@/lib/id";

type PhonePhoto = {
  id: string;
  name: string;
  size: number;
};

const maxFiles = 8;
const maxFileSizeMb = 8;

function formatFileSize(size: number) {
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export function FileUploadPlaceholder({
  files,
  onFilesSelected
}: {
  files: File[];
  onFilesSelected: (files: File[]) => void;
}) {
  const [mode, setMode] = useState<"computer" | "phone">("computer");
  const [photoSession, setPhotoSession] = useState("");
  const [phonePhotos, setPhonePhotos] = useState<PhonePhoto[]>([]);
  const [uploadUrl, setUploadUrl] = useState("");

  useEffect(() => {
    const session = createId();
    setPhotoSession(session);
    setUploadUrl(`${window.location.origin}/sell-trade/photos/${session}`);
  }, []);

  useEffect(() => {
    if (!photoSession) return;

    async function pollPhonePhotos() {
      const response = await fetch(`/api/sell-trade/photos?session=${encodeURIComponent(photoSession)}`);
      const result = (await response.json().catch(() => ({}))) as { photos?: PhonePhoto[] };
      setPhonePhotos(result.photos ?? []);
    }

    pollPhonePhotos();
    const intervalId = window.setInterval(pollPhonePhotos, 3000);

    return () => window.clearInterval(intervalId);
  }, [photoSession]);

  const qrCodeUrl = uploadUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=12&data=${encodeURIComponent(uploadUrl)}`
    : "";

  return (
    <div className="grid gap-3 rounded-2xl border border-vault-border bg-vault-secondary p-5">
      <input name="photoSession" type="hidden" value={photoSession} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm font-semibold text-vault-text">Photos</span>
        <div className="inline-flex rounded-xl border border-vault-border bg-vault-card p-1">
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
        <label className="grid cursor-pointer gap-3 rounded-xl border border-dashed border-vault-border bg-vault-card p-5 text-center transition hover:border-vault-gold">
          <span className="text-sm font-semibold text-vault-text">Choose photos</span>
          <span className="text-sm text-vault-secondaryText">JPG, PNG, WebP, GIF, HEIC, or HEIF. Up to {maxFiles} photos, {maxFileSizeMb} MB each.</span>
          <input
            accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif"
            className="sr-only"
            multiple
            name="photos"
            onChange={(event) => onFilesSelected(Array.from(event.target.files ?? []).slice(0, maxFiles))}
            type="file"
          />
        </label>
      ) : (
        <div className="grid gap-4 rounded-xl border border-vault-border bg-vault-card p-5 sm:grid-cols-[auto_1fr] sm:items-center">
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
        <div className="grid gap-2 rounded-xl border border-vault-border bg-vault-card p-4">
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
                <span className="truncate">{photo.name} · phone</span>
                <span className="shrink-0 text-vault-muted">{formatFileSize(photo.size)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
