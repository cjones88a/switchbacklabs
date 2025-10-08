import SiteHeader from "@/components/layout/SiteHeader";
import Link from "next/link";
import PillArrow from "@/components/ui/PillArrow";

export const metadata = { title: "Projects — Switchback Labs" };

export default function Projects() {
  return (
    <>
      <SiteHeader />

      {/* HERO (white canvas) */}
      <section className="relative">
        <div className="section">
          <p className="text-[11px] tracking-widest uppercase text-muted mb-6">
            Featured Project
          </p>
          <h1 className="h1">HORSETOOTH<br/>4SOH RACE TRACKER</h1>
          <p className="lead mt-6 max-w-[62ch]">
            OAuth with Strava, segment parsing, Supabase, Vercel. Mobile leaderboard with admin windows—
            strategy → schema → API → UI → launch.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/race-trackingV2" className="btn btn-primary">Live tracker</Link>
            <Link href="/projects/4soh" className="btn btn-pill">
              Details <PillArrow />
            </Link>
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
