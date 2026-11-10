import { readFileSync } from "node:fs";
import Anthropic from "@anthropic-ai/sdk";
import { describe, expect, it } from "vitest";
import {
  PLAN_MAX_DURATION_SECONDS,
  PLAN_MAX_TOKENS,
  PLAN_REQUEST_MAX_RETRIES,
  PLAN_REQUEST_TIMEOUT_MS,
} from "./planRequest";

const messageBody = {
  id: "msg_test",
  type: "message",
  role: "assistant",
  model: "claude-sonnet-5-5",
  content: [{ type: "text", text: "ok" }],
  stop_reason: "end_turn",
  stop_sequence: null,
  usage: { input_tokens: 1, output_tokens: 1 },
};

describe("plan request budget", () => {
  it("stays inside the SDK non-streaming cap and the Vercel function budget", () => {
    expect(PLAN_MAX_TOKENS).toBeLessThanOrEqual(21333);
    expect(PLAN_REQUEST_TIMEOUT_MS * 2).toBeLessThan(PLAN_MAX_DURATION_SECONDS * 1000);
    expect(PLAN_REQUEST_MAX_RETRIES).toBe(0);
  });

  it("sends the production request without the SDK refusing it first", async () => {
    let sent = false;
    const anthropic = new Anthropic({
      apiKey: "test-key-not-sent",
      fetch: async () => {
        sent = true;
        return new Response(JSON.stringify(messageBody), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      },
    });

    await anthropic.messages.create(
      {
        model: "claude-sonnet-5-5",
        max_tokens: PLAN_MAX_TOKENS,
        messages: [{ role: "user", content: "plan" }],
        tool_choice: { type: "auto" },
      },
      { timeout: PLAN_REQUEST_TIMEOUT_MS, maxRetries: PLAN_REQUEST_MAX_RETRIES }
    );

    expect(sent).toBe(true);
  });

  it("still refuses 32000 tokens before sending, even with an explicit timeout", async () => {
    let sent = false;
    const anthropic = new Anthropic({
      apiKey: "test-key-not-sent",
      fetch: async () => {
        sent = true;
        return new Response(JSON.stringify(messageBody), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      },
    });

    expect(() =>
      anthropic.messages.create(
        {
          model: "claude-sonnet-5-5",
          max_tokens: 32000,
          messages: [{ role: "user", content: "plan" }],
        },
        { timeout: PLAN_REQUEST_TIMEOUT_MS }
      )
    ).toThrow(/Streaming is strongly recommended/);
    expect(sent).toBe(false);
  });

  it("keeps the route on the same budget", () => {
    const source = readFileSync(new URL("../app/api/training/plan/route.ts", import.meta.url), "utf8");
    expect(source).toContain(`export const maxDuration = ${PLAN_MAX_DURATION_SECONDS}`);
    expect(source).toContain("max_tokens: PLAN_MAX_TOKENS");
    expect(source).toContain("timeout: PLAN_REQUEST_TIMEOUT_MS");
    expect(source).toContain("maxRetries: PLAN_REQUEST_MAX_RETRIES");
  });
});
