type StripeWebhookEventState = {
  completedEventIds?: Set<string>;
  processingEventIds?: Set<string>;
};

const store = globalThis as typeof globalThis & {
  stripeWebhookEventState?: StripeWebhookEventState;
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

export function beginStripeWebhookEvent(eventId: string) {
  const state = getStore();

  if (state.completedEventIds?.has(eventId)) return "completed" as const;
  if (state.processingEventIds?.has(eventId)) return "processing" as const;

  state.processingEventIds?.add(eventId);
  return "started" as const;
}

export function completeStripeWebhookEvent(eventId: string) {
  const state = getStore();
  state.processingEventIds?.delete(eventId);
  state.completedEventIds?.add(eventId);
}

export function failStripeWebhookEvent(eventId: string) {
  getStore().processingEventIds?.delete(eventId);
}
