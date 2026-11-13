import { describe, expect, it } from "vitest";
import {
  DISCLAIMER_TTL_MS,
  DISCLAIMER_VERSION,
  openDisclaimer,
  planDisclaimerGate,
  sealDisclaimer,
} from "./trainingDisclaimer";

const SECRET = "test-session-secret-at-least-32-chars";

describe("training disclaimer cookie", () => {
  it("round-trips the current version and hides the plaintext payload", () => {
    const now = 1_700_000_000_000;
    const sealed = sealDisclaimer(SECRET, now);
    expect(sealed.startsWith("v1.")).toBe(true);
    expect(sealed).not.toContain(DISCLAIMER_VERSION);
    expect(openDisclaimer(sealed, SECRET, now + 1000)).toEqual({
      version: DISCLAIMER_VERSION,
      acceptedAt: now,
    });
  });

  it("rejects a missing cookie, a bad secret, and an expired acceptance", () => {
    const now = 1_700_000_000_000;
    const sealed = sealDisclaimer(SECRET, now);
    expect(openDisclaimer(undefined, SECRET, now)).toBeNull();
    expect(openDisclaimer(sealed, "short", now)).toBeNull();
    expect(openDisclaimer(sealed, SECRET, now + DISCLAIMER_TTL_MS)).toBeNull();
  });

  it("requires the current version in both the body and the cookie", () => {
    const now = 1_700_000_000_000;
    const cookie = sealDisclaimer(SECRET, now);
    expect(
      planDisclaimerGate({ bodyVersion: DISCLAIMER_VERSION, cookie, secret: SECRET, now })
    ).toEqual({ ok: true });
    expect(
      planDisclaimerGate({ bodyVersion: "1999-01-01", cookie, secret: SECRET, now })
    ).toEqual({ ok: false });
    expect(
      planDisclaimerGate({ bodyVersion: DISCLAIMER_VERSION, cookie: undefined, secret: SECRET, now })
    ).toEqual({ ok: false });
    expect(
      planDisclaimerGate({ bodyVersion: undefined, cookie, secret: SECRET, now })
    ).toEqual({ ok: false });
  });
});
