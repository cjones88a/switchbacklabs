import { normalizeEnvValue } from "./trainingGate";
import type { PlanLimitStore } from "./planLimits";

/**
 * Optional durable counters. Set both env vars from the Vercel Upstash integration.
 * The hostname must be an Upstash REST endpoint. Nothing is provisioned from this app.
 */
export function readUpstashConfig(
  env: Record<string, string | undefined>
): { url: string; token: string } | null {
  const urlText = normalizeEnvValue(env.UPSTASH_REDIS_REST_URL);
  const token = normalizeEnvValue(env.UPSTASH_REDIS_REST_TOKEN);
  if (!urlText || !token) return null;
  let url: URL;
  try {
    url = new URL(urlText);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || !url.hostname.endsWith(".upstash.io")) return null;
  return { url: url.origin, token };
}

export function upstashStore(
  config: { url: string; token: string },
  fetchImpl: typeof fetch = fetch
): PlanLimitStore {
  return {
    async increment(key, ttlSeconds) {
      const count = await command(config, fetchImpl, ["INCR", key]);
      if (typeof count !== "number") throw new Error("upstash_shape");
      if (count === 1) {
        await command(config, fetchImpl, ["EXPIRE", key, String(ttlSeconds)]);
      }
      return count;
    },
  };
}

async function command(
  config: { url: string; token: string },
  fetchImpl: typeof fetch,
  args: string[]
): Promise<unknown> {
  const res = await fetchImpl(config.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
    signal: AbortSignal.timeout(4000),
  });
  if (!res.ok) throw new Error("upstash_http");
  const json = (await res.json()) as { result?: unknown; error?: string };
  if (json.error) throw new Error("upstash_error");
  return json.result;
}
