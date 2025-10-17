import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-16 py-12 md:py-16">
      {/* HERO */}
      <section className="space-y-6">
        <p className="text-xs tracking-wider text-zinc-500">
          PRODUCT STRATEGY · RESEARCH · DESIGN · REQUIREMENTS · DELIVERY
        </p>

        <h1 className="max-w-4xl text-5xl font-extrabold leading-[1.05] tracking-tight md:text-7xl">
          LESS TALK.
          <br />
          <span className="underline decoration-[#D5FF3F] underline-offset-8">MORE SHIPPED.</span>
        </h1>

        <p className="max-w-2xl text-lg text-zinc-700">
          I help founders and teams move from fuzzy ideas to shipped experiences:
          crisp strategy, evidence-based decisions, and specs developers love.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="mailto:switchbacklabsco@gmail.com?subject=Project%20inquiry"
            className="inline-flex items-center rounded-full bg-[#D5FF3F] px-5 py-2 text-sm font-medium text-[#132E1E] hover:brightness-95"
          >
            Start a project
          </Link>
          <Link href="/projects" className="text-sm font-medium underline underline-offset-4">
            See projects →
          </Link>
        </div>
      </section>

      {/* BENEFITS */}
      <section id="services" className="space-y-6">
        <h2 className="text-xl font-semibold tracking-tight">What you get</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-2 text-2xl">🧭</div>
            <h3 className="mb-1 font-semibold">Clarity &amp; focus</h3>
            <p className="text-sm text-zinc-700">
              Strategy that ties features to outcomes. Positioning, goals, and success metrics. A roadmap that
              explains &quot;why this, why now.&quot;
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-2 text-2xl">🔬</div>
            <h3 className="mb-1 font-semibold">Evidence over opinion</h3>
            <p className="text-sm text-zinc-700">
              Research that de-risks decisions. Customer interviews, JTBD, rapid validation with prototypes,
              and insights you can act on.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-2 text-2xl">📄</div>
            <h3 className="mb-1 font-semibold">Specs devs love</h3>
            <p className="text-sm text-zinc-700">
              Crisp PRDs, flows, and acceptance criteria that remove ambiguity and speed up implementation.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURED PROJECT */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Featured project</h2>
          <Link href="/projects" className="text-sm underline underline-offset-4">
            All projects
          </Link>
        </div>

        <Link
          href="/race-trackingV2"
          className="block rounded-xl border border-zinc-200 bg-white p-5 shadow-sm hover:bg-zinc-50"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold">Horsetooth Four-Seasons Race Tracker</h3>
              <p className="mt-1 text-sm text-zinc-700">
                OAuth with Strava, segment parsing, Supabase, and Vercel. Mobile leaderboard with admin
                windows — strategy → schema → API → UI → launch.
              </p>
            </div>
            <span aria-hidden className="text-lg">→</span>
          </div>
        </Link>
      </section>

      {/* CONTACT STRIP */}
      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm text-zinc-600">Availability</p>
            <p className="text-sm">
              Fractional PM or project-based sprints. Typical response within one business day.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="mailto:switchbacklabsco@gmail.com?subject=Project%20inquiry"
              className="inline-flex items-center rounded-full bg-[#D5FF3F] px-5 py-2 text-sm font-medium text-[#132E1E] hover:brightness-95"
            >
              Start a project
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center rounded-full border border-zinc-200 px-5 py-2 text-sm font-medium hover:bg-zinc-50"
            >
              See work
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}