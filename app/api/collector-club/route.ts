import { NextResponse } from "next/server";
import { saveCollectorClubSignup } from "@/lib/collector-club/members";
import {
  collectorClubSessionCookieName,
  collectorClubSessionCookieOptions,
  createCollectorClubSessionValue
} from "@/lib/collector-club/session";

type CollectorClubRequest = {
  name: string;
  email: string;
  collectingFocus: string;
  favoriteSets: string;
  wishlist: string;
  discordUsername: string;
  interestedInPro: boolean;
};

const maxLengths = {
  name: 120,
  email: 254,
  collectingFocus: 80,
  favoriteSets: 300,
  wishlist: 1200,
  discordUsername: 80
};
const rateLimitWindowMs = 10 * 60 * 1000;
const rateLimitMax = 5;
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const discordContentMaxLength = 1900;

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function cleanString(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || "unknown";

  return request.headers.get("x-real-ip") || "unknown";
}

function checkRateLimit(ip: string) {
  const now = Date.now();
  const current = rateLimits.get(ip);

  for (const [key, value] of rateLimits.entries()) {
    if (value.resetAt <= now) rateLimits.delete(key);
  }

  if (!current || current.resetAt <= now) {
    rateLimits.set(ip, { count: 1, resetAt: now + rateLimitWindowMs });
    return true;
  }

  if (current.count >= rateLimitMax) {
    return false;
  }

  current.count += 1;
  return true;
}

function isAllowedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  return origin === new URL(request.url).origin;
}

function escapeDiscordMentions(value: string) {
  return value
    .replace(/@everyone/g, "@\u200beveryone")
    .replace(/@here/g, "@\u200bhere")
    .replace(/<@/g, "<@\u200b")
    .replace(/<@&/g, "<@&\u200b");
}

function limitDiscordContent(content: string) {
  if (content.length <= discordContentMaxLength) return content;
  return `${content.slice(0, discordContentMaxLength - 24)}\n\n[Signup truncated]`;
}

function formatField(label: string, value: string) {
  return value ? `**${label}:** ${escapeDiscordMentions(value)}` : "";
}

export async function POST(request: Request) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  if (!checkRateLimit(getClientIp(request))) {
    return NextResponse.json({ error: "Too many signups. Please try again later." }, { status: 429 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid signup payload." }, { status: 400 });
  }

  if (!isObject(body)) {
    return NextResponse.json({ error: "Invalid signup payload." }, { status: 400 });
  }

  if (cleanString(body.company, 200)) {
    return NextResponse.json({ ok: true }, { status: 202 });
  }

  const submission: CollectorClubRequest = {
    name: cleanString(body.name, maxLengths.name),
    email: cleanString(body.email, maxLengths.email),
    collectingFocus: cleanString(body.collectingFocus, maxLengths.collectingFocus) || "Mixed collection",
    favoriteSets: cleanString(body.favoriteSets, maxLengths.favoriteSets),
    wishlist: cleanString(body.wishlist, maxLengths.wishlist),
    discordUsername: cleanString(body.discordUsername, maxLengths.discordUsername),
    interestedInPro: body.interestedInPro === true
  };

  if (!submission.name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  if (!submission.email || !/^\S+@\S+\.\S+$/.test(submission.email)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  let sessionValue: string | null = null;
  let storedInDatabase = false;

  try {
    const result = await saveCollectorClubSignup({ ...submission, source: "collector-club-page" });
    storedInDatabase = result.stored;
    sessionValue = result.stored ? createCollectorClubSessionValue(result.member) : null;
  } catch (error) {
    console.error("Collector Club signup storage failed", error);
    return NextResponse.json({ error: "Unable to save signup." }, { status: 502 });
  }

  const webhookUrl = process.env.DISCORD_COLLECTOR_CLUB_WAITLIST_WEBHOOK_URL;

  if (!webhookUrl) {
    const response = NextResponse.json(
      {
        ok: true,
        storage: storedInDatabase ? "neon" : "unconfigured",
        hasSession: Boolean(sessionValue),
        message: "Signup accepted. Configure DISCORD_COLLECTOR_CLUB_WAITLIST_WEBHOOK_URL to send signups to Discord."
      },
      { status: 202 }
    );

    if (sessionValue) {
      response.cookies.set(collectorClubSessionCookieName, sessionValue, collectorClubSessionCookieOptions());
    }

    return response;
  }

  const content = [
    "**New Collector Club Waitlist Signup**",
    formatField("Name", submission.name),
    formatField("Email", submission.email),
    formatField("Collecting focus", submission.collectingFocus),
    formatField("Favorite sets/characters", submission.favoriteSets),
    formatField("Discord username", submission.discordUsername),
    `**Interested in Pro later:** ${submission.interestedInPro ? "Yes" : "No"}`,
    submission.wishlist ? `\n**Wishlist / collecting notes:**\n${escapeDiscordMentions(submission.wishlist)}` : ""
  ]
    .filter(Boolean)
    .join("\n");

  const discordResponse = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "Rockin Rare Site",
      content: limitDiscordContent(content),
      allowed_mentions: { parse: [] }
    })
  });

  if (!discordResponse.ok) {
    return NextResponse.json({ error: "Unable to save signup." }, { status: 502 });
  }

  const response = NextResponse.json(
    { ok: true, storage: storedInDatabase ? "neon" : "unconfigured", hasSession: Boolean(sessionValue) },
    { status: 201 }
  );
  if (sessionValue) {
    response.cookies.set(collectorClubSessionCookieName, sessionValue, collectorClubSessionCookieOptions());
  }

  return response;
}
