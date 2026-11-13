/** Pure decisions for the training app's Strava session. No I/O, no secrets logged. */

export const TRAINING_APP_PATH = "/training";

const KNOWN_ENV = [
  "STRAVA_CLIENT_ID",
  "STRAVA_CLIENT_SECRET",
  "STRAVA_REDIRECT_URI",
  "TRAINING_SESSION_SECRET",
] as const;

export type TrainingEnv = {
  STRAVA_CLIENT_ID?: string;
  STRAVA_CLIENT_SECRET?: string;
  STRAVA_REDIRECT_URI?: string;
  TRAINING_SESSION_SECRET?: string;
};

export type ConfigProblems = {
  missing: string[];
  details: string[];
};

export type TrainingEntry =
  | { type: "error"; code: string; missing: string[]; details: string[] }
  | { type: "signed_out" }
  | { type: "app" };

export function readOAuthEnv(env: NodeJS.ProcessEnv = process.env) {
  return {
    STRAVA_CLIENT_ID: normalizeEnvValue(env.STRAVA_CLIENT_ID),
    STRAVA_CLIENT_SECRET: normalizeEnvValue(env.STRAVA_CLIENT_SECRET),
    STRAVA_REDIRECT_URI: normalizeEnvValue(env.STRAVA_REDIRECT_URI),
    TRAINING_SESSION_SECRET: normalizeEnvValue(env.TRAINING_SESSION_SECRET),
  };
}

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

export function sessionSecretIssue(secret: string | undefined): string | null {
  const raw = normalizeEnvValue(secret);
  if (!raw) return "TRAINING_SESSION_SECRET is not set.";
  if (raw.length < 32) {
    return "TRAINING_SESSION_SECRET must be at least 32 characters. Generate one with: openssl rand -base64 32";
  }
  return null;
}

/** Strava app settings plus the cookie secret. */
export function trainingConfigProblems(env: TrainingEnv | NodeJS.ProcessEnv): ConfigProblems {
  const missing: string[] = [];
  const details: string[] = [];
  const redirectUri = normalizeEnvValue(env.STRAVA_REDIRECT_URI);
  const secret = normalizeEnvValue(env.TRAINING_SESSION_SECRET);

  if (!normalizeEnvValue(env.STRAVA_CLIENT_ID)) missing.push("STRAVA_CLIENT_ID");
  if (!normalizeEnvValue(env.STRAVA_CLIENT_SECRET)) missing.push("STRAVA_CLIENT_SECRET");

  const redirectIssue = redirectUriIssue(redirectUri);
  if (!redirectUri) missing.push("STRAVA_REDIRECT_URI");
  else if (redirectIssue) details.push(redirectIssue);

  const secretIssue = sessionSecretIssue(secret);
  if (!secret) missing.push("TRAINING_SESSION_SECRET");
  else if (secretIssue) details.push(secretIssue);

  return { missing, details };
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

export function trainingErrorPath(code: string, missing?: string[]): string {
  const params = new URLSearchParams();
  params.set("error", normalizeOAuthError(code) ?? "missing_code");
  const safeMissing = sanitizeMissingList(missing?.join(","));
  if (safeMissing.length) params.set("missing", safeMissing.join(","));
  return `${TRAINING_APP_PATH}?${params.toString()}`;
}

export function authorizePath(next: string = TRAINING_APP_PATH): string {
  const params = new URLSearchParams();
  params.set("next", next);
  return `/api/strava/authorize?${params.toString()}`;
}

/** Where to send the browser after a successful token exchange. */
export function successRedirectPath(next: string | null | undefined): string {
  const fallback = `${TRAINING_APP_PATH}?connected=1`;
  if (!next || typeof next !== "string") return fallback;
  const candidate = next.trim();
  if (!isSafeNextPath(candidate)) return fallback;
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

export function trainingEntryDecision(input: {
  error: string | null;
  config: ConfigProblems;
  hasSession: boolean;
}): TrainingEntry {
  const error = normalizeOAuthError(input.error);
  if (error) {
    const fromConfig = error === "server_misconfigured";
    return {
      type: "error",
      code: error,
      missing: fromConfig ? input.config.missing : [],
      details: fromConfig ? input.config.details : [],
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
  if (!input.hasSession) return { type: "signed_out" };
  return { type: "app" };
}

export type AuthErrorCopy = { title: string; body: string };

const ERROR_COPY: Record<string, AuthErrorCopy> = {
  access_denied: {
    title: "Strava access was denied",
    body: "The training plan needs read-only access to your activities. Connect again and approve the request on Strava. Nothing is written to a database.",
  },
  missing_code: {
    title: "Strava did not finish connecting",
    body: "No authorization code came back from Strava. Start the connection again. If Strava shows a redirect error, set the app’s Authorization Callback Domain to switchbacklabsco.com.",
  },
  token_exchange_failed: {
    title: "Strava rejected the login",
    body: "The authorization code could not be exchanged for a token. In the Strava API settings, set Authorization Callback Domain to switchbacklabsco.com. In Vercel (Production), set STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, and STRAVA_REDIRECT_URI to https://switchbacklabsco.com/api/strava/callback.",
  },
  invalid_token_response: {
    title: "Strava returned an incomplete login",
    body: "Strava did not return access and refresh tokens. Approve the requested permissions (read and activity:read_all) and try again.",
  },
  token_refresh_failed: {
    title: "Your Strava session expired",
    body: "The saved session could not be refreshed with Strava. Connect again. The previous token lived only in your browser cookie and has been dropped.",
  },
  server_misconfigured: {
    title: "Strava login is not configured",
    body: "The training app needs Strava credentials and a session secret before it can connect. Set the items below in Vercel → Project → Settings → Environment Variables for Production, then redeploy. Tokens stay in an encrypted cookie.",
  },
  session_store_unreachable: {
    title: "The session could not be saved",
    body: "The login finished, but the encrypted session cookie could not be set. Confirm TRAINING_SESSION_SECRET is set in Vercel and try again.",
  },
};

export function authErrorCopy(code: string | null | undefined): AuthErrorCopy {
  const normalized = normalizeOAuthError(code) ?? "missing_code";
  return (
    ERROR_COPY[normalized] ?? {
      title: "Strava could not be connected",
      body: "Something went wrong during Strava login. Try again. If it keeps failing, confirm the Strava callback domain, the Strava env vars, and TRAINING_SESSION_SECRET.",
    }
  );
}

export function showConnectAction(code: string): boolean {
  return code !== "server_misconfigured";
}
