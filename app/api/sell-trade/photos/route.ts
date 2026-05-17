import { NextResponse } from "next/server";
import { createId } from "@/lib/id";
import { getPhotoSession, setPhotoSession, summarizePhotos, type StoredPhoto } from "@/lib/sell-trade-photo-sessions";

const maxFiles = 8;
const maxFileSizeBytes = 8 * 1024 * 1024;
const maxTotalFileSizeBytes = 24 * 1024 * 1024;
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"]);

function getSessionId(request: Request) {
  return new URL(request.url).searchParams.get("session")?.trim() ?? "";
}

function isValidSessionId(sessionId: string) {
  return /^[a-zA-Z0-9-]{16,80}$/.test(sessionId);
}

function validateFiles(files: File[]) {
  let totalSize = 0;

  for (const file of files) {
    totalSize += file.size;

    if (!allowedImageTypes.has(file.type)) {
      return "Photos must be JPG, PNG, WebP, GIF, HEIC, or HEIF images.";
    }

    if (file.size > maxFileSizeBytes) {
      return "Each photo must be 8 MB or smaller.";
    }
  }

  if (totalSize > maxTotalFileSizeBytes) {
    return "Photo uploads must be 24 MB total or smaller.";
  }

  return "";
}

export async function GET(request: Request) {
  const sessionId = getSessionId(request);

  if (!isValidSessionId(sessionId)) {
    return NextResponse.json({ error: "Invalid photo session." }, { status: 400 });
  }

  return NextResponse.json({ photos: summarizePhotos(getPhotoSession(sessionId)) });
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
    .slice(0, Math.max(0, maxFiles - existingPhotos.length));
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

  const nextPhotos = [...existingPhotos, ...uploadedPhotos].slice(0, maxFiles);
  setPhotoSession(sessionId, nextPhotos);

  return NextResponse.json({ photos: summarizePhotos(nextPhotos) });
}
