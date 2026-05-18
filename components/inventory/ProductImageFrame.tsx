import { cn } from "@/lib/utils";

export function ProductImageFrame({
  src,
  alt,
  sold = false,
  priority = false,
  imageClassName,
  className
}: {
  src?: string;
  alt: string;
  sold?: boolean;
  priority?: boolean;
  imageClassName?: string;
  className?: string;
}) {
  return (
    <div className={cn("product-image-frame relative overflow-hidden rounded-2xl border border-vault-border", className)}>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_34%,rgba(214,168,79,0.08))]" />
      <div className="pointer-events-none absolute inset-x-8 top-8 h-32 rounded-full bg-vault-gold/10 blur-2xl" />
      {src ? (
        <img
          alt={alt}
          className={cn(
            "absolute inset-0 h-full w-full object-contain p-5 transition duration-500 group-hover:scale-105",
            sold && "opacity-45 grayscale",
            imageClassName
          )}
          src={src}
          loading={priority ? "eager" : "lazy"}
        />
      ) : (
        <div className="relative grid h-full min-h-72 place-items-center p-8 text-center">
          <div>
            <p className="text-sm font-semibold text-vault-gold">Rockin Rare</p>
            <p className="mt-2 text-lg font-black text-vault-text">{alt}</p>
            <p className="mt-2 text-xs text-vault-muted">Product image pending</p>
          </div>
        </div>
      )}
    </div>
  );
}
