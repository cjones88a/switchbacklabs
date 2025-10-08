import SiteHeader from "@/components/layout/SiteHeader";
import ScrollCue from "@/components/ui/ScrollCue";
import Link from "next/link";

export const metadata = {
  title: "Switchback Labs — Less fluff. More shipped.",
  description: "Senior PM with principal-level engineering skills. Strategy, research, design, and developer-loved specs.",
};

export default function Home() {
  return (
    <>
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="container-std">
          <div className="pt-16 pb-24 md:pb-28">
            <p className="text-xs tracking-widest uppercase text-muted mb-6">
              Product Strategy · Research · Design · Requirements · Delivery
            </p>

            <h1 className="h1" style={{ fontFamily: "var(--font-display), ui-sans-serif" }}>
              LESS TALK.<br/> MORE SHIPPED.
            </h1>

            <p className="lead mt-6 max-w-[60ch]">
              I help founders and teams move from fuzzy ideas to shipped experiences: crisp strategy,
              evidence-based decisions, and specs developers love.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a className="btn btn-primary" href="mailto:switchbacklabsco@gmail.com">Start a project</a>
              <Link className="btn btn-ghost" href="/projects">See projects →</Link>
            </div>
          </div>
        </div>

        {/* Neon accent circle (pure shape, no brand copying) */}
        <div className="pointer-events-none absolute -right-24 top-24 w-[320px] h-[320px] rounded-full bg-accent mix-blend-multiply opacity-90"></div>

        <ScrollCue />
      </section>

      {/* WHAT YOU GET */}
      <section className="container-std py-16">
        <h2 className="h2">What you get</h2>
        <p className="mt-2 text-muted">Clear decisions, fewer cycles, and documentation that accelerates engineering.</p>

        <div className="mt-8 grid gap-4">
          {[
            ["Clarity & focus", "Strategy that ties features to outcomes."],
            ["Evidence over opinion", "Research that de-risks decisions."],
            ["Specs devs love", "PRDs, flows, and acceptance criteria that remove ambiguity."],
          ].map(([title, body]) => (
            <div className="card p-6 md:p-7" key={title}>
              <div className="text-lg font-semibold">{title}</div>
              <div className="text-muted mt-2">{body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED PROJECT */}
      <section className="container-std py-16">
        <div className="flex items-end justify-between">
          <h2 className="h2">Featured project</h2>
          <Link href="/projects" className="underline">All projects</Link>
        </div>

        <div className="card p-6 md:p-8 mt-6">
          <div className="text-xs text-muted">Demo / Personal</div>
          <div className="text-xl font-semibold mt-1">Horsetooth Four-Seasons Race Tracker</div>
          <p className="text-muted mt-2 max-w-2xl">
            OAuth with Strava, segment parsing, Supabase, Vercel. Mobile leaderboard with admin windows—
            strategy → schema → API → UI → launch.
          </p>
          <div className="mt-6 flex gap-3">
            <Link href="/race-trackingV2" className="btn btn-primary">Live tracker</Link>
            <Link href="/projects/4soh" className="btn btn-ghost">Details</Link>
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