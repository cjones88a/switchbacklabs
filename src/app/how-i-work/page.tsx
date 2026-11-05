import SiteHeader from "@/components/layout/SiteHeader";
import Link from "next/link";

export const metadata = { title: "How I Work — Switchback Labs" };

type WorkLink = { href: string; label: string; external?: boolean };

const SECTIONS: {
  n: string;
  title: string;
  call: React.ReactNode;
  body: React.ReactNode;
  links: WorkLink[];
}[] = [
  {
    n: "01",
    title: "The useful piece",
    call: (
      <p>
        The job was a personal week of training. A product that stores every rider was a different job, and I did not take it.
      </p>
    ),
    body: (
      <>
        <p>
          A rider who already logs their rides still has to turn that history into next week. A generic plan ignores the riding they just did and the race they are pointing at. Accounts, a library of old plans, and a record of every rider are a lot of product for a week that gets rewritten.
        </p>
        <p className="mt-4">
          Training Coach is what shipped. The rider connects the rides they already have, sees the last 30 days, and chooses a plan. The default is a menu of sessions tagged by how the day feels, including an easy day. The other is a Monday-to-Sunday week, with the work, the fueling, and a note on the week after. The form asks for power, the hours available, and the kind of racing. A scheduled week also needs a weight and at least one race, because it cannot be written without them.
        </p>
        <p className="mt-4">
          There is no account and no saved plans. Sign-in lasts for that session. The app is live. I am not claiming who uses it, or whether the weeks get ridden.
        </p>
      </>
    ),
    links: [
      { href: "/projects/training", label: "Training Coach case study" },
      { href: "/training", label: "Open the app" },
    ],
  },
  {
    n: "02",
    title: "Something they can try",
    call: (
      <p>
        The job was a budget that can answer a price change. A picture of the budget cannot answer it.
      </p>
    ),
    body: (
      <>
        <p>
          A crop plan usually lives in a spreadsheet one person can follow, and a mock of the screens cannot run the question. The version on this site calculates. A grower or an advisor can replace the sample yield, price, and costs. Those numbers are labeled as samples, not a market. Revenue, margin, and break-even update as they type. They can move price and yield, share that exact scenario, and send a note with it attached.
        </p>
        <p className="mt-4">
          The loop is that note: what they were trying to do, what was confusing, and the scenario on screen, then a next version from the note rather than from a guess. No note has come through yet. This is a prototype you can use. It is not proof that anyone has taken it up.
        </p>
      </>
    ),
    links: [{ href: "/projects/crop-planning", label: "Crop planning case study" }],
  },
  {
    n: "03",
    title: "The operation",
    call: (
      <p>
        The job was one place for the deal and the request, next to the location. Another tool that could not see the rest was not the job.
      </p>
    ),
    body: (
      <>
        <p>
          A multi-location franchise already had places for property records, texts, the website, and appointments. Staff still had no shared path for a deal, and no shared path for a request. In my current role I owned the requirements, the records the commercial work needed, how those existing systems would connect, and the rollout.
        </p>
        <p className="mt-4">
          HubSpot holds that commercial view. The other systems stay where they are, and a deal can sit next to its location. A request sits with the deal and the location, instead of in an inbox that cannot see either. The stages follow this franchise&apos;s own motion, not a default sales path.
        </p>
        <p className="mt-4">
          The work is still open. There is no public number here for adoption, time saved, or revenue. The next step is a pattern other franchises could adapt, for each brand.
        </p>
      </>
    ),
    links: [{ href: "/projects/hubspot-franchise", label: "HubSpot case study" }],
  },
  {
    n: "04",
    title: "When it breaks",
    call: (
      <p>
        A version is not ready to hand someone if they cannot tell what went wrong.
      </p>
    ),
    body: (
      <>
        <p>
          Training Coach once sat on a message that said rides were loading, when nothing was. A refused sign-in came back as a missing code, which was not what had happened, because sign-in depended on a database that kept pausing. Pull request 7 on the{" "}
          <a
            href="https://github.com/cjones88a/switchbacklabs"
            className="text-gray-900 underline underline-offset-4"
          >
            public repo
          </a>{" "}
          drops that dependency and says what actually broke.
        </p>
        <p className="mt-4">
          The same bar is on the rest of this site. A change is a pull request, and it does not merge until lint, typecheck, tests, and a production build pass. That is about trust while someone is using it, not about how widely any of this is used.
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
            I start with the job someone is trying to finish. I cut that job to a small piece that is useful on its own, and I put a working version in the room with the people who do the job and the people who decide what gets built. Each section is one of those pieces, then the page that holds the proof, including what it has not shown yet.
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
                <div className="mt-4 leading-relaxed text-gray-900">{section.call}</div>
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
          <p className="text-[11px] tracking-widest uppercase text-white/50 mb-6">05</p>
          <h2 className="font-serif text-3xl md:text-4xl font-light tracking-tight">
            Building with AI
          </h2>
          <div className="mt-6 max-w-[68ch] space-y-4 text-lg leading-relaxed">
            <p className="text-white">
              I decide what the small version has to answer. A coding agent, and a model inside the product, are how that answer gets in front of someone.
            </p>
            <p className="text-white/80">
              Those are different jobs. The agent writes the software: the coach, the crop budget, and this site. The model answers inside the product. It drafts the training week from the rider&apos;s recent rides, and it sits in the HubSpot instance. Neither one chooses the problem.
            </p>
            <p className="text-white/80">
              Sample numbers stay labeled as samples. A failure still has to be said in plain language. The longer note is{" "}
              <Link href="/pm-of-the-future" className="text-white underline underline-offset-4">
                The PM of the Future
              </Link>
              . I prototype, I move fast, and I empathize. The need is the same. The path to a version someone can try is shorter.
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
