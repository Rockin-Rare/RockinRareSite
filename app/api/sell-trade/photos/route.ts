import { NextResponse } from "next/server";
import { createId } from "@/lib/id";
import { sellTradeAllowedImageTypes, sellTradeMaxPhotoSizeBytes, sellTradeMaxPhotoSizeMb, sellTradeMaxPhotos, sellTradeMaxTotalPhotoSizeBytes, sellTradeMaxTotalPhotoSizeMb } from "@/lib/sell-trade-upload-limits";
import { clearPhotoSession, getPhotoSession, setPhotoSession, summarizePhotos, type StoredPhoto } from "@/lib/sell-trade-photo-sessions";

function getSessionId(request: Request) {
  return new URL(request.url).searchParams.get("session")?.trim() ?? "";
}

function getPhotoId(request: Request) {
  return new URL(request.url).searchParams.get("photo")?.trim() ?? "";
}

function isValidSessionId(sessionId: string) {
  return /^[a-zA-Z0-9-]{16,80}$/.test(sessionId);
}

function validateFiles(files: File[]) {
  let totalSize = 0;

  for (const file of files) {
    totalSize += file.size;

    if (!sellTradeAllowedImageTypes.has(file.type)) {
      return "Photos must be JPG, PNG, WebP, GIF, HEIC, or HEIF images.";
    }

    if (file.size > sellTradeMaxPhotoSizeBytes) {
      return `Each photo must be ${sellTradeMaxPhotoSizeMb} MB or smaller.`;
    }
  }

  if (totalSize > sellTradeMaxTotalPhotoSizeBytes) {
    return `Photo uploads must be ${sellTradeMaxTotalPhotoSizeMb} MB total or smaller.`;
  }

  return "";
}

export async function GET(request: Request) {
  const sessionId = getSessionId(request);

  if (!isValidSessionId(sessionId)) {
    return NextResponse.json({ error: "Invalid photo session." }, { status: 400 });
  }

  const photos = getPhotoSession(sessionId);
  const photoId = getPhotoId(request);

  if (photoId) {
    const photo = photos.find((storedPhoto) => storedPhoto.id === photoId);

    if (!photo) {
      return NextResponse.json({ error: "Photo not found." }, { status: 404 });
    }

    return new Response(photo.bytes, {
      headers: {
        "Cache-Control": "no-store",
        "Content-Disposition": `inline; filename="${photo.name.replace(/"/g, "")}"`,
        "Content-Type": photo.type || "application/octet-stream"
      }
    });
  }

  return NextResponse.json({ photos: summarizePhotos(photos) });
}

export async function POST(request: Request) {
  const sessionId = getSessionId(request);

  if (!isValidSessionId(sessionId)) {
    return NextResponse.json({ error: "Invalid photo session." }, { status: 400 });
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid photo upload." }, { status: 400 });
  }

  const existingPhotos = getPhotoSession(sessionId);
  const files = formData
    .getAll("photos")
    .filter((value): value is File => value instanceof File && value.size > 0)
    .slice(0, Math.max(0, sellTradeMaxPhotos - existingPhotos.length));
  const fileError = validateFiles([...existingPhotos.map((photo) => new File([photo.bytes], photo.name, { type: photo.type })), ...files]);

  if (fileError) {
    return NextResponse.json({ error: fileError }, { status: 400 });
  }

  const uploadedPhotos: StoredPhoto[] = await Promise.all(
    files.map(async (file) => ({
      id: createId(),
      name: file.name,
      type: file.type,
      size: file.size,
      bytes: await file.arrayBuffer(),
      createdAt: Date.now()
    }))
  );

  const nextPhotos = [...existingPhotos, ...uploadedPhotos].slice(0, sellTradeMaxPhotos);
  setPhotoSession(sessionId, nextPhotos);

  return NextResponse.json({ photos: summarizePhotos(nextPhotos) });
}

export async function DELETE(request: Request) {
  const sessionId = getSessionId(request);

  if (!isValidSessionId(sessionId)) {
    return NextResponse.json({ error: "Invalid photo session." }, { status: 400 });
  }

  const photoId = getPhotoId(request);

  if (!photoId) {
    clearPhotoSession(sessionId);
    return NextResponse.json({ photos: [] });
  }

  const nextPhotos = getPhotoSession(sessionId).filter((photo) => photo.id !== photoId);
  setPhotoSession(sessionId, nextPhotos);

  return NextResponse.json({ photos: summarizePhotos(nextPhotos) });
}
