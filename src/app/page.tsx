import Link from "next/link";

export default function HomePage() {
  return (
    <section className="grid gap-10 md:grid-cols-2 items-start">
      <div className="space-y-5">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          Product Strategy & Technical PM for teams that need momentum
        </h1>
        <p className="text-gray-700">
          I’m Colt Jones, a senior Product Manager with principal-level engineering skills.
          I help startups and product teams clarify strategy, validate with research, design the right thing,
          and ship clean requirements—with hands-on build support when needed.
        </p>
        <ul className="text-sm text-gray-800 space-y-1">
          <li>• Strategy: positioning, goals, success metrics</li>
          <li>• Research: discovery, user interviews, insight synthesis</li>
          <li>• Design: IA, flows, low/hi-fi prototypes</li>
          <li>• Requirements: PRDs, specs, acceptance tests</li>
          <li>• Delivery: backlog, dev handoff, quality bars</li>
        </ul>
        <div className="flex flex-wrap gap-3">
          <Link href="/services" className="rounded-md border px-4 py-2 hover:bg-gray-50">Services</Link>
          <Link href="/projects" className="rounded-md border px-4 py-2 hover:bg-gray-50">Projects</Link>
          <a href="mailto:switchbacklabsco@gmail.com" className="rounded-md border px-4 py-2 bg-black text-white hover:opacity-90">
            Get in touch
          </a>
        </div>
        <p className="text-xs text-gray-500">
          Consulting availability: fractional PM or project-based.
        </p>
      </div>

      <div className="rounded-xl border p-5">
        <h2 className="font-medium mb-2">Featured project</h2>
        <div className="space-y-2 text-sm">
          <p><strong>Horsetooth Four-Seasons Race Tracker</strong></p>
          <p className="text-gray-700">
            OAuth with Strava, segment parsing, Supabase, Vercel. Mobile-first leaderboard. Admin controls for race windows.
          </p>
          <div className="flex gap-2">
            <Link href="/projects/4soh" className="underline">Project details</Link>
            <Link href="/race-trackingV2" className="underline">Live tracker</Link>
          </div>
        </div>
      </div>
    </section>
  );
}