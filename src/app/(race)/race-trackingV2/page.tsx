"use client";
import Link from "next/link";
import { useState } from "react";
import LeaderboardTable from '@/components/LeaderboardTable';

export default function Page() {
  const seasonKey = `${new Date().getFullYear()}_FALL`;
  const [consent, setConsent] = useState(false);
  return (
    <main className="space-y-6">
      <p className="text-xs">
        <Link href="/" className="underline">← Back to home</Link>
      </p>
      <h1 className="text-2xl font-semibold">Horsetooth Four-Seasons Challenge</h1>
      <p className="text-sm">Authenticate with Strava to log your time for the season window.</p>

      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" className="mt-1" checked={consent} onChange={(e)=>setConsent(e.target.checked)} />
        <span>
          I agree to display my name and race times on the public leaderboard.
          <br/><span className="text-xs text-gray-500">You can withdraw consent anytime by emailing us.</span>
        </span>
      </label>

      {/* Use anchor to avoid Next prefetch/CORS issues; pass consent to /api/strava/authorize */}
      <a
        href={`/api/strava/authorize?consent_public=${consent ? "1" : "0"}`}
        className={`inline-flex items-center rounded-md border px-4 py-2 ${consent ? "bg-[#fc4c02] text-white border-[#fc4c02] hover:opacity-90" : "pointer-events-none opacity-50"}`}
        aria-disabled={!consent}
      >
        Connect with Strava
      </a>

      <div className="text-xs opacity-70">Season key: {seasonKey}</div>
      
      <LeaderboardTable seasonKey={seasonKey} />
    </main>
  );
}
