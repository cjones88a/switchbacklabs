/** Pure decisions for the /training Strava gate. No I/O, no secrets. */

export const RACE_TRACKER_PATH = "/race-trackingV2";
export const TRAINING_GATE_PATH = "/training";

const KNOWN_ENV = [
  "STRAVA_CLIENT_ID",
  "STRAVA_CLIENT_SECRET",
  "STRAVA_REDIRECT_URI",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE",
] as const;

export type KnownEnvName = (typeof KNOWN_ENV)[number];

export type OAuthEnv = {
  STRAVA_CLIENT_ID?: string;
  STRAVA_CLIENT_SECRET?: string;
  STRAVA_REDIRECT_URI?: string;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
};

export type ConfigProblems = {
  missing: string[];
  details: string[];
};

export type TokenStatus = "present" | "missing" | "unreachable" | "rejected" | "unchecked";

export type GateAction =
  | { type: "error"; code: string; missing: string[]; details: string[] }
  | { type: "redirect"; to: string };

export function normalizeEnvValue(value: string | undefined): string {
  let v = (value ?? "").trim();
  if (
    (v.startsWith('"') && v.endsWith('"') && v.length >= 2) ||
    (v.startsWith("'") && v.endsWith("'") && v.length >= 2)
  ) {
    v = v.slice(1, -1).trim();
  }
  return v;
}

export function readOAuthEnv(env: NodeJS.ProcessEnv = process.env): OAuthEnv {
  return {
    STRAVA_CLIENT_ID: normalizeEnvValue(env.STRAVA_CLIENT_ID),
    STRAVA_CLIENT_SECRET: normalizeEnvValue(env.STRAVA_CLIENT_SECRET),
    STRAVA_REDIRECT_URI: normalizeEnvValue(env.STRAVA_REDIRECT_URI),
    SUPABASE_URL: normalizeEnvValue(env.SUPABASE_URL),
    SUPABASE_SERVICE_ROLE: normalizeEnvValue(env.SUPABASE_SERVICE_ROLE),
    SUPABASE_SERVICE_ROLE_KEY: normalizeEnvValue(env.SUPABASE_SERVICE_ROLE_KEY),
  };
}

/** What is wrong with SUPABASE_URL, or null when it is usable. */
export function supabaseUrlIssue(url: string | undefined): string | null {
  const raw = normalizeEnvValue(url);
  if (!raw) return "SUPABASE_URL is not set.";
  if (raw.startsWith("postgres://") || raw.startsWith("postgresql://")) {
    return "SUPABASE_URL is a Postgres connection string. Set it to the Project URL from Supabase → Project Settings → API (https://<project-ref>.supabase.co), not the database URI.";
  }
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return "SUPABASE_URL is not a valid URL. Use the Project URL from Supabase → Project Settings → API.";
  }
  const localHttp =
    parsed.protocol === "http:" &&
    (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1");
  if (parsed.protocol !== "https:" && !localHttp) {
    return "SUPABASE_URL must be the https Project URL (https://<project-ref>.supabase.co).";
  }
  if (parsed.pathname && parsed.pathname !== "/") {
    return "SUPABASE_URL should be the project origin only (https://<project-ref>.supabase.co) with no path.";
  }
  if (parsed.username || parsed.password) {
    return "SUPABASE_URL should not include a username or password. Use the Project URL, and put the service role key in SUPABASE_SERVICE_ROLE.";
  }
  return null;
}

/** What is wrong with STRAVA_REDIRECT_URI, or null when it can be sent to Strava. */
export function redirectUriIssue(uri: string | undefined): string | null {
  const raw = normalizeEnvValue(uri);
  if (!raw) return "STRAVA_REDIRECT_URI is not set.";
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return "STRAVA_REDIRECT_URI is not a valid URL.";
  }
  const localHttp =
    parsed.protocol === "http:" &&
    (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1");
  if (parsed.protocol !== "https:" && !localHttp) {
    return "STRAVA_REDIRECT_URI must be https, or http://localhost for local development.";
  }
  if (parsed.pathname !== "/api/strava/callback") {
    return "STRAVA_REDIRECT_URI must use the path /api/strava/callback. In production set it to https://switchbacklabsco.com/api/strava/callback.";
  }
  return null;
}

