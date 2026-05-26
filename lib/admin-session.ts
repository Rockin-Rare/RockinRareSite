import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const adminSessionCookieName = "rr_admin_session";

const maxAgeSeconds = 60 * 60 * 8;

function getAdminToken() {
  return process.env.ROCKIN_RARE_ADMIN_TOKEN ?? "";
}

function getSigningSecret() {
  return process.env.COLLECTOR_CLUB_SESSION_SECRET || process.env.NEXTAUTH_SECRET || getAdminToken();
}

function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function signaturesMatch(actual: string, expected: string) {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

export function listingAdminConfigured() {
  return Boolean(getAdminToken());
}

export function createAdminSessionValue() {
  const secret = getSigningSecret();
  if (!secret) return null;

  const payload = Buffer.from(JSON.stringify({ expiresAt: Date.now() + maxAgeSeconds * 1000 }), "utf8").toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

export function verifyAdminSessionValue(value: string | undefined) {
  const secret = getSigningSecret();
  if (!secret || !value) return false;

  const [payload, signature] = value.split(".");
  if (!payload || !signature || !signaturesMatch(signature, sign(payload, secret))) return false;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { expiresAt?: unknown };
    return typeof parsed.expiresAt === "number" && parsed.expiresAt > Date.now();
  } catch {
    return false;
  }
}

export async function hasAdminSession() {
  const cookieStore = await cookies();
  return verifyAdminSessionValue(cookieStore.get(adminSessionCookieName)?.value);
}

export function adminSessionCookieOptions() {
  return {
    httpOnly: true,
    maxAge: maxAgeSeconds,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production"
  };
}

export function adminTokenMatches(value: string) {
  const token = getAdminToken();
  if (!token || !value) return false;

  const actualBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(token);
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}
