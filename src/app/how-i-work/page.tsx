import SiteHeader from "@/components/layout/SiteHeader";
import Link from "next/link";

export const metadata = { title: "How I Work — Switchback Labs" };

type WorkLink = { href: string; label: string; external?: boolean };

const SECTIONS: {
  n: string;
  title: string;
  body: React.ReactNode;
  links: WorkLink[];
}[] = [
  {
    n: "01",
    title: "Strategy and scoping",
    body: (
      <>
        <p>
          The scope cut on Training Coach was the database. An earlier race tracker stored Strava tokens in Supabase, and the free project kept pausing, so a login that depended on it failed even when the environment variables were set. The coach keeps the token in an encrypted browser cookie and reads activities from Strava for that session. The system got smaller, and the app stays up without a database.
        </p>
      </>
    ),
    links: [{ href: "/projects/training", label: "Training Coach case study" }],
  },
  {
    n: "02",
    title: "Discovery and validation",
    body: (
      <>
        <p>
          Training Coach is scoped to one rider who already logs rides on Strava and wants a week of training from that history, plus a little racing context. The form asks for what the plan actually uses: FTP, hours per week, racing type, course style, and, for a day-by-day week, weight and at least one race.
        </p>
        <p className="mt-4">
          The checks that mattered are the ones a visitor hits. Signed out, access denied, a failed token exchange, and a missing model key each get a message. The page does not sit on a spinner.
        </p>
        <p className="mt-4">
          The crop budget is the same kind of loop on a different product. A grower or advisor can replace the sample assumptions, move price and yield, and send a note with that exact scenario attached. The case study is the process. No one has sent a note through it yet.
        </p>
      </>
    ),
    links: [
      { href: "/projects/training", label: "How the coach was scoped" },
      { href: "/projects/crop-planning", label: "Crop planning case study" },
    ],
  },
  {
    n: "03",
    title: "Design",
    body: (
      <>
        <p>
          <Link href="/training" className="text-gray-900 underline underline-offset-4">
            /training
          </Link>{" "}
          is a short path: connect Strava, see the last 30 days of rides, then choose a plan. The default is a flexible interval menu, with options tagged by how the day feels, including an easy one. The other choice is a day-by-day week, Monday through Sunday, with zones, fueling notes, and a note on the week after.
        </p>
      </>
    ),
    links: [
      { href: "/training", label: "Open the app" },
      { href: "/projects/training", label: "Read the flow" },
    ],
  },
  {
    n: "04",
    title: "Delivery and quality",
    body: (
      <>
        <p>
          Changes land as pull requests on the{" "}
          <a
            href="https://github.com/cjones88a/switchbacklabs"
            className="text-gray-900 underline underline-offset-4"
          >
            public repo
          </a>
          . Production <span className="text-gray-800">/training</span> used to stop on a prerendered spinner that said it was loading Strava data. A denied login was reported as a missing code, and the token was written to Supabase. That project was paused, so the exchange never became a session. Pull request 7 seals the token in the cookie and returns a specific error instead.
        </p>
        <p className="mt-4">
          Lint, typecheck, tests, and a production build run before those pull requests merge.
        </p>
      </>
    ),
    links: [
      {
        href: "https://github.com/cjones88a/switchbacklabs",
        label: "cjones88a/switchbacklabs",
        external: true,
      },
    ],
  },
  {
    n: "05",
    title: "Systems and CRM",
    body: (
      <>
        <p>
          The other long thread is HubSpot. For a multi-location franchise brand, the instance connects Rent Manager, SalesMsg, Contentful, and Vagaro, with a custom deal pipeline, a custom ticketing system, custom objects synced to the property system, and Claude inside the instance. The work is ongoing.
        </p>
      </>
    ),
    links: [{ href: "/projects/hubspot-franchise", label: "HubSpot case study" }],
  },
];

export default function HowIWorkPage() {
  return (
    <>
      <SiteHeader />

      <section className="relative">
        <div className="section">
          <p className="text-[11px] tracking-widest uppercase text-muted mb-6">
            Practice
          </p>
          <h1 className="h2">HOW I WORK</h1>
          <p className="lead mt-6 max-w-[68ch]">
            Product decisions, shown on the things that shipped. Each section below is a paragraph and a link to the page that holds the evidence.
          </p>
        </div>
      </section>

      <section className="section-paper">
        <div className="container-std">
          <ol className="max-w-3xl divide-y divide-gray-200">
            {SECTIONS.map((section) => (
              <li key={section.n} className="py-10 first:pt-0 last:pb-0">
                <p className="text-[11px] tracking-widest uppercase text-muted">{section.n}</p>
                <h2 className="mt-2 font-serif text-2xl md:text-3xl font-light tracking-tight text-gray-900">
                  {section.title}
                </h2>
                <div className="mt-4 text-muted leading-relaxed">{section.body}</div>
                <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
                  {section.links.map((link) =>
                    link.external ? (
                      <a
                        key={link.href}
                        href={link.href}
                        className="text-sm font-medium text-gray-900 underline underline-offset-4"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="text-sm font-medium text-gray-900 underline underline-offset-4"
                      >
                        {link.label}
                      </Link>
                    )
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-gray-900 text-white">
        <div className="section">
          <p className="text-[11px] tracking-widest uppercase text-white/50 mb-6">06</p>
          <h2 className="font-serif text-3xl md:text-4xl font-light tracking-tight">
            Building with AI
          </h2>
          <div className="mt-6 max-w-[68ch] space-y-4 text-lg text-white/80 leading-relaxed">
            <p>
              I am a product manager who ships the software with AI coding agents. This site is the proof. Training Coach is a working app: Strava sign-in, a sealed session, a plan form, and error states that say what broke. The case studies are the write-ups of those decisions.
            </p>
            <p>
              Claude also runs inside the products. It drafts the training week from the rider&apos;s recent activities, and it is integrated into the HubSpot instance. Those are different jobs. The agent writes the code. The model answers inside the product. Either way it has to run, and lint, types, tests, and the production build have to pass before it merges.
            </p>
            <p>
              The crop budget is the other proof from the same practice. A calculating slice, a share link, and a feedback panel are small enough to ship in the week the question comes up.
            </p>
            <p>
              The longer note is{" "}
              <Link href="/pm-of-the-future" className="text-white underline underline-offset-4">
                The PM of the Future
              </Link>
              . I prototype, I move fast, and I empathize. Customer need is the same. The path to it is shorter, and it is more fun.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/pm-of-the-future" className="btn bg-white text-gray-900 hover:bg-gray-100">
              The PM of the Future
            </Link>
            <Link href="/training" className="btn border border-white/30 text-white hover:bg-white/10">
              Launch Training Coach
            </Link>
            <Link href="/projects/training" className="btn border border-white/30 text-white hover:bg-white/10">
              Read how it was built
            </Link>
            <Link href="/projects/crop-planning" className="btn border border-white/30 text-white hover:bg-white/10">
              Crop budget prototype
            </Link>
          </div>
        </div>
      </section>

      <section className="relative">
        <div className="section">
          <h2 className="font-serif text-2xl md:text-3xl font-light tracking-tight">Say hi</h2>
          <p className="mt-4 text-muted leading-relaxed max-w-[62ch]">
            The work is on the site. Email{" "}
            <a
              href="mailto:switchbacklabsco@gmail.com"
              className="text-gray-900 underline underline-offset-4"
            >
              switchbacklabsco@gmail.com
            </a>{" "}
            if you want to talk about it.
          </p>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="container-std py-8 text-sm text-muted flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