export function oauthConfigProblems(env: OAuthEnv | NodeJS.ProcessEnv): ConfigProblems {
  const missing: string[] = [];
  const details: string[] = [];
  const redirectUri = normalizeEnvValue(env.STRAVA_REDIRECT_URI);
  const supabaseUrl = normalizeEnvValue(env.SUPABASE_URL);
  const serviceRole =
    normalizeEnvValue(env.SUPABASE_SERVICE_ROLE) ||
    normalizeEnvValue(env.SUPABASE_SERVICE_ROLE_KEY);

  if (!normalizeEnvValue(env.STRAVA_CLIENT_ID)) missing.push("STRAVA_CLIENT_ID");
  if (!normalizeEnvValue(env.STRAVA_CLIENT_SECRET)) missing.push("STRAVA_CLIENT_SECRET");

  const redirectIssue = redirectUriIssue(redirectUri);
  if (!redirectUri) missing.push("STRAVA_REDIRECT_URI");
  else if (redirectIssue) details.push(redirectIssue);

  const urlIssue = supabaseUrlIssue(supabaseUrl);
  if (!supabaseUrl) missing.push("SUPABASE_URL");
  else if (urlIssue) details.push(urlIssue);

  if (!serviceRole) missing.push("SUPABASE_SERVICE_ROLE");

  return { missing, details };
}

export function authorizeEnvProblems(env: OAuthEnv | NodeJS.ProcessEnv): ConfigProblems {
  const full = oauthConfigProblems(env);
  return {
    missing: full.missing.filter((name) => name === "STRAVA_CLIENT_ID" || name === "STRAVA_REDIRECT_URI"),
    details: full.details.filter((line) => line.includes("STRAVA_REDIRECT_URI") || line.includes("/api/strava/callback")),
  };
}

export function configIsBlocking(problems: ConfigProblems): boolean {
  return problems.missing.length > 0 || problems.details.length > 0;
}

export function sanitizeMissingList(raw: string | null | undefined): string[] {
  if (!raw) return [];
  const allowed = new Set<string>(KNOWN_ENV);
  const out: string[] = [];
  for (const part of raw.split(",")) {
    const name = part.trim();
    if (allowed.has(name) && !out.includes(name)) out.push(name);
  }
  return out;
}

export function normalizeOAuthError(error: string | null | undefined): string | null {
  if (!error) return null;
  const code = error.trim().toLowerCase();
  if (!/^[a-z0-9_]{1,40}$/.test(code)) return "missing_code";
  return code;
}

export function isFetchFailureMessage(message: string | null | undefined): boolean {
  if (!message) return false;
  return /fetch failed|enotfound|econnrefused|etimedout|eai_again|certificate|unable to verify/i.test(message);
}

export function trainingErrorPath(code: string, missing?: string[]): string {
  const params = new URLSearchParams();
  params.set("error", normalizeOAuthError(code) ?? "missing_code");
  const safeMissing = sanitizeMissingList(missing?.join(","));
  if (safeMissing.length) params.set("missing", safeMissing.join(","));
  return `${TRAINING_GATE_PATH}?${params.toString()}`;
}

export function authorizePath(next: string = RACE_TRACKER_PATH): string {
  const params = new URLSearchParams();
  params.set("next", next);
  return `/api/strava/authorize?${params.toString()}`;
}

/** Where to send the browser after a successful token exchange. */
export function successRedirectPath(next: string | null | undefined): string {
  const fallback = `${RACE_TRACKER_PATH}?connected=1`;
  if (!next || typeof next !== "string") return fallback;
  const candidate = next.trim();
  if (!isSafeNextPath(candidate)) return fallback;
  const pathOnly = candidate.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
  // /training is this auth gate. Sending the athlete back here drops ?connected=1,
  // which the tracker uses to import history.
  if (pathOnly === TRAINING_GATE_PATH) return fallback;
  return candidate.includes("?") ? `${candidate}&connected=1` : `${candidate}?connected=1`;
}

export function isSafeNextPath(candidate: string): boolean {
  if (!candidate.startsWith("/")) return false;
  if (candidate.startsWith("//")) return false;
  if (candidate.includes("\\")) return false;
  if (candidate.includes("://")) return false;
  if (/[\s@]/.test(candidate)) return false;
  return true;
}

