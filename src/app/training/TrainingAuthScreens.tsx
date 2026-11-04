import Link from "next/link";
import { authErrorCopy, authorizePath, showConnectAction } from "@/lib/trainingGate";

export function TrainingSignedOut() {
  return (
    <main className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center">
        <p className="text-[11px] tracking-widest uppercase text-zinc-400 mb-3">Training</p>
        <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-zinc-900 mb-2">Connect Strava</h1>
        <p className="text-sm text-zinc-500 mb-8 leading-relaxed">
          Connect your Strava account to build a training plan from your rides. Access stays in an
          encrypted cookie for this browser session. Nothing is saved in a database.
        </p>
        <a
          href={authorizePath("/training")}
          className="block w-full bg-[#FC4C02] text-white text-sm font-semibold py-3 px-6 rounded-xl hover:bg-orange-600 transition-colors"
        >
          Connect with Strava
        </a>
        <Link href="/" className="block mt-4 text-xs text-zinc-400 hover:text-zinc-600">
          Back to home
        </Link>
      </div>
    </main>
  );
}

export function TrainingAuthError({
  code,
  missing = [],
  details = [],
}: {
  code: string;
  missing?: string[];
  details?: string[];
}) {
  const copy = authErrorCopy(code);
  return (
    <main className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <p className="text-[11px] tracking-widest uppercase text-zinc-400 mb-3">Training</p>
        <h1 className="text-2xl font-bold text-zinc-900 mb-2">{copy.title}</h1>
        <p className="text-sm text-zinc-600 mb-6 leading-relaxed">{copy.body}</p>
        {missing.length > 0 && (
          <ul className="text-left text-sm font-mono bg-white border border-zinc-200 rounded-xl p-4 mb-4 space-y-1">
            {missing.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        )}
        {details.length > 0 && (
          <ul className="text-left text-sm text-zinc-700 bg-white border border-zinc-200 rounded-xl p-4 mb-4 space-y-2">
            {details.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        )}
        {code === "server_misconfigured" && (
          <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
            Strava Authorization Callback Domain: <span className="font-mono">switchbacklabsco.com</span>.{" "}
            <span className="font-mono">STRAVA_REDIRECT_URI</span> must be{" "}
            <span className="font-mono">https://switchbacklabsco.com/api/strava/callback</span>.{" "}
            <span className="font-mono">TRAINING_SESSION_SECRET</span> encrypts the session cookie
            (32+ characters, for example the output of <span className="font-mono">openssl rand -base64 32</span>).
            Supabase variables are not used by this page.
          </p>
        )}
        {showConnectAction(code) ? (
          <a
            href={authorizePath("/training")}
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
        <Link href="/" className="block mt-4 text-xs text-zinc-400 hover:text-zinc-600">
          Back to home
        </Link>
      </div>
    </main>
  );
}
