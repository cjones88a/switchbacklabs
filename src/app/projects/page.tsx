import SiteHeader from "@/components/layout/SiteHeader";
import Link from "next/link";
import PillArrow from "@/components/ui/PillArrow";

export const metadata = { title: "Projects — Switchback Labs" };

const projects: {
  slug: string;
  title: string;
  description: string;
  href: string;
  liveHref: string | null;
  liveLabel: string | null;
  badge?: string;
  featured?: boolean;
}[] = [
  {
    slug: "training",
    title: "Training Coach",
    description:
      "A weekly plan from your own Strava rides. The token stays in an encrypted browser cookie — no database. Flexible interval menu or a day-by-day week.",
    href: "/projects/training",
    liveHref: "/training",
    liveLabel: "Launch app",
    badge: "Live",
    featured: true,
  },
  {
    slug: "hubspot-franchise",
    title: "Franchise CRM on HubSpot",
    description:
      "A customized HubSpot instance for a multi-location franchise brand. Rent Manager, SalesMsg, Contentful, and Vagaro, with a custom pipeline, ticketing, and Claude in the instance.",
    href: "/projects/hubspot-franchise",
    liveHref: null,
    liveLabel: null,
  },
  {
    slug: "4soh",
    title: "Horsetooth 4SOH Race Tracker",
    description:
      "Static demo of the four-seasons leaderboard. The UI runs on bundled sample riders — no live Strava or Supabase calls.",
    href: "/projects/4soh",
    liveHref: "/race-trackingV2",
    liveLabel: "View demo",
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
                <div
                  className={
                    project.featured
                      ? "flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 rounded-xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm"
                      : "flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
                  }
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-semibold tracking-tight text-gray-900">
                        {project.title}
                      </h2>
                      {project.badge && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-2 py-0.5 text-[11px] font-medium uppercase tracking-widest text-white">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#FC4C02]" aria-hidden />
                          {project.badge}
                        </span>
                      )}
                    </div>
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