export function decideTrainingGate(input: {
  error: string | null;
  config: ConfigProblems;
  riderId: string | null;
  tokenStatus: TokenStatus;
  supabaseReachable: boolean | null;
}): GateAction {
  const error = normalizeOAuthError(input.error);
  if (error) {
    const fromQuery = error === "server_misconfigured";
    return {
      type: "error",
      code: error,
      missing: fromQuery ? input.config.missing : [],
      details: fromQuery ? input.config.details : [],
    };
  }
  if (configIsBlocking(input.config)) {
    return {
      type: "error",
      code: "server_misconfigured",
      missing: input.config.missing,
      details: input.config.details,
    };
  }
  if (input.riderId && input.tokenStatus === "present") {
    return { type: "redirect", to: RACE_TRACKER_PATH };
  }
  if (input.riderId && input.tokenStatus === "unreachable") {
    return { type: "error", code: "session_store_unreachable", missing: [], details: [] };
  }
  if (input.riderId && input.tokenStatus === "rejected") {
    return { type: "error", code: "session_lookup_failed", missing: [], details: [] };
  }
  if (input.supabaseReachable === false) {
    return { type: "error", code: "session_store_unreachable", missing: [], details: [] };
  }
  return { type: "redirect", to: authorizePath(RACE_TRACKER_PATH) };
}

export type AuthErrorCopy = { title: string; body: string };

const ERROR_COPY: Record<string, AuthErrorCopy> = {
  access_denied: {
    title: "Strava access was denied",
    body: "The race tracker needs read-only access to your activities. Connect again and approve the request on Strava.",
  },
  missing_code: {
    title: "Strava did not finish connecting",
    body: "No authorization code came back from Strava. Start the connection again. If Strava shows a redirect error, set the app’s Authorization Callback Domain to switchbacklabsco.com.",
  },
  token_exchange_failed: {
    title: "Strava rejected the login",
    body: "The authorization code could not be exchanged for a token. In the Strava API settings, set Authorization Callback Domain to switchbacklabsco.com. In Vercel (Production), set STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, and STRAVA_REDIRECT_URI to https://switchbacklabsco.com/api/strava/callback. The secret must belong to that same Strava app.",
  },
  invalid_token_response: {
    title: "Strava returned an incomplete login",
    body: "Strava did not return an athlete profile and tokens. Approve the requested permissions (read and activity:read_all) and try again.",
  },
  rider_upsert_failed: {
    title: "Your Strava profile could not be saved",
    body: "Strava login succeeded, but the rider row could not be written. Confirm the Supabase project has a public.riders table (strava_athlete_id unique) and that SUPABASE_URL and SUPABASE_SERVICE_ROLE point at that project.",
  },
  token_store_failed: {
    title: "Your Strava token could not be saved",
    body: "Strava login succeeded, but the access token could not be written to oauth_tokens. Confirm that table exists with rider_id as the primary key, and that the service role key matches SUPABASE_URL.",
  },
  server_misconfigured: {
    title: "Strava login is not configured",
    body: "The server is missing a setting it needs before it can connect Strava and open the race tracker. Set the items below in Vercel → Project → Settings → Environment Variables for Production, then redeploy.",
  },
  session_store_unreachable: {
    title: "The session store is unreachable",
    body: "The server could not reach Supabase, so it cannot save or read your Strava session. In Vercel, set SUPABASE_URL to the Project URL (https://<project-ref>.supabase.co) and SUPABASE_SERVICE_ROLE to the service_role key for that same project. If the Supabase project is paused, restore it, then try again.",
  },
  session_expired: {
    title: "Your Strava session expired",
    body: "This browser has a rider session, but there is no Strava token stored for it. Connect again to open the race tracker.",
  },
  session_lookup_failed: {
    title: "Your session could not be read",
    body: "Supabase responded, but the stored Strava session could not be read. Confirm SUPABASE_SERVICE_ROLE is the service_role key for this SUPABASE_URL, and that the oauth_tokens table exists.",
  },
};

export function authErrorCopy(code: string | null | undefined): AuthErrorCopy {
  const normalized = normalizeOAuthError(code) ?? "missing_code";
  return (
    ERROR_COPY[normalized] ?? {
      title: "Strava could not be connected",
      body: "Something went wrong during Strava login. Try again. If it keeps failing, confirm the Strava callback domain and the Vercel Strava and Supabase environment variables.",
    }
  );
}

export function showConnectAction(code: string): boolean {
  return code !== "server_misconfigured" && code !== "session_store_unreachable";
}
