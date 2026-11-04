import { createCipheriv, createDecipheriv, randomBytes, createHash } from "crypto";
import { normalizeEnvValue } from "./trainingGate";

/** httpOnly cookie. Holds the Strava token for this browser session only. */
export const TRAINING_COOKIE_NAME = "training_strava";

/** Absolute session lifetime. Refreshing the Strava token does not extend it. */
export const TRAINING_SESSION_TTL_MS = 14 * 24 * 60 * 60 * 1000;

export type TrainingSession = {
  accessToken: string;
  refreshToken: string;
  /** Strava access-token expiry, unix milliseconds. */
  expiresAt: number;
  athleteId: number | null;
  /** Cookie expiry, unix milliseconds. */
  sealedUntil: number;
};

export function trainingCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: Math.floor(TRAINING_SESSION_TTL_MS / 1000),
  };
}

function keyFromSecret(secret: string): Buffer {
  return createHash("sha256").update(secret, "utf8").digest();
}

export function createTrainingSession(
  input: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    athleteId?: number | null;
  },
  now = Date.now()
): TrainingSession {
  return {
    accessToken: input.accessToken,
    refreshToken: input.refreshToken,
    expiresAt: input.expiresAt,
    athleteId: input.athleteId ?? null,
    sealedUntil: now + TRAINING_SESSION_TTL_MS,
  };
}

/** Encrypt a session for the cookie. Throws if the secret is missing or too short. */
export function sealTrainingSession(session: TrainingSession, secret: string | undefined): string {
  const raw = normalizeEnvValue(secret);
  if (raw.length < 32) {
    throw new Error("missing_session_secret");
  }
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", keyFromSecret(raw), iv);
  const body = Buffer.concat([
    cipher.update(JSON.stringify(session), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return ["v1", iv.toString("base64url"), body.toString("base64url"), tag.toString("base64url")].join(".");
}

/** Decrypt a cookie. Returns null if it is missing, tampered, expired, or the secret is wrong. */
export function openTrainingSession(
  token: string | undefined,
  secret: string | undefined,
  now = Date.now()
): TrainingSession | null {
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
    const parsed = JSON.parse(json) as Partial<TrainingSession>;
    if (!isSession(parsed)) return null;
    if (parsed.sealedUntil <= now) return null;
    return parsed;
  } catch {
    return null;
  }
}

function isSession(value: Partial<TrainingSession>): value is TrainingSession {
  return (
    typeof value.accessToken === "string" &&
    value.accessToken.length > 0 &&
    typeof value.refreshToken === "string" &&
    value.refreshToken.length > 0 &&
    typeof value.expiresAt === "number" &&
    Number.isFinite(value.expiresAt) &&
    typeof value.sealedUntil === "number" &&
    Number.isFinite(value.sealedUntil) &&
    (value.athleteId === null || typeof value.athleteId === "number")
  );
}
