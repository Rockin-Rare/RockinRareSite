import { createNeonAuth } from "@neondatabase/auth/next/server";

const developmentCookieSecret = "rockin-rare-local-neon-auth-cookie-secret";

export function hasNeonAuth() {
  return Boolean(process.env.NEON_AUTH_BASE_URL && process.env.NEON_AUTH_COOKIE_SECRET);
}

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL || "https://auth.local.invalid",
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET || developmentCookieSecret
  }
});
