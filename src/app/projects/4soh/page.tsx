import SiteHeader from "@/components/layout/SiteHeader";
import Link from "next/link";
import PillArrow from "@/components/ui/PillArrow";

export const metadata = { title: "Project: Horsetooth 4SOH — Switchback Labs" };

export default function P4SOH() {
  return (
    <>
      <SiteHeader />

      {/* HERO (white canvas) */}
      <section className="relative">
        <div className="section">
          <p className="text-[11px] tracking-widest uppercase text-muted mb-6">
            Project Details
          </p>
          <h1 className="h2">HORSETOOTH FOUR-SEASONS RACE TRACKER</h1>
          <p className="lead mt-6 max-w-[62ch]">
            A personal project that doubles as a demo of technical PM execution: OAuth with Strava, segment effort parsing,
            times aggregation, Supabase persistence, and a mobile-first leaderboard—deployed on Vercel.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/race-trackingV2" className="btn btn-primary">Live tracker</Link>
            <Link href="/projects" className="btn btn-pill">
              Back to projects <PillArrow />
            </Link>
          </div>
        </div>
      </section>

      {/* DETAILS (paper section) */}
      <section className="section-paper">
        <div className="container-std">
          <div className="max-w-3xl">
            <h2 className="h2 mb-6">Highlights</h2>
            <ul className="space-y-3 text-muted">
              <li>• Strava OAuth (read-only), consented public leaderboard</li>
              <li>• Same-activity rule: main segment + 2 climbs + 3 descents from the same ride</li>
              <li>• Admin tool to add/extend eligible race windows (base + overrides)</li>
              <li>• Next.js (App Router), Supabase, Vercel</li>
            </ul>

            <h2 className="h2 mt-12 mb-6">Role</h2>
            <p className="text-muted">
              End-to-end: product framing, schema, API integration, UI, deployment.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="container-std py-8 text-sm text-muted flex items-center justify-between">
          <div>© Switchback Labs — Fort Collins, CO</div>
          <div className="flex gap-6">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
