import { NextResponse, type NextRequest } from "next/server";
import { siteUrl } from "@/lib/site";

const canonicalUrl = new URL(siteUrl);

export function middleware(request: NextRequest) {
  const requestUrl = request.nextUrl;
  const host = request.headers.get("host") ?? requestUrl.host;
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? requestUrl.protocol.replace(":", "");
  const needsCanonicalHost = host.toLowerCase() !== canonicalUrl.host.toLowerCase();
  const needsHttps = forwardedProto !== canonicalUrl.protocol.replace(":", "");

  if (!needsCanonicalHost && !needsHttps) {
    return NextResponse.next();
  }

  const redirectUrl = requestUrl.clone();
  redirectUrl.protocol = canonicalUrl.protocol;
  redirectUrl.host = canonicalUrl.host;

  return NextResponse.redirect(redirectUrl, 308);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image).*)"]
};
