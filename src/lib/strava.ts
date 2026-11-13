import { readOAuthEnv } from "./trainingGate";

const STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token";

export function getAuthorizeURL(stateObj: unknown) {
  const cfg = readOAuthEnv();
  const url = new URL("https://www.strava.com/oauth/authorize");
  url.searchParams.set("client_id", cfg.STRAVA_CLIENT_ID);
  url.searchParams.set("redirect_uri", cfg.STRAVA_REDIRECT_URI);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("approval_prompt", "auto");
  url.searchParams.set("scope", "read,activity:read_all");
  const state = Buffer.from(JSON.stringify(stateObj ?? {})).toString("base64url");
  url.searchParams.set("state", state);
  return url.toString();
}

export function decodeState<T extends object = Record<string, unknown>>(state?: string | null): T | null {
  if (!state) return null;
  try {
    return JSON.parse(Buffer.from(state, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

export async function exchangeCodeForToken(code: string) {
  const cfg = readOAuthEnv();
  if (!cfg.STRAVA_CLIENT_ID || !cfg.STRAVA_CLIENT_SECRET) {
    throw new Error("missing_strava_env");
  }
  const res = await fetch(STRAVA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: cfg.STRAVA_CLIENT_ID,
      client_secret: cfg.STRAVA_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) {
    console.error("[strava] token exchange failed", res.status);
    throw new Error("token_exchange_failed");
  }
  return res.json();
}
