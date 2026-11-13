import { normalizeEnvValue } from "./trainingGate";
import { readUpstashConfig, upstashStore } from "./upstashRest";

/**
 * Plan-generation caps. Defaults live here. A positive integer in
 * PLAN_LIMIT_PER_HOUR, PLAN_LIMIT_PER_DAY, or PLAN_LIMIT_GLOBAL_PER_DAY
 * overrides that one cap without a code change.
 *
 * Without UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN these counters
 * live in this server process. On Vercel that is one short-lived instance:
 * a new instance starts at zero, and two instances do not share counts.
 * The global cap is therefore best-effort until Upstash is configured.
 */
export const PLAN_LIMIT_PER_HOUR = 4;
export const PLAN_LIMIT_PER_DAY = 12;
export const PLAN_LIMIT_GLOBAL_PER_DAY = 40;

export type PlanLimits = {
  perUserPerHour: number;
  perUserPerDay: number;
  globalPerDay: number;
};

export type PlanLimitDenial = {
  ok: false;
  scope: "hour" | "day" | "global";
  retryAfterSeconds: number;
};

export type PlanLimitDecision = { ok: true } | PlanLimitDenial;

export interface PlanLimitStore {
  /** Returns the count after this increment. The key expires after ttlSeconds. */
  increment(key: string, ttlSeconds: number, now: number): Promise<number>;
}

type Bucket = { count: number; expiresAt: number };

export class MemoryPlanLimitStore implements PlanLimitStore {
  private buckets = new Map<string, Bucket>();

  async increment(key: string, ttlSeconds: number, now: number): Promise<number> {
    this.prune(now);
    const existing = this.buckets.get(key);
    if (!existing || existing.expiresAt <= now) {
      this.buckets.set(key, { count: 1, expiresAt: now + ttlSeconds * 1000 });
      return 1;
    }
    existing.count += 1;
    return existing.count;
  }

  private prune(now: number) {
    if (this.buckets.size < 400) return;
    for (const [key, bucket] of this.buckets) {
      if (bucket.expiresAt <= now) this.buckets.delete(key);
    }
  }
}

const memoryStore = new MemoryPlanLimitStore();

export function resolvePlanLimits(
  env: Record<string, string | undefined> = process.env
): PlanLimits {
  return {
    perUserPerHour: positiveInt(env.PLAN_LIMIT_PER_HOUR, PLAN_LIMIT_PER_HOUR),
    perUserPerDay: positiveInt(env.PLAN_LIMIT_PER_DAY, PLAN_LIMIT_PER_DAY),
    globalPerDay: positiveInt(env.PLAN_LIMIT_GLOBAL_PER_DAY, PLAN_LIMIT_GLOBAL_PER_DAY),
  };
}

function positiveInt(raw: string | undefined, fallback: number): number {
  const text = normalizeEnvValue(raw);
  if (!text) return fallback;
  const value = Number(text);
  if (!Number.isInteger(value) || value < 1 || value > 100_000) return fallback;
  return value;
}

/** Prefer the Strava athlete id. Otherwise the caller IP. Otherwise one shared bucket. */
export function planLimitIdentity(athleteId: number | null, ip: string | null): string {
  if (athleteId != null && Number.isInteger(athleteId) && athleteId > 0) return `athlete:${athleteId}`;
  if (ip) return `ip:${ip}`;
  return "anonymous";
}

export function clientIp(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for");
  const raw = forwarded?.split(",")[0]?.trim() || headers.get("x-real-ip")?.trim() || "";
  if (!raw || raw.length > 64) return null;
  if (!/^[0-9a-fA-F:.]+$/.test(raw)) return null;
  return raw;
}

export function rateLimitMessage(denial: PlanLimitDenial): string {
  if (denial.scope === "hour") {
    return "You've generated several plans in the last hour. Wait a bit and try again.";
  }
  if (denial.scope === "day") {
    return "You've reached today's limit for training plans. Try again tomorrow.";
  }
  return "Training plan generation is paused for the rest of the day. Try again tomorrow.";
}

function utcParts(now: number) {
  const date = new Date(now);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hour = String(date.getUTCHours()).padStart(2, "0");
  const dayStamp = `${year}-${month}-${day}`;
  return { dayStamp, hourStamp: `${dayStamp}T${hour}` };
}

function secondsUntil(now: number, endMs: number): number {
  return Math.max(1, Math.ceil((endMs - now) / 1000));
}

export async function consumePlanGeneration(input: {
  athleteId: number | null;
  ip: string | null;
  now?: number;
  limits?: PlanLimits;
  store?: PlanLimitStore;
}): Promise<PlanLimitDecision> {
  const now = input.now ?? Date.now();
  const limits = input.limits ?? resolvePlanLimits();
  const store = input.store ?? getPlanLimitStore();
  const identity = planLimitIdentity(input.athleteId, input.ip);
  const { dayStamp, hourStamp } = utcParts(now);
  const hourEnd = Date.parse(`${hourStamp}:00:00.000Z`) + 60 * 60 * 1000;
  const dayEnd = Date.parse(`${dayStamp}T00:00:00.000Z`) + 24 * 60 * 60 * 1000;
  const hourTtl = secondsUntil(now, hourEnd);
  const dayTtl = secondsUntil(now, dayEnd);

  const hourCount = await store.increment(`plan:${identity}:h:${hourStamp}`, hourTtl, now);
  const dayCount = await store.increment(`plan:${identity}:d:${dayStamp}`, dayTtl, now);
  const globalCount = await store.increment(`plan:global:d:${dayStamp}`, dayTtl, now);

  if (globalCount > limits.globalPerDay) {
    return { ok: false, scope: "global", retryAfterSeconds: dayTtl };
  }
  if (dayCount > limits.perUserPerDay) {
    return { ok: false, scope: "day", retryAfterSeconds: dayTtl };
  }
  if (hourCount > limits.perUserPerHour) {
    return { ok: false, scope: "hour", retryAfterSeconds: hourTtl };
  }
  return { ok: true };
}

class FallbackPlanLimitStore implements PlanLimitStore {
  constructor(
    private primary: PlanLimitStore,
    private fallback: PlanLimitStore
  ) {}

  async increment(key: string, ttlSeconds: number, now: number): Promise<number> {
    try {
      return await this.primary.increment(key, ttlSeconds, now);
    } catch {
      console.error("[plan-limits] durable counter unavailable; using this instance");
      return this.fallback.increment(key, ttlSeconds, now);
    }
  }
}

export function getPlanLimitStore(
  env: Record<string, string | undefined> = process.env
): PlanLimitStore {
  const upstash = readUpstashConfig(env);
  if (!upstash) return memoryStore;
  return new FallbackPlanLimitStore(upstashStore(upstash), memoryStore);
}
