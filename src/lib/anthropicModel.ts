/**
 * Current Claude Sonnet on the Claude API.
 * Models overview lists this as both the Claude API ID and the Claude API alias
 * (no date suffix): https://docs.anthropic.com/en/docs/about-claude/models/overview
 * Override with ANTHROPIC_MODEL.
 */
export const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-5-5";

export function resolveAnthropicModel(override: string | undefined | null): string {
  const trimmed = override?.trim();
  return trimmed ? trimmed : DEFAULT_ANTHROPIC_MODEL;
}

/** Anthropic error bodies nest `error.type`; some SDK versions surface the inner object. */
export function readAnthropicErrorType(errorBody: unknown): string | undefined {
  if (!errorBody || typeof errorBody !== "object") return undefined;
  const record = errorBody as Record<string, unknown>;
  const nested = record.error;
  if (nested && typeof nested === "object") {
    const nestedType = (nested as { type?: unknown }).type;
    if (typeof nestedType === "string" && nestedType.length > 0) return nestedType;
  }
  if (typeof record.type === "string" && record.type !== "error") return record.type;
  return undefined;
}

const API_KEY_PATTERN = /sk-ant-[A-Za-z0-9_-]+/g;

/** Prefer the nested `error.message`. Some SDK versions put that object on the error itself. */
export function readAnthropicErrorMessage(errorBody: unknown): string | undefined {
  if (!errorBody || typeof errorBody !== "object") return undefined;
  const record = errorBody as Record<string, unknown>;
  const nested = record.error;
  if (nested && typeof nested === "object") {
    const message = (nested as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message.trim();
  }
  if (typeof record.message === "string" && record.message.trim() && record.type !== "error") {
    return record.message.trim();
  }
  return undefined;
}

/** Fields safe to log: status, Anthropic error type, and a short message. No request headers. */
export function anthropicHttpLog(input: {
  status?: number;
  errorBody?: unknown;
  message?: string;
}): { status?: number; errorType?: string; errorMessage?: string } {
  const errorType = readAnthropicErrorType(input.errorBody);
  const raw = readAnthropicErrorMessage(input.errorBody) ?? input.message;
  const errorMessage = raw
    ? raw.replace(API_KEY_PATTERN, "[redacted]").slice(0, 300)
    : undefined;
  return {
    ...(input.status !== undefined ? { status: input.status } : {}),
    ...(errorType ? { errorType } : {}),
    ...(errorMessage ? { errorMessage } : {}),
  };
}

/** True only for HTTP 404 whose Anthropic type is not_found_error (retired or unknown model). */
export function isAnthropicModelNotFound(input: {
  status?: number;
  errorBody?: unknown;
  message?: string;
}): boolean {
  if (input.status !== 404) return false;
  if (readAnthropicErrorType(input.errorBody) === "not_found_error") return true;
  return typeof input.message === "string" && input.message.includes("not_found_error");
}
