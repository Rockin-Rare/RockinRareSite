import { getNeonSql } from "@/lib/db/neon";

type StripeWebhookEventState = {
  completedEventIds?: Set<string>;
  processingEventIds?: Set<string>;
};

const store = globalThis as typeof globalThis & {
  stripeWebhookEventState?: StripeWebhookEventState;
  stripeWebhookPersistenceDisabled?: boolean;
};

function getStore() {
  if (!store.stripeWebhookEventState) {
    store.stripeWebhookEventState = {
      completedEventIds: new Set(),
      processingEventIds: new Set()
    };
  }

  return store.stripeWebhookEventState;
}

function isMissingWebhookEventsTableError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    ("code" in error ? error.code === "42P01" : false)
  ) || (error instanceof Error && error.message.includes("billing.webhook_events"));
}

export function beginStripeWebhookEvent(eventId: string) {
  const state = getStore();

  if (state.completedEventIds?.has(eventId)) return "completed" as const;
  if (state.processingEventIds?.has(eventId)) return "processing" as const;

  state.processingEventIds?.add(eventId);
  return "started" as const;
}

export async function beginPersistentStripeWebhookEvent(eventId: string, eventType: string) {
  if (store.stripeWebhookPersistenceDisabled) return beginStripeWebhookEvent(eventId);

  const sql = getNeonSql();
  if (!sql) return beginStripeWebhookEvent(eventId);

  try {
    const rows = (await sql`
      insert into billing.webhook_events (event_id, provider, event_type, status, updated_at)
      values (${eventId}, 'stripe', ${eventType}, 'processing', now())
      on conflict (event_id) do nothing
      returning status
    `) as unknown as Array<{ status: string }>;

    if (rows.length > 0) {
      beginStripeWebhookEvent(eventId);
      return "started" as const;
    }

    const existingRows = (await sql`
      select status
      from billing.webhook_events
      where event_id = ${eventId}
      limit 1
    `) as unknown as Array<{ status: string }>;
    const status = existingRows[0]?.status;

    if (status === "completed") return "completed" as const;
    if (status === "processing") return "processing" as const;

    await sql`
      update billing.webhook_events
      set status = 'processing', event_type = ${eventType}, updated_at = now()
      where event_id = ${eventId}
    `;
    beginStripeWebhookEvent(eventId);
    return "started" as const;
  } catch (error) {
    if (isMissingWebhookEventsTableError(error)) {
      store.stripeWebhookPersistenceDisabled = true;
      console.warn("Stripe webhook persistence table is missing; falling back to process memory.");
      return beginStripeWebhookEvent(eventId);
    }

    console.error("Stripe webhook event persistence failed; falling back to process memory", error);
    return beginStripeWebhookEvent(eventId);
  }
}

export function completeStripeWebhookEvent(eventId: string) {
  const state = getStore();
  state.processingEventIds?.delete(eventId);
  state.completedEventIds?.add(eventId);
}

export async function completePersistentStripeWebhookEvent(eventId: string) {
  if (store.stripeWebhookPersistenceDisabled) {
    completeStripeWebhookEvent(eventId);
    return;
  }

  const sql = getNeonSql();
  completeStripeWebhookEvent(eventId);

  if (!sql) return;

  try {
    await sql`
      update billing.webhook_events
      set status = 'completed', processed_at = now(), updated_at = now()
      where event_id = ${eventId}
    `;
  } catch (error) {
    if (isMissingWebhookEventsTableError(error)) {
      store.stripeWebhookPersistenceDisabled = true;
      return;
    }

    console.error("Stripe webhook event completion persistence failed", error);
  }
}

export function failStripeWebhookEvent(eventId: string) {
  getStore().processingEventIds?.delete(eventId);
}

export async function failPersistentStripeWebhookEvent(eventId: string) {
  if (store.stripeWebhookPersistenceDisabled) {
    failStripeWebhookEvent(eventId);
    return;
  }

  const sql = getNeonSql();
  failStripeWebhookEvent(eventId);

  if (!sql) return;

  try {
    await sql`
      update billing.webhook_events
      set status = 'failed', updated_at = now()
      where event_id = ${eventId}
    `;
  } catch (error) {
    if (isMissingWebhookEventsTableError(error)) {
      store.stripeWebhookPersistenceDisabled = true;
      return;
    }

    console.error("Stripe webhook event failure persistence failed", error);
  }
}
