const compressibleImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

function compressedName(name: string) {
  return name.replace(/\.[^.]+$/, "") || "photo";
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

export async function compressImageFile(file: File) {
  if (!compressibleImageTypes.has(file.type)) return file;

  let image: ImageBitmap;

  try {
    image = await createImageBitmap(file);
  } catch {
    return file;
  }

  const maxDimension = 1600;
  const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    image.close();
    return file;
  }

  context.drawImage(image, 0, 0, width, height);
  image.close();

  const blob = await canvasToBlob(canvas, "image/jpeg", 0.82);
  if (!blob || blob.size >= file.size) return file;

  return new File([blob], `${compressedName(file.name)}.jpg`, {
    type: "image/jpeg",
    lastModified: file.lastModified
  });
}

export async function compressImageFiles(files: File[]) {
  return Promise.all(files.map((file) => compressImageFile(file)));
}
