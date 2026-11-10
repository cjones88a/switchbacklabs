import { describe, expect, it } from "vitest";
import {
  DEFAULT_ANTHROPIC_MODEL,
  anthropicHttpLog,
  isAnthropicModelNotFound,
  readAnthropicErrorType,
  resolveAnthropicModel,
} from "./anthropicModel";

describe("resolveAnthropicModel", () => {
  it("uses the documented Sonnet alias when ANTHROPIC_MODEL is unset", () => {
    expect(resolveAnthropicModel(undefined)).toBe(DEFAULT_ANTHROPIC_MODEL);
    expect(resolveAnthropicModel(null)).toBe("claude-sonnet-5-5");
    expect(resolveAnthropicModel("  ")).toBe("claude-sonnet-5-5");
    expect(DEFAULT_ANTHROPIC_MODEL).not.toMatch(/\d{8}/);
  });

  it("keeps a non-empty ANTHROPIC_MODEL override", () => {
    expect(resolveAnthropicModel("  claude-haiku-5-5  ")).toBe("claude-haiku-5-5");
  });
});

describe("isAnthropicModelNotFound", () => {
  const retiredBody = {
    type: "error",
    error: { type: "not_found_error", message: "model: claude-sonnet-4-20250514" },
  };

  it("reads the nested Anthropic error type", () => {
    expect(readAnthropicErrorType(retiredBody)).toBe("not_found_error");
    expect(readAnthropicErrorType({ type: "not_found_error" })).toBe("not_found_error");
  });

  it("matches a 404 not_found_error and ignores other failures", () => {
    expect(isAnthropicModelNotFound({ status: 404, errorBody: retiredBody })).toBe(true);
    expect(
      isAnthropicModelNotFound({
        status: 404,
        message: "404 not_found_error model: claude-sonnet-4-20250514",
      })
    ).toBe(true);
    expect(
      isAnthropicModelNotFound({
        status: 404,
        errorBody: { type: "error", error: { type: "permission_error" } },
      })
    ).toBe(false);
    expect(isAnthropicModelNotFound({ status: 400, errorBody: retiredBody })).toBe(false);
    expect(isAnthropicModelNotFound({ status: 401, message: "not_found_error" })).toBe(false);
  });
});

describe("anthropicHttpLog", () => {
  it("logs the nested error type and message without a key", () => {
    expect(
      anthropicHttpLog({
        status: 400,
        errorBody: {
          type: "error",
          error: {
            type: "invalid_request_error",
            message:
              'tool_choice: type "tool" and "any" are not supported for this model. sk-ant-api03-secret',
          },
        },
        message: "400 raw body",
      })
    ).toEqual({
      status: 400,
      errorType: "invalid_request_error",
      errorMessage:
        'tool_choice: type "tool" and "any" are not supported for this model. [redacted]',
    });
  });
});
