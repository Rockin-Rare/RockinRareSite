"use client";

import { FormEvent, useEffect, useState } from "react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { compressImageFiles } from "@/lib/browser-image-compression";
import { sellTradeMaxPhotos } from "@/lib/sell-trade-upload-limits";

type UploadedPhoto = {
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

function uploadedPhotoPreviewUrl(sessionId: string, photoId: string) {
  return `/api/sell-trade/photos?session=${encodeURIComponent(sessionId)}&photo=${encodeURIComponent(photoId)}`;
}

export function PhonePhotoUpload({ sessionId }: { sessionId: string }) {
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<FilePreview[]>([]);
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [error, setError] = useState("");
  const [isPreparingPhotos, setIsPreparingPhotos] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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

  function removeFile(indexToRemove: number) {
    setFiles((currentFiles) => currentFiles.filter((_, index) => index !== indexToRemove));
  }

  async function removeUploadedPhoto(photoId: string) {
    setError("");

    try {
      const query = new URLSearchParams({ session: sessionId, photo: photoId });
      const response = await fetch(`/api/sell-trade/photos?${query.toString()}`, { method: "DELETE" });
      const result = (await response.json().catch(() => ({}))) as { error?: string; photos?: UploadedPhoto[] };
      if (!response.ok) throw new Error(result.error || "Unable to remove photo.");

      setPhotos(result.photos ?? []);
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Unable to remove photo.");
    }
  }

  async function handleFilesSelected(selectedFiles: FileList | null) {
    setError("");
    const incomingFiles = Array.from(selectedFiles ?? []);
    if (incomingFiles.length === 0) return;

    setIsPreparingPhotos(true);

    try {
      const compressedFiles = await compressImageFiles(incomingFiles);
      setFiles((currentFiles) => {
        const remainingSlots = Math.max(0, sellTradeMaxPhotos - currentFiles.length);
        const nextFiles = [...currentFiles, ...compressedFiles.slice(0, remainingSlots)];

        if (compressedFiles.length > remainingSlots) {
          setError(`You can add up to ${sellTradeMaxPhotos} photos before uploading.`);
        }

        return nextFiles;
      });
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
            onChange={(event) => {
              const input = event.currentTarget;
              void handleFilesSelected(input.files).finally(() => {
                input.value = "";
              });
            }}
            type="file"
          />
        </label>

        {files.length > 0 ? (
          <div className="grid gap-3 rounded-xl border border-vault-border bg-vault-secondary p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase text-vault-gold">
                {files.length}/{sellTradeMaxPhotos} ready to upload
              </span>
              <button className="text-xs font-semibold text-vault-secondaryText hover:text-vault-highlight" onClick={() => setFiles([])} type="button">
                Clear
              </button>
            </div>
            <ul className="grid grid-cols-2 gap-3">
              {filePreviews.map((preview, index) => (
                <li className="overflow-hidden rounded-lg border border-vault-border bg-vault-card" key={preview.key}>
                  <img alt={`Selected card photo ${index + 1}`} className="aspect-[5/7] w-full bg-vault-secondary object-cover" src={preview.url} />
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
          </div>
        ) : null}

        {photos.length > 0 ? (
          <div className="grid gap-3 rounded-xl border border-vault-success/30 bg-vault-success/10 p-4">
            <div>
              <p className="text-sm font-semibold text-vault-text">{photos.length} phone photo{photos.length === 1 ? "" : "s"} added</p>
              <p className="mt-1 text-xs text-vault-secondaryText">Review these before returning to the computer form.</p>
            </div>
            <ul className="grid grid-cols-2 gap-3">
              {photos.map((photo, index) => (
                <li className="overflow-hidden rounded-lg border border-vault-success/20 bg-vault-card" key={photo.id}>
                  <img alt={`Uploaded phone photo ${index + 1}`} className="aspect-[5/7] w-full bg-vault-secondary object-cover" src={uploadedPhotoPreviewUrl(sessionId, photo.id)} />
                  <div className="grid gap-2 p-2">
                    <div className="min-w-0 text-xs text-vault-secondaryText">
                      <p className="truncate">{photo.name}</p>
                      <p className="text-vault-muted">{formatFileSize(photo.size)}</p>
                    </div>
                    <button className="rounded-lg border border-vault-border px-2 py-1 text-xs font-semibold text-vault-secondaryText hover:border-vault-gold hover:text-vault-highlight" onClick={() => void removeUploadedPhoto(photo.id)} type="button">
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {error ? (
          <p className="rounded-xl border border-vault-error/30 bg-vault-error/10 px-4 py-3 text-sm text-vault-error" role="alert">
            {error}
          </p>
        ) : null}

        <Button disabled={files.length === 0 || isPreparingPhotos || isUploading} type="submit">
          {isPreparingPhotos ? "Preparing Photos..." : isUploading ? "Uploading..." : "Add Photos"}
        </Button>
      </form>
    </Container>
  );
}

