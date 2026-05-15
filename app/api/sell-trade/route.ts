import { NextResponse } from "next/server";
import { clearPhotoSession, getPhotoSession } from "@/lib/sell-trade-photo-sessions";
import type { SellTradeSubmission } from "@/lib/types";

type SellTradeRequest = Omit<SellTradeSubmission, "createdAt">;
type ParsedRequest = {
  fields: Record<string, unknown>;
  files: File[];
};

const contactMethods = new Set(["Email", "Phone", "Instagram"]);
const maxLengths = {
  name: 120,
  email: 254,
  phone: 40,
  description: 3000,
  franchise: 80,
  approximateQuantity: 120,
  conditionEstimate: 120,
  message: 2000,
  imageUrl: 160
};
const maxImageUrls = 12;
const maxFiles = 8;
const maxFileSizeBytes = 8 * 1024 * 1024;
const maxTotalFileSizeBytes = 24 * 1024 * 1024;
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"]);
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

function cleanStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, maxImageUrls)
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim().slice(0, maxLengths.imageUrl))
    .filter(Boolean);
}

async function parseRequest(request: Request): Promise<ParsedRequest | null> {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const fields = Object.fromEntries(formData.entries());
    const files = formData
      .getAll("photos")
      .filter((value): value is File => value instanceof File && value.size > 0)
      .slice(0, maxFiles);

    return { fields, files };
  }

  if (contentType.includes("application/json")) {
    const body = await request.json();
    return isObject(body) ? { fields: body, files: [] } : null;
  }

  return null;
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

function escapeDiscordMentions(value: string) {
  return value
    .replace(/@everyone/g, "@\u200beveryone")
    .replace(/@here/g, "@\u200bhere")
    .replace(/<@/g, "<@\u200b")
    .replace(/<@&/g, "<@&\u200b");
}

function isAllowedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  return origin === new URL(request.url).origin;
}

function limitDiscordContent(content: string) {
  if (content.length <= discordContentMaxLength) return content;
  return `${content.slice(0, discordContentMaxLength - 24)}\n\n[Submission truncated]`;
}

function formatField(label: string, value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value.length > 0 ? `**${label}:** ${value.map(escapeDiscordMentions).join(", ")}` : "";
  }

  return value ? `**${label}:** ${escapeDiscordMentions(value)}` : "";
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

function getSessionFiles(fields: Record<string, unknown>) {
  const sessionId = cleanString(fields.photoSession, 80);
  if (!/^[a-zA-Z0-9-]{16,80}$/.test(sessionId)) {
    return { sessionId: "", files: [] as File[] };
  }

  const files = getPhotoSession(sessionId).map((photo) => new File([photo.bytes], photo.name, { type: photo.type }));
  return { sessionId, files };
}

export async function POST(request: Request) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  if (!checkRateLimit(getClientIp(request))) {
    return NextResponse.json({ error: "Too many submissions. Please try again later." }, { status: 429 });
  }

  let parsed: ParsedRequest | null;

  try {
    parsed = await parseRequest(request);
  } catch {
    return NextResponse.json({ error: "Invalid submission payload." }, { status: 400 });
  }

  if (!parsed || !isObject(parsed.fields)) {
    return NextResponse.json({ error: "Invalid submission payload." }, { status: 400 });
  }

  const { fields } = parsed;
  const sessionFiles = getSessionFiles(fields);
  const files = [...parsed.files, ...sessionFiles.files];

  if (files.length > maxFiles) {
    return NextResponse.json({ error: `Upload ${maxFiles} photos or fewer.` }, { status: 400 });
  }

  const fileError = validateFiles(files);

  if (fileError) {
    return NextResponse.json({ error: fileError }, { status: 400 });
  }

  if (cleanString(fields.company, 200)) {
    return NextResponse.json({ ok: true }, { status: 202 });
  }

  const contactMethod = cleanString(fields.preferredContactMethod, 20);
  const submission: SellTradeRequest = {
    name: cleanString(fields.name, maxLengths.name),
    email: cleanString(fields.email, maxLengths.email),
    phone: cleanString(fields.phone, maxLengths.phone),
    preferredContactMethod: contactMethods.has(contactMethod)
      ? (contactMethod as SellTradeRequest["preferredContactMethod"])
      : "Email",
    description: cleanString(fields.description, maxLengths.description),
    franchise: cleanString(fields.franchise, maxLengths.franchise),
    approximateQuantity: cleanString(fields.approximateQuantity, maxLengths.approximateQuantity),
    conditionEstimate: cleanString(fields.conditionEstimate, maxLengths.conditionEstimate),
    imageUrls: files.length > 0 ? files.map((file) => file.name.slice(0, maxLengths.imageUrl)) : cleanStringArray(fields.imageUrls),
    message: cleanString(fields.message, maxLengths.message)
  };

  if (!submission.name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  if (!submission.email || !/^\S+@\S+\.\S+$/.test(submission.email)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  if (!submission.description) {
    return NextResponse.json({ error: "Collection details are required." }, { status: 400 });
  }

  const webhookUrl = process.env.DISCORD_SELL_TRADE_WEBHOOK_URL;

  if (!webhookUrl) {
    return NextResponse.json(
      {
        ok: true,
        storage: "unconfigured",
        message: "Submission accepted. Configure DISCORD_SELL_TRADE_WEBHOOK_URL to send submissions to Discord."
      },
      { status: 202 }
    );
  }

  const content = [
    "**New Sell / Trade Submission**",
    formatField("Name", submission.name),
    formatField("Email", submission.email),
    formatField("Phone", submission.phone),
    formatField("Preferred contact", submission.preferredContactMethod),
    formatField("Franchise/category", submission.franchise),
    formatField("Approx. quantity", submission.approximateQuantity),
    formatField("Condition estimate", submission.conditionEstimate),
    formatField("Photo file names", submission.imageUrls),
    "",
    "**Collection details:**",
    escapeDiscordMentions(submission.description),
    submission.message ? `\n**Message:**\n${escapeDiscordMentions(submission.message)}` : ""
  ]
    .filter(Boolean)
    .join("\n");

  const webhookPayload = {
    username: "Rockin Rare Site",
    content: limitDiscordContent(content),
    allowed_mentions: { parse: [] }
  };
  const discordBody = new FormData();
  discordBody.append("payload_json", JSON.stringify(webhookPayload));
  files.forEach((file, index) => {
    discordBody.append(`files[${index}]`, file, file.name);
  });

  const discordResponse = await fetch(webhookUrl, {
    method: "POST",
    body: discordBody
  });

  if (!discordResponse.ok) {
    return NextResponse.json({ error: "Unable to send submission." }, { status: 502 });
  }

  if (sessionFiles.sessionId) {
    clearPhotoSession(sessionFiles.sessionId);
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
