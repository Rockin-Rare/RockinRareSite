type CheckoutSale = {
  productId: string;
  sku: string;
  slug: string;
  sessionId: string;
  paymentIntentId?: string;
  amountTotal?: number;
  currency?: string;
  customerEmail?: string;
  status: "paid" | "expired";
};

function formatMoney(amount?: number, currency?: string) {
  if (typeof amount !== "number" || !currency) return "Unknown";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase()
  }).format(amount / 100);
}

function escapeDiscordMentions(value: string) {
  return value
    .replace(/@everyone/g, "@\u200beveryone")
    .replace(/@here/g, "@\u200bhere")
    .replace(/<@/g, "<@\u200b")
    .replace(/<@&/g, "<@&\u200b");
}

export async function notifyCheckoutSale(sale: CheckoutSale) {
  await Promise.allSettled([notifyDiscord(sale), notifyCardIntake(sale)]);
}

async function notifyDiscord(sale: CheckoutSale) {
  const webhookUrl = process.env.DISCORD_SALES_WEBHOOK_URL;
  if (!webhookUrl || sale.status !== "paid") return;

  const content = [
    "**New Direct Website Sale**",
    `**SKU:** ${escapeDiscordMentions(sale.sku)}`,
    `**Product ID:** ${escapeDiscordMentions(sale.productId)}`,
    `**Slug:** ${escapeDiscordMentions(sale.slug)}`,
    `**Amount:** ${formatMoney(sale.amountTotal, sale.currency)}`,
    sale.customerEmail ? `**Customer:** ${escapeDiscordMentions(sale.customerEmail)}` : "",
    `**Stripe Session:** ${escapeDiscordMentions(sale.sessionId)}`
  ]
    .filter(Boolean)
    .join("\n");

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "Rockin Rare Site",
      content,
      allowed_mentions: { parse: [] }
    })
  });
}

async function notifyCardIntake(sale: CheckoutSale) {
  const callbackUrl = process.env.CARD_INTAKE_SALES_WEBHOOK_URL;
  if (!callbackUrl) return;

  await fetch(callbackUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.CARD_INTAKE_SALES_WEBHOOK_TOKEN
        ? { authorization: `Bearer ${process.env.CARD_INTAKE_SALES_WEBHOOK_TOKEN}` }
        : {})
    },
    body: JSON.stringify({
      productId: sale.productId,
      sku: sale.sku,
      slug: sale.slug,
      soldChannel: "site",
      status: sale.status,
      stripeSessionId: sale.sessionId,
      stripePaymentIntentId: sale.paymentIntentId,
      amountTotal: sale.amountTotal,
      currency: sale.currency,
      customerEmail: sale.customerEmail,
      soldAt: new Date().toISOString()
    })
  });
}
