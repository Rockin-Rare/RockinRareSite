import { createHmac, timingSafeEqual } from "crypto";
import { getAnonymousCollectorClubEntitlement } from "./entitlements";
import { getCollectorClubEntitlementByMemberId } from "./members";
import type { CollectorClubEntitlement } from "./types";

type CollectorClubSessionPayload = {
  memberId: string;
  email: string;
  expiresAt: number;
};

export const collectorClubSessionCookieName = "rr_collector_session";

const sessionMaxAgeSeconds = 60 * 60 * 24 * 30;

function getSessionSecret() {
  return process.env.COLLECTOR_CLUB_SESSION_SECRET || process.env.NEXTAUTH_SECRET || "";
}

function encodeBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decodeBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function signaturesMatch(actual: string, expected: string) {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

export function createCollectorClubSessionValue(member: { id: string; email: string }) {
  const secret = getSessionSecret();
  if (!secret) return null;

  const payload: CollectorClubSessionPayload = {
    memberId: member.id,
    email: member.email,
    expiresAt: Date.now() + sessionMaxAgeSeconds * 1000
  };
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  return `${encodedPayload}.${sign(encodedPayload, secret)}`;
}

export function collectorClubSessionCookieOptions() {
  return {
    httpOnly: true,
    maxAge: sessionMaxAgeSeconds,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production"
  };
}

export function readCookieValue(cookieHeader: string | null, cookieName: string) {
  if (!cookieHeader) return "";

  return cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .map((cookie) => {
      const separatorIndex = cookie.indexOf("=");
      return separatorIndex >= 0 ? [cookie.slice(0, separatorIndex), cookie.slice(separatorIndex + 1)] : ["", ""];
    })
    .find(([name]) => name === cookieName)?.[1] ?? "";
}

export function verifyCollectorClubSessionValue(value: string): CollectorClubSessionPayload | null {
  const secret = getSessionSecret();
  if (!secret || !value) return null;

  const [encodedPayload, signature] = value.split(".");
  if (!encodedPayload || !signature) return null;

  const expectedSignature = sign(encodedPayload, secret);
  if (!signaturesMatch(signature, expectedSignature)) return null;

  try {
    const payload = JSON.parse(decodeBase64Url(encodedPayload)) as Partial<CollectorClubSessionPayload>;
    if (!payload.memberId || !payload.email || typeof payload.expiresAt !== "number") return null;
    if (payload.expiresAt <= Date.now()) return null;

    return {
      memberId: payload.memberId,
      email: payload.email,
      expiresAt: payload.expiresAt
    };
  } catch {
    return null;
  }
}

export async function getCollectorClubEntitlementFromCookieValue(value: string): Promise<CollectorClubEntitlement> {
  const payload = verifyCollectorClubSessionValue(value);
  if (!payload) return getAnonymousCollectorClubEntitlement();

  const entitlement = await getCollectorClubEntitlementByMemberId(payload.memberId, payload.email);
  return entitlement ?? getAnonymousCollectorClubEntitlement();
}

export async function getCollectorClubEntitlementFromRequest(request: Request): Promise<CollectorClubEntitlement> {
  const value = readCookieValue(request.headers.get("cookie"), collectorClubSessionCookieName);
  return getCollectorClubEntitlementFromCookieValue(value);
}
