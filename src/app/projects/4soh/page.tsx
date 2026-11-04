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
            The race-tracker UI, shown here as a static demo with fictional riders and times.
            The original product used Strava OAuth, segment-effort parsing, and Supabase.
            This copy does not call them, so the page still loads if the database is paused.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/race-trackingV2" className="btn btn-primary">View demo</Link>
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
              <li>• Static demo: bundled sample leaderboard and sample history, no runtime Strava or Supabase</li>
              <li>• Same-activity rule, still explained in the UI: main segment + 2 climbs + 3 descents from the same ride</li>
              <li>• Original build also had an admin tool for season windows (base + overrides)</li>
              <li>• Next.js (App Router) on Vercel. The live database path is not wired up in this portfolio build</li>
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
