import Link from "next/link";
import LeaderboardTable from '@/components/LeaderboardTable';

export default function Page() {
  const seasonKey = `${new Date().getFullYear()}_FALL`;
  return (
    <main className="space-y-6">
      <p className="text-xs">
        <Link href="/" className="underline">← Back to home</Link>
      </p>
      <h1 className="text-2xl font-semibold">Horsetooth Four-Seasons Challenge</h1>
      <p className="text-sm">Authenticate with Strava to log your time for the season window.</p>

      {/* Use a plain anchor so the browser navigates; no prefetch/fetch */}
      <a href="/api/strava/authorize" className="inline-flex items-center rounded-md border px-4 py-2">
        Add my time with Strava
      </a>

      <div className="text-xs opacity-70">Season key: {seasonKey}</div>
      
      <LeaderboardTable seasonKey={seasonKey} />
    </main>
  );
}
