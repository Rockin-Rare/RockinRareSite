import type { Metadata } from "next";
import { PhonePhotoUpload } from "@/components/forms/PhonePhotoUpload";

export const metadata: Metadata = {
  title: "Upload Collection Photos | Rockin Rare Collectibles",
  description: "Add collection photos from your phone to a Rockin Rare Collectibles sell or trade submission."
};

export default async function SellTradePhonePhotosPage({
  params
}: {
  params: Promise<{ session: string }>;
}) {
  const { session } = await params;

  return <PhonePhotoUpload sessionId={session} />;
}
