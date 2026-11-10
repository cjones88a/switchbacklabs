import { describe, expect, it } from "vitest";
import {
  createTrainingSession,
  openTrainingSession,
  sealTrainingSession,
  TRAINING_SESSION_TTL_MS,
} from "./trainingCookie";

const SECRET = "test-session-secret-at-least-32-chars";

function session(now = 1_700_000_000_000) {
  return createTrainingSession(
    {
      accessToken: "access-1",
      refreshToken: "refresh-1",
      expiresAt: now + 6 * 60 * 60 * 1000,
      athleteId: 42,
    },
    now
  );
}

describe("training session cookie", () => {
  it("round-trips a session and does not put the token in plaintext", () => {
    const now = 1_700_000_000_000;
    const sealed = sealTrainingSession(session(now), SECRET);
    expect(sealed.startsWith("v1.")).toBe(true);
    expect(sealed).not.toContain("access-1");
    expect(sealed).not.toContain("refresh-1");
    expect(openTrainingSession(sealed, SECRET, now + 1000)).toMatchObject({
      accessToken: "access-1",
      refreshToken: "refresh-1",
      athleteId: 42,
    });
  });

  it("rejects a tampered cookie, the wrong secret, and an expired session", () => {
    const now = 1_700_000_000_000;
    const sealed = sealTrainingSession(session(now), SECRET);
    const [v, iv, body, tag] = sealed.split(".");
    const flipped = (body.startsWith("A") ? "B" : "A") + body.slice(1);
    expect(openTrainingSession([v, iv, flipped, tag].join("."), SECRET, now)).toBeNull();
    expect(openTrainingSession(sealed, SECRET + "-other-secret-padding", now)).toBeNull();
    expect(openTrainingSession(sealed, SECRET, now + TRAINING_SESSION_TTL_MS + 1)).toBeNull();
    expect(openTrainingSession(undefined, SECRET, now)).toBeNull();
    expect(openTrainingSession(sealed, "short", now)).toBeNull();
  });

  it("refuses to seal without a long secret", () => {
    expect(() => sealTrainingSession(session(), "too-short")).toThrow(/missing_session_secret/);
  });
});
