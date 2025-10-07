import crypto from "node:crypto";

export function traceHeaders(name: string) {
  const id = crypto.randomUUID();
  return { id, name };
}
