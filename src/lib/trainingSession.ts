import { getSupabaseAdmin } from "@/lib/supabase";
import { isFetchFailureMessage, type TokenStatus } from "@/lib/trainingGate";

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error("timeout")), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/** True when Supabase answers at all (including an API error). False on network failure. */
export async function probeSupabase(timeoutMs = 8000): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin();
    const result = await withTimeout(
      Promise.resolve(supabase.from("riders").select("id").limit(1)),
      timeoutMs
    );
    if (result.error && isFetchFailureMessage(result.error.message)) {
      console.error("[training] supabase probe:", result.error.message);
      return false;
    }
    if (result.error) {
      console.error("[training] supabase probe responded:", result.error.message);
    }
    return true;
  } catch (err) {
    console.error("[training] supabase probe threw:", err instanceof Error ? err.message : "unknown");
    return false;
  }
}

export async function readTokenStatus(riderId: string, timeoutMs = 8000): Promise<TokenStatus> {
  try {
    const supabase = getSupabaseAdmin();
    const result = await withTimeout(
      Promise.resolve(
        supabase.from("oauth_tokens").select("rider_id").eq("rider_id", riderId).maybeSingle()
      ),
      timeoutMs
    );
    if (result.error) {
      console.error("[training] token lookup:", result.error.message);
      return isFetchFailureMessage(result.error.message) ? "unreachable" : "rejected";
    }
    return result.data?.rider_id ? "present" : "missing";
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("[training] token lookup threw:", message);
    return isFetchFailureMessage(message) || message === "timeout" ? "unreachable" : "rejected";
  }
}
