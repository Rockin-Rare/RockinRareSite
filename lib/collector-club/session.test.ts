import { afterEach, describe, expect, it } from "vitest";
import { createCollectorClubSessionValue, readCookieValue, verifyCollectorClubSessionValue } from "./session";

const originalSecret = process.env.COLLECTOR_CLUB_SESSION_SECRET;

afterEach(() => {
  process.env.COLLECTOR_CLUB_SESSION_SECRET = originalSecret;
});

describe("Collector Club session signing", () => {
  it("returns null when no session secret is configured", () => {
    delete process.env.COLLECTOR_CLUB_SESSION_SECRET;

    expect(createCollectorClubSessionValue({ id: "member-1", email: "collector@example.com" })).toBeNull();
  });

  it("verifies an untampered signed session", () => {
    process.env.COLLECTOR_CLUB_SESSION_SECRET = "test-secret";

    const value = createCollectorClubSessionValue({ id: "member-1", email: "collector@example.com" });
    expect(value).toBeTruthy();

    const payload = verifyCollectorClubSessionValue(value ?? "");
    expect(payload?.memberId).toBe("member-1");
    expect(payload?.email).toBe("collector@example.com");
  });

  it("rejects a tampered session", () => {
    process.env.COLLECTOR_CLUB_SESSION_SECRET = "test-secret";

    const value = createCollectorClubSessionValue({ id: "member-1", email: "collector@example.com" });
    const [payload, signature] = value?.split(".") ?? [];
    const tampered = `${payload}.${signature === "a" ? "b" : "a"}`;

    expect(verifyCollectorClubSessionValue(tampered)).toBeNull();
  });

  it("reads a cookie value from a cookie header", () => {
    expect(readCookieValue("theme=dark; rr_collector_session=abc123; cart=1", "rr_collector_session")).toBe("abc123");
  });
});
