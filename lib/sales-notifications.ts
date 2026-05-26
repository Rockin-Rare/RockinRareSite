import { releaseCheckoutReservationByInput } from "./checkout-reservations";

type CheckoutSale = {
  productId: string;
  sku: string;
  slug: string;
  reservationId?: string;
  reservedUntil?: string;
  items?: CheckoutSaleItem[];
  sessionId: string;
  paymentIntentId?: string;
  amountTotal?: number;
  currency?: string;
  customerEmail?: string;
  status: "paid" | "expired";
};

type CheckoutSaleItem = {
  productId: string;
  sku: string;
  slug: string;
  reservationId?: string;
  amountTotal?: number;
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

function omitUndefined<T extends Record<string, unknown>>(payload: T) {
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));
}

export async function notifyCheckoutSale(sale: CheckoutSale) {
  await notifyCardIntake(sale);
  await notifyDiscord(sale).catch((error) => {
    console.error("Discord sales notification failed", error);
  });
}

async function notifyDiscord(sale: CheckoutSale) {
  const webhookUrl = process.env.DISCORD_SALES_WEBHOOK_URL;
  if (!webhookUrl || sale.status !== "paid") return;
  const items = sale.items?.length ? sale.items : [sale];

  const content = [
    "**New Direct Website Sale**",
    `**Items:** ${items.length}`,
    ...items.slice(0, 10).map((item, index) => `**${index + 1}.** ${escapeDiscordMentions(item.sku)} / ${escapeDiscordMentions(item.slug)}`),
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
  if (!callbackUrl) {
    if (sale.status === "expired") {
      await releaseExpiredReservations(sale);
      return;
    }

    throw new Error("Card Intake sales webhook is not configured.");
  }

  const items = sale.items?.length ? sale.items : [sale];
  const responses = await Promise.all(
    items.map((item) =>
      fetch(callbackUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.CARD_INTAKE_SALES_WEBHOOK_TOKEN
            ? { authorization: `Bearer ${process.env.CARD_INTAKE_SALES_WEBHOOK_TOKEN}` }
            : {})
        },
        body: JSON.stringify(
          omitUndefined({
            productId: item.productId,
            sku: item.sku,
            slug: item.slug,
            reservationId: item.reservationId,
            reservedUntil: sale.reservedUntil,
            soldChannel: "site",
            status: sale.status,
            stripeSessionId: sale.sessionId,
            stripePaymentIntentId: sale.paymentIntentId,
            amountTotal: item.amountTotal ?? sale.amountTotal,
            currency: sale.currency,
            customerEmail: sale.customerEmail,
            soldAt: new Date().toISOString()
          })
        )
      })
    )
  );

  const failed = responses.find((response) => !response.ok);
  if (failed) {
    const response = failed;
    const errorText = await response.text().catch(() => "");
    throw new Error(errorText || `Card Intake sales sync failed (${response.status}).`);
  }
}

async function releaseExpiredReservations(sale: CheckoutSale) {
  const items = sale.items?.length ? sale.items : [sale];

  await Promise.all(
    items
      .filter((item) => item.productId && item.sku && item.slug && item.reservationId)
      .map((item) =>
        releaseCheckoutReservationByInput({
          productId: item.productId,
          sku: item.sku,
          slug: item.slug,
          reservationId: item.reservationId as string
        })
      )
  );
}
