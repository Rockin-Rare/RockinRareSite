import { createHmac, timingSafeEqual } from "crypto";

const toleranceSeconds = 5 * 60;

export function verifyStripeSignature(payload: string, signatureHeader: string | null, secret: string) {
  if (!signatureHeader) return false;

  const parts = signatureHeader.split(",").map((part) => {
    const separatorIndex = part.indexOf("=");
    return separatorIndex === -1
      ? { key: "", value: "" }
      : { key: part.slice(0, separatorIndex).trim(), value: part.slice(separatorIndex + 1).trim() };
  });
  const timestamp = parts.find((part) => part.key === "t")?.value;
  const signatures = parts.filter((part) => part.key === "v1").map((part) => part.value);

  if (!timestamp || signatures.length === 0) return false;

  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > toleranceSeconds) return false;

  const expected = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
  const expectedBuffer = Buffer.from(expected, "hex");

  return signatures.some((signature) => {
    const signatureBuffer = Buffer.from(signature, "hex");
    return expectedBuffer.length === signatureBuffer.length && timingSafeEqual(expectedBuffer, signatureBuffer);
  });
}
