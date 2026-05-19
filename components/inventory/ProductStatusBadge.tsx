import { Badge } from "@/components/ui/Badge";
import type { PublicProductStatus } from "@/lib/types";
import { statusLabel } from "@/lib/utils";

export function ProductStatusBadge({ status, className }: { status: PublicProductStatus; className?: string }) {
  const tone = status === "sold" ? "gray" : status === "coming_soon" ? "gold" : "green";
  return (
    <Badge className={className} tone={tone}>
      {statusLabel(status)}
    </Badge>
  );
}
