import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { normalizeEnvValue } from "./trainingGate";
import { DISCLAIMER_VERSION } from "./trainingDisclaimerCopy";

export { DISCLAIMER_TEXT, DISCLAIMER_VERSION } from "./trainingDisclaimerCopy";

export const DISCLAIMER_COOKIE_NAME = "training_disclaimer";

/** Long enough that a returning browser is not asked on every visit. */
export const DISCLAIMER_TTL_MS = 180 * 24 * 60 * 60 * 1000;

export type DisclaimerAcceptance = {
  version: string;
  acceptedAt: number;
};

export function disclaimerCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: Math.floor(DISCLAIMER_TTL_MS / 1000),
  };
}

function keyFromSecret(secret: string): Buffer {
  return createHash("sha256").update(secret, "utf8").digest();
}

export function sealDisclaimer(secret: string | undefined, now = Date.now()): string {
  const raw = normalizeEnvValue(secret);
  if (raw.length < 32) throw new Error("missing_session_secret");
  const payload: DisclaimerAcceptance = { version: DISCLAIMER_VERSION, acceptedAt: now };
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", keyFromSecret(raw), iv);
  const body = Buffer.concat([cipher.update(JSON.stringify(payload), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return ["v1", iv.toString("base64url"), body.toString("base64url"), tag.toString("base64url")].join(".");
}

/** Current-version acceptance, or null if missing, forged, expired, or from an older version. */
export function openDisclaimer(
  token: string | undefined,
  secret: string | undefined,
  now = Date.now()
): DisclaimerAcceptance | null {
  const raw = normalizeEnvValue(secret);
  if (!token || raw.length < 32) return null;
  const parts = token.split(".");
  if (parts.length !== 4 || parts[0] !== "v1") return null;
  try {
    const iv = Buffer.from(parts[1], "base64url");
    const body = Buffer.from(parts[2], "base64url");
    const tag = Buffer.from(parts[3], "base64url");
    if (iv.length !== 12 || tag.length !== 16) return null;
    const decipher = createDecipheriv("aes-256-gcm", keyFromSecret(raw), iv);
    decipher.setAuthTag(tag);
    const json = Buffer.concat([decipher.update(body), decipher.final()]).toString("utf8");
    const parsed = JSON.parse(json) as Partial<DisclaimerAcceptance>;
    if (parsed.version !== DISCLAIMER_VERSION) return null;
    if (typeof parsed.acceptedAt !== "number" || !Number.isFinite(parsed.acceptedAt)) return null;
    if (parsed.acceptedAt + DISCLAIMER_TTL_MS <= now) return null;
    return { version: parsed.version, acceptedAt: parsed.acceptedAt };
  } catch {
    return null;
  }
}

/**
 * A plan request is accepted only when the body names the current version
 * and this browser already stored that acceptance.
 */
export function planDisclaimerGate(input: {
  bodyVersion: unknown;
  cookie: string | undefined;
  secret: string | undefined;
  now?: number;
}): { ok: true } | { ok: false } {
  if (input.bodyVersion !== DISCLAIMER_VERSION) return { ok: false };
  const stored = openDisclaimer(input.cookie, input.secret, input.now);
  if (!stored) return { ok: false };
  return { ok: true };
}
