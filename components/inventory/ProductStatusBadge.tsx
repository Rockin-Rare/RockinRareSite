import { Badge } from "@/components/ui/Badge";
import type { PublicProductStatus } from "@/lib/types";
import { statusLabel } from "@/lib/utils";

export function ProductStatusBadge({ status }: { status: PublicProductStatus }) {
  const tone = status === "sold" ? "gray" : status === "coming_soon" ? "gold" : "green";
  return <Badge tone={tone}>{statusLabel(status)}</Badge>;
}
