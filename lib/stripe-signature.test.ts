import { createHmac } from "crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { verifyStripeSignature } from "./stripe-signature";

const secret = "whsec_test_secret";
const timestamp = 1_800_000_000;
const payload = JSON.stringify({
  id: "evt_test",
  type: "checkout.session.completed",
  data: { object: { id: "cs_test_123" } }
});

function sign(value = payload) {
  return createHmac("sha256", secret).update(`${timestamp}.${value}`).digest("hex");
}

describe("Stripe webhook signature verification", () => {
  beforeEach(() => {
    vi.spyOn(Date, "now").mockReturnValue(timestamp * 1000);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("accepts a valid Stripe v1 signature", () => {
    expect(verifyStripeSignature(payload, `t=${timestamp},v1=${sign()}`, secret)).toBe(true);
  });

  it("accepts any valid v1 signature when Stripe sends multiple signatures", () => {
    expect(verifyStripeSignature(payload, `t=${timestamp},v1=bad,v1=${sign()}`, secret)).toBe(true);
  });

  it("rejects stale signatures", () => {
    vi.spyOn(Date, "now").mockReturnValue((timestamp + 301) * 1000);

    expect(verifyStripeSignature(payload, `t=${timestamp},v1=${sign()}`, secret)).toBe(false);
  });

  it("rejects a signature for a different payload", () => {
    expect(verifyStripeSignature(payload, `t=${timestamp},v1=${sign("{}")}`, secret)).toBe(false);
  });
});
