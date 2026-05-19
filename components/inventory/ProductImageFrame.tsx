"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function ProductImageFrame({
  src,
  alt,
  sold = false,
  priority = false,
  fit = "contain",
  padded = true,
  imageClassName,
  className
}: {
  src?: string;
  alt: string;
  sold?: boolean;
  priority?: boolean;
  fit?: "contain" | "cover";
  padded?: boolean;
  imageClassName?: string;
  className?: string;
}) {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(src ? "loading" : "error");
  const isLoading = Boolean(src) && status === "loading";
  const hasError = !src || status === "error";

  useEffect(() => {
    setStatus(src ? "loading" : "error");
  }, [src]);

  useEffect(() => {
    const image = imageRef.current;
    if (!image || !src) return;

    const syncImageStatus = () => {
      setStatus(image.naturalWidth > 0 ? "loaded" : "error");
    };

    if (image.complete) {
      syncImageStatus();
      return;
    }

    image.addEventListener("load", syncImageStatus);
    image.addEventListener("error", syncImageStatus);

    return () => {
      image.removeEventListener("load", syncImageStatus);
      image.removeEventListener("error", syncImageStatus);
    };
  }, [src]);

  return (
    <div className={cn("product-image-frame relative overflow-hidden rounded-2xl border border-vault-border", className)}>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_34%,rgba(214,168,79,0.08))]" />
      <div className="pointer-events-none absolute inset-x-8 top-8 h-32 rounded-full bg-vault-gold/10 blur-2xl" />
      {isLoading ? (
        <div aria-hidden="true" className="absolute inset-0 grid place-items-center">
          <div className="h-3/4 w-3/5 animate-pulse rounded-lg border border-vault-border/70 bg-vault-bg/35 shadow-[0_16px_32px_rgba(0,0,0,0.22)]" />
        </div>
      ) : null}
      {src ? (
        <img
          alt={alt}
          ref={imageRef}
          className={cn(
            "absolute inset-0 h-full w-full text-transparent transition duration-500",
            status === "loaded" && "group-hover:scale-105",
            fit === "cover" ? "object-cover" : "object-contain",
            padded && "p-5",
            sold && status === "loaded" && "grayscale",
            imageClassName
          )}
          src={src}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          loading={priority ? "eager" : "lazy"}
          onError={() => setStatus("error")}
          onLoad={() => setStatus("loaded")}
          style={{ opacity: status === "loaded" ? (sold ? 0.45 : 1) : 0 }}
        />
      ) : null}
      {hasError ? (
        <div className="relative grid h-full place-items-center p-6 text-center">
          <div>
            <p className="text-sm font-semibold text-vault-gold">Rockin Rare</p>
            <p className="mt-2 text-base font-black text-vault-text">{alt}</p>
            <p className="mt-2 text-xs text-vault-muted">Photo unavailable</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
