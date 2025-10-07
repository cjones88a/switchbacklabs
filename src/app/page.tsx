import Link from "next/link";
import { ArrowRight, FlaskConical, FileText, Sparkles, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";

export const metadata = {
  title: "Switchback Labs — Product Strategy & Technical PM",
  description:
    "Helping teams turn ambiguity into shipped products—strategy, research, design, requirements, and hands-on delivery.",
};

const Pill = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs text-muted">
    {children}
  </span>
);

export default function Home() {
  return (
    <div className="space-y-16">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-2xl border bg-[radial-gradient(1200px_500px_at_20%_-20%,hsl(var(--ring)/0.25),transparent),linear-gradient(180deg,hsl(var(--surface)),hsl(var(--bg)))]">
        <div className="container-std py-14 md:py-20">
          <div className="max-w-3xl space-y-6">
            <div className="flex flex-wrap gap-2">
              <Pill>Product Strategy</Pill>
              <Pill>Research</Pill>
              <Pill>Design</Pill>
              <Pill>Requirements</Pill>
              <Pill>Delivery</Pill>
            </div>

            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
              Build the <span className="text-[hsl(var(--brand))]">right</span> product—faster and with less thrash.
            </h1>

            <p className="max-w-2xl text-lg text-muted">
              I'm <strong>Colt Jones</strong>, a senior PM helping founders and product teams move from fuzzy ideas to shipped experiences:
              crisp strategy, evidence-based decisions, and specs developers love.
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                className="btn btn-primary"
                href="mailto:switchbacklabsco@gmail.com?subject=Project%20inquiry%20—%20Switchback%20Labs"
              >
                Start a project
              </a>
              <Link href="/projects" className="btn btn-ghost">
                See projects <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <p className="text-xs text-muted">
              Availability: fractional PM or project-based sprints. Response within 1 business day.
            </p>
          </div>
        </div>
      </section>

      {/* THREE OUTCOMES */}
      <section className="container-std">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">What you get</h2>
          <p className="text-muted">
            Clear decisions, fewer cycles, and documentation that accelerates engineering.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="hover:shadow-pop transition hover:-translate-y-0.5">
            <CardHeader title="Clarity & focus" subtitle="Strategy that ties features to outcomes." />
            <div className="mt-3 flex items-start gap-3">
              <Target className="mt-0.5 h-5 w-5 text-[hsl(var(--brand))]" />
              <p className="text-sm text-muted">
                Positioning, goals, and success metrics. A roadmap that explains "why this, why now."
              </p>
            </div>
          </Card>

          <Card className="hover:shadow-pop transition hover:-translate-y-0.5">
            <CardHeader title="Evidence over opinion" subtitle="Research that de-risks decisions." />
            <div className="mt-3 flex items-start gap-3">
              <FlaskConical className="mt-0.5 h-5 w-5 text-[hsl(var(--brand))]" />
              <p className="text-sm text-muted">
                Discovery interviews, JTBD, rapid validation with prototypes. Insights you can act on.
              </p>
            </div>
          </Card>

          <Card className="hover:shadow-pop transition hover:-translate-y-0.5">
            <CardHeader title="Specs devs love" subtitle="Crisp requirements, faster delivery." />
            <div className="mt-3 flex items-start gap-3">
              <FileText className="mt-0.5 h-5 w-5 text-[hsl(var(--brand))]" />
              <p className="text-sm text-muted">
                PRDs, flows, and acceptance criteria that remove ambiguity and speed up implementation.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* PROCESS */}
      <section className="container-std">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">How we'll work</h2>
          <p className="text-muted">A simple, time-boxed engagement that moves fast.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-5">
          {[
            ["Discover", "Context, goals, users, constraints."],
            ["Decide", "Prioritize opportunities against outcomes."],
            ["Design", "Flows & prototypes to validate direction."],
            ["Define", "PRDs, acceptance tests, instrumentation."],
            ["Deliver", "Handoff, backlog, and launch support."],
          ].map(([t, d], i) => (
            <Card key={i} className="p-4">
              <span className="text-xs text-muted">Step {i + 1}</span>
              <div className="mt-1 font-medium">{t}</div>
              <div className="mt-1 text-sm text-muted">{d}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* FEATURED PROJECT */}
      <section className="container-std">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Featured project</h2>
            <p className="text-muted">A small, purposeful build showcasing hands-on execution.</p>
          </div>
          <Link href="/projects" className="text-sm underline">
            All projects
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-5 md:col-span-2 hover:shadow-pop transition hover:-translate-y-0.5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 text-xs">
                  <Sparkles className="h-4 w-4 text-[hsl(var(--brand))]" />
                  <span className="text-muted">Demo / Personal</span>
                </div>
                <h3 className="mt-1 text-xl font-semibold">Horsetooth Four-Seasons Race Tracker</h3>
                <p className="mt-1 text-sm text-muted">
                  OAuth with Strava, segment parsing, Supabase, Vercel. Mobile-first leaderboard with admin
                  controls for date windows. A quick example of strategy → schema → API → UI → deployment.
                </p>
              </div>
              <div className="flex gap-2">
                <Link href="/projects/4soh" className="btn btn-ghost">
                  Project details
                </Link>
                <Link href="/race-trackingV2" className="btn btn-primary">
                  Live tracker
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="container-std">
        <Card className="p-6 md:p-8 items-center text-center hover:shadow-pop transition">
          <h3 className="text-xl font-semibold">Have a product to move forward?</h3>
          <p className="mt-2 text-sm text-muted">
            Let's align on outcomes and carve a path from ambiguity to shipped.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <a
              className="btn btn-primary"
              href="mailto:switchbacklabsco@gmail.com?subject=Project%20inquiry%20—%20Switchback%20Labs"
            >
              Book a working session
            </a>
            <Link href="/services" className="btn btn-ghost">
              Explore services
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
}