"use client";

import { FormEvent, useState } from "react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { compressImageFiles } from "@/lib/browser-image-compression";
import { sellTradeMaxPhotos } from "@/lib/sell-trade-upload-limits";

type UploadedPhoto = {
  id: string;
  name: string;
  size: number;
};

function formatFileSize(size: number) {
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export function PhonePhotoUpload({ sessionId }: { sessionId: string }) {
  const [files, setFiles] = useState<File[]>([]);
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [error, setError] = useState("");
  const [isPreparingPhotos, setIsPreparingPhotos] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFilesSelected(selectedFiles: FileList | null) {
    setError("");
    setIsPreparingPhotos(true);

    try {
      setFiles(await compressImageFiles(Array.from(selectedFiles ?? []).slice(0, sellTradeMaxPhotos)));
    } finally {
      setIsPreparingPhotos(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (files.length === 0) {
      setError("Choose at least one photo.");
      return;
    }

    const payload = new FormData();
    files.forEach((file) => payload.append("photos", file));
    setIsUploading(true);

    try {
      const response = await fetch(`/api/sell-trade/photos?session=${encodeURIComponent(sessionId)}`, {
        method: "POST",
        body: payload
      });
      const result = (await response.json().catch(() => ({}))) as { error?: string; photos?: UploadedPhoto[] };

      if (!response.ok) {
        throw new Error(result.error || "Unable to upload photos.");
      }

      setPhotos(result.photos ?? []);
      setFiles([]);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Unable to upload photos.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Container className="grid min-h-[70vh] content-center py-10">
      <form className="mx-auto grid w-full max-w-xl gap-5 rounded-2xl border border-vault-border bg-vault-card p-5 shadow-vault" onSubmit={handleSubmit}>
        <div>
          <p className="text-sm font-semibold uppercase text-vault-gold">Phone Upload</p>
          <h1 className="mt-2 text-3xl font-black text-vault-text">Add collection photos</h1>
          <p className="mt-3 text-sm leading-6 text-vault-secondaryText">Take or choose photos here. They will appear on the Sell / Trade form open on your computer.</p>
        </div>

        <label className="grid cursor-pointer gap-3 rounded-xl border border-dashed border-vault-border bg-vault-secondary p-5 text-center transition hover:border-vault-gold">
          <span className="text-sm font-semibold text-vault-text">Choose or take photos</span>
          <span className="text-sm text-vault-secondaryText">Up to {sellTradeMaxPhotos} photos. JPG, PNG, WebP, GIF, HEIC, or HEIF.</span>
          <input
            accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif"
            className="sr-only"
            multiple
            onChange={(event) => void handleFilesSelected(event.target.files)}
            type="file"
          />
        </label>

        {files.length > 0 ? (
          <ul className="grid gap-1 rounded-xl border border-vault-border bg-vault-secondary p-4 text-xs text-vault-secondaryText">
            {files.map((file) => (
              <li className="flex justify-between gap-3" key={`${file.name}-${file.size}`}>
                <span className="truncate">{file.name}</span>
                <span className="shrink-0 text-vault-muted">{formatFileSize(file.size)}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {photos.length > 0 ? (
          <div className="rounded-xl border border-vault-success/30 bg-vault-success/10 p-4">
            <p className="text-sm font-semibold text-vault-text">{photos.length} phone photo{photos.length === 1 ? "" : "s"} added</p>
            <p className="mt-1 text-xs text-vault-secondaryText">You can return to the computer form and submit when ready.</p>
          </div>
        ) : null}

        {error ? (
          <p className="rounded-xl border border-vault-error/30 bg-vault-error/10 px-4 py-3 text-sm text-vault-error" role="alert">
            {error}
          </p>
        ) : null}

        <Button disabled={isPreparingPhotos || isUploading} type="submit">
          {isPreparingPhotos ? "Preparing Photos..." : isUploading ? "Uploading..." : "Add Photos"}
        </Button>
      </form>
    </Container>
  );
}
