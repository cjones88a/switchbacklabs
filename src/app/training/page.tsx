import { cookies } from "next/headers";
import TrainingApp from "./TrainingApp";
import { TrainingAuthError, TrainingSignedOut } from "./TrainingAuthScreens";
import { openTrainingSession, TRAINING_COOKIE_NAME } from "@/lib/trainingCookie";
import {
  configIsBlocking,
  sanitizeMissingList,
  trainingConfigProblems,
  trainingEntryDecision,
} from "@/lib/trainingGate";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata = {
  title: "Training — Switchback Labs",
  description: "A Strava-backed training plan. Your token stays in an encrypted session cookie.",
};

function firstParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export default async function TrainingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[]; missing?: string | string[] }>;
}) {
  const sp = await searchParams;
  const errorRaw = firstParam(sp.error);
  const missingQuery = sanitizeMissingList(firstParam(sp.missing));
  const live = trainingConfigProblems(process.env);
  const config =
    errorRaw === "server_misconfigured"
      ? {
          missing: [...new Set([...live.missing, ...missingQuery])],
          details: live.details,
        }
      : live;

  const blocking = configIsBlocking(config);
  const hasSession =
    !errorRaw && !blocking
      ? openTrainingSession(
          (await cookies()).get(TRAINING_COOKIE_NAME)?.value,
          process.env.TRAINING_SESSION_SECRET
        ) !== null
      : false;

  const decision = trainingEntryDecision({ error: errorRaw, config, hasSession });

  if (decision.type === "error") {
    return (
      <TrainingAuthError code={decision.code} missing={decision.missing} details={decision.details} />
    );
  }
  if (decision.type === "signed_out") return <TrainingSignedOut />;
  return <TrainingApp />;
}
