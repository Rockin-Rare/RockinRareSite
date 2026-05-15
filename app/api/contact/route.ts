import { NextResponse } from "next/server";

type ContactRequest = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const maxLengths = {
  name: 120,
  email: 254,
  subject: 160,
  message: 3000
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
  return `${content.slice(0, discordContentMaxLength - 24)}\n\n[Message truncated]`;
}

function formatField(label: string, value: string) {
  return value ? `**${label}:** ${escapeDiscordMentions(value)}` : "";
}

export async function POST(request: Request) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  if (!checkRateLimit(getClientIp(request))) {
    return NextResponse.json({ error: "Too many messages. Please try again later." }, { status: 429 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid message payload." }, { status: 400 });
  }

  if (!isObject(body)) {
    return NextResponse.json({ error: "Invalid message payload." }, { status: 400 });
  }

  if (cleanString(body.company, 200)) {
    return NextResponse.json({ ok: true }, { status: 202 });
  }

  const submission: ContactRequest = {
    name: cleanString(body.name, maxLengths.name),
    email: cleanString(body.email, maxLengths.email),
    subject: cleanString(body.subject, maxLengths.subject),
    message: cleanString(body.message, maxLengths.message)
  };

  if (!submission.name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  if (!submission.email || !/^\S+@\S+\.\S+$/.test(submission.email)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  if (!submission.message) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  const webhookUrl = process.env.DISCORD_CONTACT_WEBHOOK_URL;

  if (!webhookUrl) {
    return NextResponse.json(
      {
        ok: true,
        storage: "unconfigured",
        message: "Message accepted. Configure DISCORD_CONTACT_WEBHOOK_URL to send messages to Discord."
      },
      { status: 202 }
    );
  }

  const content = [
    "**New Contact Message**",
    formatField("Name", submission.name),
    formatField("Email", submission.email),
    formatField("Subject", submission.subject),
    "",
    "**Message:**",
    escapeDiscordMentions(submission.message)
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
    return NextResponse.json({ error: "Unable to send message." }, { status: 502 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
