import { describe, expect, it } from "vitest";
import {
  authErrorCopy,
  authorizePath,
  decideTrainingGate,
  normalizeEnvValue,
  oauthConfigProblems,
  redirectUriIssue,
  sanitizeMissingList,
  successRedirectPath,
  supabaseUrlIssue,
  trainingErrorPath,
} from "./trainingGate";

const goodEnv = {
  STRAVA_CLIENT_ID: "179098",
  STRAVA_CLIENT_SECRET: "secret",
  STRAVA_REDIRECT_URI: "https://switchbacklabsco.com/api/strava/callback",
  SUPABASE_URL: "https://exampleproject.supabase.co",
  SUPABASE_SERVICE_ROLE: "service-role",
};

describe("oauth config", () => {
  it("accepts a complete production-shaped config", () => {
    expect(oauthConfigProblems(goodEnv)).toEqual({ missing: [], details: [] });
  });

  it("names missing variables and does not treat a quoted value as empty", () => {
    const problems = oauthConfigProblems({
      ...goodEnv,
      STRAVA_CLIENT_SECRET: "",
      SUPABASE_SERVICE_ROLE: "",
      SUPABASE_SERVICE_ROLE_KEY: '"role-key"',
    });
    expect(problems.missing).toEqual(["STRAVA_CLIENT_SECRET"]);
    expect(normalizeEnvValue('  "abc"  ')).toBe("abc");
  });

  it("rejects a Postgres URI used as SUPABASE_URL", () => {
    expect(supabaseUrlIssue("postgresql://postgres:pw@db.example.supabase.co:5432/postgres")).toMatch(
      /Postgres connection string/
    );
    const problems = oauthConfigProblems({
      ...goodEnv,
      SUPABASE_URL: "postgresql://postgres:pw@db.example.supabase.co:5432/postgres",
    });
    expect(problems.missing).not.toContain("SUPABASE_URL");
    expect(problems.details[0]).toMatch(/Project URL/);
  });

  it("requires the Strava callback path", () => {
    expect(redirectUriIssue("https://switchbacklabsco.com/training")).toMatch(/\/api\/strava\/callback/);
    expect(redirectUriIssue("https://switchbacklabsco.com/api/strava/callback")).toBeNull();
    expect(redirectUriIssue("http://localhost:3000/api/strava/callback")).toBeNull();
  });
});

describe("decideTrainingGate", () => {
  const clear = { missing: [], details: [] };

  it("sends an anonymous visitor to Strava when the session store is reachable", () => {
    expect(
      decideTrainingGate({
        error: null,
        config: clear,
        riderId: null,
        tokenStatus: "unchecked",
        supabaseReachable: true,
      })
    ).toEqual({ type: "redirect", to: authorizePath("/race-trackingV2") });
  });

  it("sends a rider who already has a token to the race tracker", () => {
    expect(
      decideTrainingGate({
        error: null,
        config: clear,
        riderId: "rider-1",
        tokenStatus: "present",
        supabaseReachable: true,
      })
    ).toEqual({ type: "redirect", to: "/race-trackingV2" });
  });

  it("shows configuration errors instead of redirecting", () => {
    const action = decideTrainingGate({
      error: null,
      config: { missing: ["STRAVA_CLIENT_SECRET"], details: [] },
      riderId: null,
      tokenStatus: "unchecked",
      supabaseReachable: null,
    });
    expect(action).toMatchObject({ type: "error", code: "server_misconfigured" });
  });

  it("shows a session-store error when Supabase cannot be reached", () => {
    const action = decideTrainingGate({
      error: null,
      config: clear,
      riderId: null,
      tokenStatus: "unchecked",
      supabaseReachable: false,
    });
    expect(action).toMatchObject({ type: "error", code: "session_store_unreachable" });
  });

  it("keeps an auth error on the page instead of starting OAuth again", () => {
    const action = decideTrainingGate({
      error: "access_denied",
      config: clear,
      riderId: null,
      tokenStatus: "unchecked",
      supabaseReachable: true,
    });
    expect(action).toMatchObject({ type: "error", code: "access_denied" });
    expect(authErrorCopy("access_denied").title).toMatch(/denied/i);
  });

  it("reconnects when the cookie exists but the token row does not", () => {
    expect(
      decideTrainingGate({
        error: null,
        config: clear,
        riderId: "rider-1",
        tokenStatus: "missing",
        supabaseReachable: true,
      })
    ).toEqual({ type: "redirect", to: authorizePath("/race-trackingV2") });
  });
});

describe("callback redirects", () => {
  it("lands a successful /training login on the tracker with connected=1", () => {
    expect(successRedirectPath("/training")).toBe("/race-trackingV2?connected=1");
    expect(successRedirectPath("/training?connected=1")).toBe("/race-trackingV2?connected=1");
    expect(successRedirectPath(undefined)).toBe("/race-trackingV2?connected=1");
  });

  it("preserves a safe in-app next path and rejects open redirects", () => {
    expect(successRedirectPath("/training/plan")).toBe("/training/plan?connected=1");
    expect(successRedirectPath("/race-trackingV2?tab=mine")).toBe("/race-trackingV2?tab=mine&connected=1");
    expect(successRedirectPath("https://evil.example/phish")).toBe("/race-trackingV2?connected=1");
    expect(successRedirectPath("//evil.example")).toBe("/race-trackingV2?connected=1");
  });

  it("builds an error path without echoing unknown env names", () => {
    expect(trainingErrorPath("access_denied")).toBe("/training?error=access_denied");
    expect(trainingErrorPath("server_misconfigured", ["STRAVA_CLIENT_SECRET", "NOT_A_SECRET"])).toBe(
      "/training?error=server_misconfigured&missing=STRAVA_CLIENT_SECRET"
    );
    expect(sanitizeMissingList("SUPABASE_URL,password")).toEqual(["SUPABASE_URL"]);
  });
});
