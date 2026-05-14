import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("vault-panel rounded-2xl p-6", className)}>{children}</div>;
}
