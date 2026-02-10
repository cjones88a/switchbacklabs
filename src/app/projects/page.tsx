import SiteHeader from "@/components/layout/SiteHeader";
import Link from "next/link";
import PillArrow from "@/components/ui/PillArrow";

export const metadata = { title: "Projects — Switchback Labs" };

const projects = [
  {
    slug: "4soh",
    title: "Horsetooth 4SOH Race Tracker",
    description: "OAuth with Strava, segment parsing, Supabase, Vercel. Mobile leaderboard with admin windows—strategy → schema → API → UI → launch.",
    href: "/projects/4soh",
    liveHref: "/race-trackingV2",
    liveLabel: "Live tracker",
  },
  {
    slug: "crop-planning",
    title: "Crop Planning & Budgeting App",
    description: "Product specification for MVP: crop planning, budget tracking, and expense actuals for small to medium-sized farms.",
    href: "/projects/crop-planning",
    liveHref: null,
    liveLabel: null,
  },
  {
    slug: "ai-sites",
    title: "AI-assisted Lightweight Websites",
    description: "Templated approach to stand up clean marketing sites and internal tools quickly—Next.js, Tailwind, Vercel—with AI-assisted content and component generation.",
    href: "/projects/ai-sites",
    liveHref: null,
    liveLabel: null,
  },
];

export default function Projects() {
  return (
    <>
      <SiteHeader />

      <section className="relative">
        <div className="section">
          <p className="text-[11px] tracking-widest uppercase text-muted mb-6">
            Portfolio
          </p>
          <h1 className="h2">PROJECTS</h1>
          <p className="lead mt-6 max-w-[62ch]">
            Selected work: product strategy, technical execution, and shipped products.
          </p>
        </div>
      </section>

      <section className="section-paper">
        <div className="container-std">
          <ul className="divide-y divide-gray-200">
            {projects.map((project) => (
              <li key={project.slug} className="py-10 first:pt-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-semibold tracking-tight text-gray-900">
                      {project.title}
                    </h2>
                    <p className="mt-2 text-muted text-sm sm:text-base leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3 shrink-0">
                    {project.liveHref && (
                      <Link
                        href={project.liveHref}
                        className="btn btn-primary"
                      >
                        {project.liveLabel}
                      </Link>
                    )}
                    <Link
                      href={project.href}
                      className="btn btn-pill inline-flex items-center gap-1.5"
                    >
                      Details
                      <PillArrow />
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
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
