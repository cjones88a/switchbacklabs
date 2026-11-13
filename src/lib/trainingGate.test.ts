import { describe, expect, it } from "vitest";
import {
  authErrorCopy,
  authorizePath,
  normalizeEnvValue,
  redirectUriIssue,
  sanitizeMissingList,
  sessionSecretIssue,
  successRedirectPath,
  trainingConfigProblems,
  trainingEntryDecision,
  trainingErrorPath,
} from "./trainingGate";

const goodEnv = {
  STRAVA_CLIENT_ID: "179098",
  STRAVA_CLIENT_SECRET: "secret",
  STRAVA_REDIRECT_URI: "https://switchbacklabsco.com/api/strava/callback",
  TRAINING_SESSION_SECRET: "x".repeat(32),
};

describe("training config", () => {
  it("accepts Strava settings plus a session secret and ignores Supabase", () => {
    expect(trainingConfigProblems(goodEnv)).toEqual({ missing: [], details: [] });
    expect(
      trainingConfigProblems({
        ...goodEnv,
        SUPABASE_URL: "",
        SUPABASE_SERVICE_ROLE: "",
      })
    ).toEqual({ missing: [], details: [] });
  });

  it("names missing variables and does not treat a quoted secret as empty", () => {
    const problems = trainingConfigProblems({
      ...goodEnv,
      STRAVA_CLIENT_SECRET: "",
      TRAINING_SESSION_SECRET: `"${"k".repeat(32)}"`,
    });
    expect(problems.missing).toEqual(["STRAVA_CLIENT_SECRET"]);
    expect(normalizeEnvValue('  "abc"  ')).toBe("abc");
  });

  it("rejects a short session secret and a bad redirect URI", () => {
    expect(sessionSecretIssue("too-short")).toMatch(/32 characters/);
    expect(redirectUriIssue("https://switchbacklabsco.com/training")).toMatch(/\/api\/strava\/callback/);
    const problems = trainingConfigProblems({
      ...goodEnv,
      TRAINING_SESSION_SECRET: "short",
      STRAVA_REDIRECT_URI: "https://switchbacklabsco.com/training",
    });
    expect(problems.missing).toEqual([]);
    expect(problems.details.join(" ")).toMatch(/callback/);
    expect(problems.details.join(" ")).toMatch(/32 characters/);
  });
});

describe("training entry", () => {
  const clear = { missing: [], details: [] };

  it("shows the signed-out training app when Strava is configured and there is no cookie", () => {
    expect(trainingEntryDecision({ error: null, config: clear, hasSession: false })).toEqual({
      type: "signed_out",
    });
  });

  it("opens the training app when a session cookie is present", () => {
    expect(trainingEntryDecision({ error: null, config: clear, hasSession: true })).toEqual({
      type: "app",
    });
  });

  it("shows configuration errors instead of starting OAuth", () => {
    const action = trainingEntryDecision({
      error: null,
      config: { missing: ["TRAINING_SESSION_SECRET"], details: [] },
      hasSession: false,
    });
    expect(action).toMatchObject({ type: "error", code: "server_misconfigured" });
  });

  it("keeps an auth error on the page instead of skipping back into the app", () => {
    const action = trainingEntryDecision({
      error: "access_denied",
      config: clear,
      hasSession: true,
    });
    expect(action).toMatchObject({ type: "error", code: "access_denied" });
    expect(authErrorCopy("access_denied").body).toMatch(/database/i);
  });
});

describe("callback redirects", () => {
  it("returns a successful login to the training app", () => {
    expect(successRedirectPath(undefined)).toBe("/training?connected=1");
    expect(successRedirectPath("/training")).toBe("/training?connected=1");
    expect(authorizePath()).toBe("/api/strava/authorize?next=%2Ftraining");
  });

  it("preserves a safe in-app next path and rejects open redirects", () => {
    expect(successRedirectPath("/training?tab=plan")).toBe("/training?tab=plan&connected=1");
    expect(successRedirectPath("https://evil.example/phish")).toBe("/training?connected=1");
    expect(successRedirectPath("//evil.example")).toBe("/training?connected=1");
  });

  it("builds an error path without echoing unknown env names", () => {
    expect(trainingErrorPath("access_denied")).toBe("/training?error=access_denied");
    expect(
      trainingErrorPath("server_misconfigured", ["TRAINING_SESSION_SECRET", "SUPABASE_URL"])
    ).toBe("/training?error=server_misconfigured&missing=TRAINING_SESSION_SECRET");
    expect(sanitizeMissingList("STRAVA_CLIENT_ID,SUPABASE_URL")).toEqual(["STRAVA_CLIENT_ID"]);
  });
});
