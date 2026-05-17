import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  compact?: boolean;
  className?: string;
  mark?: "rock" | "gem";
};

const marks = {
  rock: {
    alt: "Rockin Rare Collectibles rock hand logo",
    frameClassName: "rounded-lg bg-black",
    imageClassName: "",
    src: "/brand/rockin-rare-logo.jpg"
  },
  gem: {
    alt: "Rockin Rare Collectibles gemstone badge",
    frameClassName: "rounded-full bg-vault-text",
    imageClassName: "",
    src: "/brand/rockin-rare-navbar-gem.jpg"
  }
};

export function BrandLogo({ compact = false, className, mark = "rock" }: BrandLogoProps) {
  const selectedMark = marks[mark];

  return (
    <span className={cn("flex items-center gap-3", className)}>
      <span
        className={cn(
          "relative shrink-0 overflow-hidden border border-vault-gold/35 shadow-gold",
          selectedMark.frameClassName,
          compact ? "h-10 w-10" : "h-12 w-12"
        )}
      >
        <Image
          alt={selectedMark.alt}
          className={cn("h-full w-full object-cover", selectedMark.imageClassName)}
          height={96}
          priority={!compact}
          src={selectedMark.src}
          width={96}
        />
      </span>
      <span className={cn("font-black text-vault-text", compact ? "text-sm" : "text-base sm:text-lg")}>
        Rockin Rare Collectibles
      </span>
    </span>
  );
}
