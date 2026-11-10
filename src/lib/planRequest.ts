/**
 * SDK 0.39 computes a non-streaming timeout of (3600 * max_tokens) / 128000 seconds
 * and throws before sending if that exceeds 600. The ceiling is 21333 tokens.
 * 16000 leaves room for adaptive thinking plus a week plan and stays under that cap.
 */
export const PLAN_MAX_TOKENS = 16000;

/** Vercel Hobby function budget for this route. */
export const PLAN_MAX_DURATION_SECONDS = 300;

/**
 * Per messages.create call. The route may make two calls, and the SDK retries
 * timeouts unless maxRetries is 0, so this stays well under the function budget.
 */
export const PLAN_REQUEST_TIMEOUT_MS = 140_000;

export const PLAN_REQUEST_MAX_RETRIES = 0;
