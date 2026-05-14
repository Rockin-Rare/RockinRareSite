import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  children,
  tone = "neutral",
  className
}: {
  children: ReactNode;
  tone?: "gold" | "green" | "gray" | "neutral" | "red";
  className?: string;
}) {
  const tones = {
    gold: "border-vault-gold/40 bg-vault-gold/12 text-vault-highlight",
    green: "border-vault-success/30 bg-vault-success/10 text-vault-success",
    gray: "border-vault-sold/40 bg-vault-sold/12 text-vault-secondaryText",
    neutral: "border-vault-border bg-vault-elevated text-vault-secondaryText",
    red: "border-vault-error/30 bg-vault-error/10 text-vault-error"
  };

  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold", tones[tone], className)}>
      {children}
    </span>
  );
}
