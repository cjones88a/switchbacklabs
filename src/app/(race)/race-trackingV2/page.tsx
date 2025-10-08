"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import LeaderboardTable from '@/components/LeaderboardTable';
import TrackerBackground from '@/components/race/TrackerBackground';

// Make this page dynamic to avoid prerender errors
export const dynamic = "force-dynamic";

function base64url(s: string) {
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export default function Page() {
  const seasonKey = `${new Date().getFullYear()}_FALL`;
  const [consent, setConsent] = useState(false);

  // NEW: replace useSearchParams() with a mounted flag
  const [debug, setDebug] = useState(false);
  useEffect(() => {
    try {
      const d = new URLSearchParams(window.location.search).get("debug") === "1";
      setDebug(d);
    } catch {}
  }, []);

  // Prefer NEXT_PUBLIC_* (client-visible). Fallback to server vars if present.
  const cid =
    process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID ||
    process.env.STRAVA_CLIENT_ID ||
    "";
  const redir =
    process.env.NEXT_PUBLIC_STRAVA_REDIRECT_URI ||
    process.env.STRAVA_REDIRECT_URI ||
    "";

  const envIssues: string[] = [];
  if (!cid) envIssues.push("client_id");
  if (!redir) envIssues.push("redirect_uri");
  const envOk = envIssues.length === 0;

  const authorizeUrl = useMemo(() => {
    if (!envOk) return "";
    const state = base64url(JSON.stringify({ consent_public: !!consent, ts: Date.now() }));
    const scope = encodeURIComponent("read,activity:read_all");
    return `https://www.strava.com/oauth/authorize?client_id=${cid}&redirect_uri=${encodeURIComponent(
      redir
    )}&response_type=code&approval_prompt=auto&scope=${scope}&state=${state}`;
  }, [consent, cid, redir, envOk]);

  return (
    <div className="relative min-h-[calc(100svh-56px)] -mx-4 -my-8">
      {/* Pencil-drawing background (uses webp if available) */}
      <TrackerBackground
        src={
          process.env.NEXT_PUBLIC_USE_PNG === "1"
            ? "/race/4soh-background.png"
            : "/race/4soh-background.webp"
        }
      />

      <div className="mx-auto max-w-3xl p-4 space-y-6 relative z-10">
        <p className="text-xs"><Link href="/" className="underline">← Back to home</Link></p>
        <h1 className="text-2xl font-semibold">Horsetooth Four-Seasons Challenge</h1>
        <p className="text-sm">Authenticate with Strava to log your time for the season window.</p>

        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" className="mt-1" checked={consent} onChange={(e)=>setConsent(e.target.checked)} />
          <span>
            I agree to display my name and race times on the public leaderboard.
            <br/><span className="text-xs text-gray-500">You can withdraw consent anytime by emailing us.</span>
          </span>
        </label>

        {/* Official Strava button, but as a <button> so we can truly disable it */}
        <button
          type="button"
          id="strava-auth-btn"
          disabled={!consent || !envOk}
          className={`inline-block ${(!consent || !envOk) ? "opacity-50" : ""}`}
          aria-disabled={!consent || !envOk}
          title={
            !consent ? "Check the consent box to enable" :
            !envOk ? `Missing config: ${envIssues.join(", ")}` :
            "Connect with Strava"
          }
          onClick={() => {
            if (!consent || !envOk) return;
            console.log("[auth] navigating →", authorizeUrl);
            // Direct navigation to Strava OAuth endpoint (brand-compliant)
            window.location.assign(authorizeUrl);
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/strava/buttons/connect-with-strava_orange.svg"
            alt="Connect with Strava"
            height={48}
          />
        </button>

        {(!consent || !envOk) && (
          <div className="text-xs text-red-600 mt-1">
            {!consent ? "Check the consent box to enable the button." :
              <>Missing config in env: <code>{envIssues.join(", ")}</code></>}
          </div>
        )}

        <div className="pt-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/strava/logos/powered-by-strava_orange.svg" alt="Powered by Strava" height={18} />
        </div>

        <div className="text-xs opacity-70">Season key: {seasonKey}</div>

        {debug && (
          <div className="border rounded-xl p-3 text-xs space-y-1">
            <div><strong>Debug</strong></div>
            <div>envOk: {String(envOk)}</div>
            <div>client_id: {cid || "(missing)"}</div>
            <div>redirect_uri: {redir || "(missing)"} </div>
            <div className="break-all">authorizeUrl: {authorizeUrl || "(not built)"}</div>
            <div className="text-[10px] text-gray-500">Tip: add <code>?debug=1</code> to the URL anytime.</div>
          </div>
        )}
        
        <LeaderboardTable seasonKey={seasonKey} />
      </div>
    </div>
  );
}
