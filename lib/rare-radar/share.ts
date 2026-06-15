import { createHmac, timingSafeEqual } from "crypto";

const tokenVersion = "v1";
const fallbackShareSecret = "rockin-rare-local-wishlist-share-secret";

type WishlistSharePayload = {
  uid: string;
};

export function createWishlistShareToken(authUserId: string) {
  const payload = base64UrlEncode(JSON.stringify({ uid: authUserId } satisfies WishlistSharePayload));
  const signature = signPayload(payload);

  return `${tokenVersion}.${payload}.${signature}`;
}

export function getAuthUserIdFromWishlistShareToken(token: string) {
  const [version, payload, signature] = token.split(".");
  if (version !== tokenVersion || !payload || !signature) return null;

  const expectedSignature = signPayload(payload);
  if (!safeEqual(signature, expectedSignature)) return null;

  try {
    const parsed = JSON.parse(base64UrlDecode(payload)) as Partial<WishlistSharePayload>;
    return typeof parsed.uid === "string" && parsed.uid ? parsed.uid : null;
  } catch {
    return null;
  }
}

function signPayload(payload: string) {
  return createHmac("sha256", getWishlistShareSecret()).update(payload).digest("base64url");
}

function getWishlistShareSecret() {
  return process.env.WISHLIST_SHARE_SECRET || process.env.NEON_AUTH_COOKIE_SECRET || fallbackShareSecret;
}

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
