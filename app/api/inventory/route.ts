import { NextRequest, NextResponse } from "next/server";
import { getCurrentCollectorClubEntitlement } from "@/lib/collector-club/current";
import { parseInventoryQuery } from "@/lib/inventory-query";
import { getPublishedProductPageForEntitlement } from "@/lib/products";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const entitlement = await getCurrentCollectorClubEntitlement();
  const query = parseInventoryQuery(request.nextUrl.searchParams);
  const page = await getPublishedProductPageForEntitlement(entitlement, query);

  return NextResponse.json(page);
}
