"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import LeaderboardTable from '@/components/LeaderboardTable';

function base64url(s: string) {
  if (typeof window === "undefined") return "";
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export default function Page() {
  const seasonKey = `${new Date().getFullYear()}_FALL`;
  const [consent, setConsent] = useState(false);

  // Build state client-side so we can link directly to Strava's authorize URL
  const authorizeUrl = useMemo(() => {
    const stateObj = { consent_public: !!consent, ts: Date.now() };
    const state = base64url(JSON.stringify(stateObj));
    const cid = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID!;
    const redir = encodeURIComponent(process.env.NEXT_PUBLIC_STRAVA_REDIRECT_URI!);
    const scope = encodeURIComponent("read,activity:read_all");
    return `https://www.strava.com/oauth/authorize?client_id=${cid}&redirect_uri=${redir}&response_type=code&approval_prompt=auto&scope=${scope}&state=${state}`;
  }, [consent]);

  return (
    <main className="space-y-6">
      <p className="text-xs">
        <Link href="/" className="underline">← Back to home</Link>
      </p>
      <h1 className="text-2xl font-semibold">Horsetooth Four-Seasons Challenge</h1>
      <p className="text-sm">Authenticate with Strava to log your time for the season window.</p>

      {/* Consent is required for public display, per our policy */}
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" className="mt-1" checked={consent} onChange={(e)=>setConsent(e.target.checked)} />
        <span>
          I agree to display my name and race times on the public leaderboard.
          <br/><span className="text-xs text-gray-500">You can withdraw consent anytime by emailing us.</span>
        </span>
      </label>

      {/* OFFICIAL BUTTON (48px high), links directly to Strava authorize */}
      <a
        href={authorizeUrl}
        className={`inline-block ${consent ? "" : "pointer-events-none opacity-50"}`}
        aria-disabled={!consent}
      >
        <img
          src="/strava/buttons/connect-with-strava_orange.svg"
          alt="Connect with Strava"
          height={48}
        />
      </a>

      {/* Subtle "Powered by Strava" mark (separate from our brand; not prominent) */}
      <div className="pt-2">
        <img
          src="/strava/logos/powered-by-strava_orange.svg"
          alt="Powered by Strava"
          height={18}
        />
      </div>

      <div className="text-xs opacity-70">Season key: {seasonKey}</div>
      
      <LeaderboardTable seasonKey={seasonKey} />
    </main>
  );
}
