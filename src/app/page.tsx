import Link from "next/link";

export default function HomePage() {
  return (
    <section className="grid gap-8 md:grid-cols-2 items-center">
      <div className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          Switchback Labs
        </h1>
        <p className="text-gray-600">
          Simple race tools for the Horsetooth Four-Seasons Challenge. Authenticate with Strava,
          log your time for the season window, and see the live leaderboard.
        </p>
        <div className="flex gap-3">
          <Link
            href="/race-trackingV2"
            className="inline-flex items-center rounded-md border px-4 py-2 font-medium hover:bg-gray-50"
          >
            Open Race Tracker
          </Link>
          <a
            href="mailto:hello@switchbacklabsco.com"
            className="inline-flex items-center rounded-md border px-4 py-2 text-gray-600 hover:bg-gray-50"
          >
            Contact
          </a>
        </div>
        <p className="text-xs text-gray-500">
          Descents are calculated from the same activity as your overall effort.
        </p>
      </div>

      <div className="rounded-xl border p-4">
        <ul className="text-sm space-y-2">
          <li>• One-click Strava auth (read-only)</li>
          <li>• Auto-detect your best overall segment in the window</li>
          <li>• Climber: sum of Climb 1 + Climb 2</li>
          <li>• Descender: sum of 3 descents</li>
          <li>• Mobile-first leaderboard</li>
        </ul>
      </div>
    </section>
  );
}