import Link from 'next/link';
export default function Page() {
  const seasonKey = `${new Date().getFullYear()}_FALL`;
  return (
    <main className="mx-auto max-w-3xl p-4 space-y-6">
      <h1 className="text-2xl font-semibold">Horsetooth Four-Seasons Challenge</h1>
      <p className="text-sm">Authenticate with Strava to log your time for the season window.</p>
      <Link href="/api/strava/authorize" className="inline-flex items-center rounded-md border px-4 py-2">
        Add my time with Strava
      </Link>
      <div className="text-xs opacity-70">Season key: {seasonKey}</div>
    </main>
  );
}
