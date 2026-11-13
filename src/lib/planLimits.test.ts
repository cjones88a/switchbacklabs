import { describe, expect, it, vi } from "vitest";
import {
  MemoryPlanLimitStore,
  PLAN_LIMIT_GLOBAL_PER_DAY,
  PLAN_LIMIT_PER_DAY,
  PLAN_LIMIT_PER_HOUR,
  clientIp,
  consumePlanGeneration,
  planLimitIdentity,
  rateLimitMessage,
  resolvePlanLimits,
} from "./planLimits";
import { readUpstashConfig, upstashStore } from "./upstashRest";

const NOW = Date.parse("2026-11-13T15:30:00.000Z");
const LIMITS = { perUserPerHour: 4, perUserPerDay: 12, globalPerDay: 40 };

describe("plan generation limits", () => {
  it("uses the athlete id before the IP", () => {
    expect(planLimitIdentity(42, "203.0.113.8")).toBe("athlete:42");
    expect(planLimitIdentity(null, "203.0.113.8")).toBe("ip:203.0.113.8");
    expect(planLimitIdentity(null, null)).toBe("anonymous");
  });

  it("reads the first forwarded address and ignores junk", () => {
    expect(clientIp(new Headers({ "x-forwarded-for": "203.0.113.8, 10.0.0.1" }))).toBe("203.0.113.8");
    expect(clientIp(new Headers({ "x-real-ip": "2001:db8::1" }))).toBe("2001:db8::1");
    expect(clientIp(new Headers({ "x-forwarded-for": "not an ip" }))).toBeNull();
  });

  it("allows the hourly cap and refuses the next plan", async () => {
    const store = new MemoryPlanLimitStore();
    for (let i = 0; i < LIMITS.perUserPerHour; i++) {
      const decision = await consumePlanGeneration({
        athleteId: 7,
        ip: null,
        now: NOW,
        limits: LIMITS,
        store,
      });
      expect(decision.ok).toBe(true);
    }
    const denied = await consumePlanGeneration({
      athleteId: 7,
      ip: null,
      now: NOW,
      limits: LIMITS,
      store,
    });
    expect(denied).toMatchObject({ ok: false, scope: "hour" });
    if (!denied.ok) {
      expect(rateLimitMessage(denied)).toMatch(/last hour/);
      expect(denied.retryAfterSeconds).toBeGreaterThan(0);
    }
  });

  it("counts a different athlete separately and still applies the global cap", async () => {
    const store = new MemoryPlanLimitStore();
    const limits = { perUserPerHour: 100, perUserPerDay: 100, globalPerDay: 2 };
    expect(
      (await consumePlanGeneration({ athleteId: 1, ip: null, now: NOW, limits, store })).ok
    ).toBe(true);
    expect(
      (await consumePlanGeneration({ athleteId: 2, ip: null, now: NOW, limits, store })).ok
    ).toBe(true);
    const denied = await consumePlanGeneration({ athleteId: 3, ip: null, now: NOW, limits, store });
    expect(denied).toMatchObject({ ok: false, scope: "global" });
    if (!denied.ok) expect(rateLimitMessage(denied)).toMatch(/rest of the day/);
  });

  it("refuses the next plan after the daily cap", async () => {
    const store = new MemoryPlanLimitStore();
    const limits = { perUserPerHour: 100, perUserPerDay: 1, globalPerDay: 100 };
    expect(
      (await consumePlanGeneration({ athleteId: 4, ip: null, now: NOW, limits, store })).ok
    ).toBe(true);
    const denied = await consumePlanGeneration({ athleteId: 4, ip: null, now: NOW, limits, store });
    expect(denied).toMatchObject({ ok: false, scope: "day" });
    if (!denied.ok) expect(rateLimitMessage(denied)).toMatch(/today/);
  });

  it("resets the hourly bucket in the next hour", async () => {
    const store = new MemoryPlanLimitStore();
    const limits = { perUserPerHour: 1, perUserPerDay: 10, globalPerDay: 10 };
    await consumePlanGeneration({ athleteId: 9, ip: null, now: NOW, limits, store });
    const nextHour = Date.parse("2026-11-13T16:00:00.000Z");
    const decision = await consumePlanGeneration({
      athleteId: 9,
      ip: null,
      now: nextHour,
      limits,
      store,
    });
    expect(decision.ok).toBe(true);
  });

  it("keeps the documented defaults and ignores a bad override", () => {
    expect(resolvePlanLimits({})).toEqual({
      perUserPerHour: PLAN_LIMIT_PER_HOUR,
      perUserPerDay: PLAN_LIMIT_PER_DAY,
      globalPerDay: PLAN_LIMIT_GLOBAL_PER_DAY,
    });
    expect(
      resolvePlanLimits({ PLAN_LIMIT_PER_HOUR: "2", PLAN_LIMIT_PER_DAY: "nope" })
    ).toMatchObject({ perUserPerHour: 2, perUserPerDay: PLAN_LIMIT_PER_DAY });
  });

  it("uses Upstash only when both env vars are an Upstash REST endpoint", async () => {
    expect(readUpstashConfig({})).toBeNull();
    expect(
      readUpstashConfig({
        UPSTASH_REDIS_REST_URL: "http://evil.example",
        UPSTASH_REDIS_REST_TOKEN: "secret-token",
      })
    ).toBeNull();

    const fetchImpl = vi.fn(async (_url: string, init?: RequestInit) => {
      const command = JSON.parse(String(init?.body));
      const header = new Headers(init?.headers).get("authorization");
      expect(header).toBe("Bearer secret-token");
      expect(String(init?.body)).not.toContain("console.log");
      if (command[0] === "INCR") {
        return new Response(JSON.stringify({ result: 1 }), { status: 200 });
      }
      return new Response(JSON.stringify({ result: 1 }), { status: 200 });
    });
    const store = upstashStore(
      { url: "https://example.upstash.io", token: "secret-token" },
      fetchImpl as unknown as typeof fetch
    );
    await expect(store.increment("plan:athlete:1:h:2026", 60, NOW)).resolves.toBe(1);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });
});
