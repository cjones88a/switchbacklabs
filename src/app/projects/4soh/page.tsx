import Link from "next/link";

export const metadata = { title: "Project: Horsetooth 4SOH — Switchback Labs" };

export default function P4SOH() {
  return (
    <article className="prose max-w-3xl">
      <h1>Horsetooth Four-Seasons Race Tracker</h1>
      <p>
        A personal project that doubles as a demo of technical PM execution: OAuth with Strava, segment effort parsing,
        times aggregation, Supabase persistence, and a mobile-first leaderboard—deployed on Vercel.
      </p>

      <h2>Highlights</h2>
      <ul>
        <li>Strava OAuth (read-only), consented public leaderboard</li>
        <li>Same-activity rule: main segment + 2 climbs + 3 descents from the same ride</li>
        <li>Admin tool to add/extend eligible race windows (base + overrides)</li>
        <li>Next.js (App Router), Supabase, Vercel</li>
      </ul>

      <h2>Try it</h2>
      <p>
        <Link href="/race-trackingV2" className="underline">Open the live tracker</Link>
      </p>

      <h2>Role</h2>
      <p>End-to-end: product framing, schema, API integration, UI, deployment.</p>
    </article>
  );
}
