import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { probeSupabase, readTokenStatus } from "@/lib/trainingSession";
import {
  authErrorCopy,
  authorizePath,
  decideTrainingGate,
  oauthConfigProblems,
  sanitizeMissingList,
  showConnectAction,
  type ConfigProblems,
  type TokenStatus,
} from "@/lib/trainingGate";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata = {
  title: "Connect Strava — 4SOH Race Tracker",
  description: "Sign in with Strava to open the Horsetooth Four Seasons race tracker.",
};

function firstParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function mergeConfig(live: ConfigProblems, error: string | null, missingQuery: string[]): ConfigProblems {
  if (error !== "server_misconfigured") return live;
  const missing = [...live.missing];
  for (const name of missingQuery) {
    if (!missing.includes(name)) missing.push(name);
  }
  return { missing, details: live.details };
}

export default async function TrainingGatePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[]; missing?: string | string[] }>;
}) {
  const sp = await searchParams;
  const errorRaw = firstParam(sp.error);
  const missingQuery = sanitizeMissingList(firstParam(sp.missing));
  const liveConfig = oauthConfigProblems(process.env);
  const config = mergeConfig(liveConfig, errorRaw, missingQuery);
  const blocking = config.missing.length > 0 || config.details.length > 0;

  let riderId: string | null = null;
  let tokenStatus: TokenStatus = "unchecked";
  let supabaseReachable: boolean | null = null;

  // An error or a bad config must render immediately. Do not call Supabase or Strava first,
  // or a hung lookup becomes the spinner this page used to show.
  if (!errorRaw && !blocking) {
    const cookieStore = await cookies();
    riderId = cookieStore.get("rider_id")?.value || cookieStore.get("RID")?.value || null;
    if (riderId) {
      tokenStatus = await readTokenStatus(riderId);
      supabaseReachable = tokenStatus !== "unreachable";
    } else {
      supabaseReachable = await probeSupabase();
    }
  }

  const decision = decideTrainingGate({
    error: errorRaw,
    config,
    riderId,
    tokenStatus,
    supabaseReachable,
  });

  if (decision.type === "redirect") {
    redirect(decision.to);
  }

  const copy = authErrorCopy(decision.code);
  const connectHref = authorizePath("/race-trackingV2");

  return (
    <main className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <p className="text-[11px] tracking-widest uppercase text-zinc-400 mb-3">Four Seasons One Hour</p>
        <h1 className="text-2xl font-bold text-zinc-900 mb-2">{copy.title}</h1>
        <p className="text-sm text-zinc-600 mb-6 leading-relaxed">{copy.body}</p>

        {decision.missing.length > 0 && (
          <ul className="text-left text-sm font-mono bg-white border border-zinc-200 rounded-xl p-4 mb-4 space-y-1">
            {decision.missing.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        )}
        {decision.details.length > 0 && (
          <ul className="text-left text-sm text-zinc-700 bg-white border border-zinc-200 rounded-xl p-4 mb-4 space-y-2">
            {decision.details.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        )}

        {decision.code === "server_misconfigured" && (
          <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
            Strava API settings: Authorization Callback Domain must be{" "}
            <span className="font-mono">switchbacklabsco.com</span>.{" "}
            <span className="font-mono">STRAVA_REDIRECT_URI</span> must be{" "}
            <span className="font-mono">https://switchbacklabsco.com/api/strava/callback</span>.
            Supabase: use the Project URL and the service_role key from Project Settings → API.
            <span className="font-mono"> SUPABASE_SERVICE_ROLE_KEY</span> is accepted if{" "}
            <span className="font-mono">SUPABASE_SERVICE_ROLE</span> is unset.
          </p>
        )}

        {showConnectAction(decision.code) ? (
          <a
            href={connectHref}
            className="block w-full bg-[#FC4C02] text-white text-sm font-semibold py-3 px-6 rounded-xl hover:bg-orange-600 transition-colors"
          >
            Connect with Strava
          </a>
        ) : (
          <a
            href="/training"
            className="block w-full bg-zinc-900 text-white text-sm font-semibold py-3 px-6 rounded-xl hover:bg-zinc-800 transition-colors"
          >
            Try again
          </a>
        )}

        <Link href="/race-trackingV2" className="block mt-4 text-xs text-zinc-500 hover:text-zinc-800">
          Open the race tracker
        </Link>
        <Link href="/" className="block mt-2 text-xs text-zinc-400 hover:text-zinc-600">
          Back to home
        </Link>
      </div>
    </main>
  );
}
