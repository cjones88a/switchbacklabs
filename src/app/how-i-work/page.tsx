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
    title: "Strategy and scoping",
    call: (
      <p>
        A personal week of training was worth shipping. A database of riders was not.
      </p>
    ),
    body: (
      <>
        <p>
          A rider who already logs rides on Strava still has to turn that history into a week. A full coaching product — accounts, saved plans, tokens stored on a server — is a lot of system for a plan you regenerate when the week changes.
        </p>
        <p className="mt-4">
          I considered keeping the Strava token in Supabase, the way an earlier race tracker did. That free project kept pausing, and a login that depended on it failed even when the environment was set. I rejected that dependency. Success was narrower: the plan uses the rider&apos;s own recent rides, and the app still opens with no database.
        </p>
        <p className="mt-4">
          What shipped is Training Coach. The token stays in an encrypted browser cookie for that session, and the week is read from Strava then. There is no saved history of plans. The session ends with the cookie.
        </p>
      </>
    ),
    links: [{ href: "/projects/training", label: "Training Coach case study" }],
  },
  {
    n: "02",
    title: "Discovery and validation",
    call: (
      <p>
        The coach is for one rider who already has the rides. I only ask for what the plan uses.
      </p>
    ),
    body: (
      <>
        <p>
          This write-up is not a research study. The person is someone who logs on Strava and wants a week from that history, plus a little racing context. I did not open with a profile. The form asks for FTP, hours per week, racing type, and course style. A day-by-day week also asks for weight and at least one race, because that plan cannot be written without them.
        </p>
        <p className="mt-4">
          What I threw out on the page itself is a spinner that pretends the data is coming. Signed out, access denied, a failed token exchange, and a missing model key each say what broke.
        </p>
        <p className="mt-4">
          The crop budget tests a different call. A static mock cannot answer what happens if the price moves. A grower or advisor can edit the sample assumptions, move price and yield, and send a note with that exact scenario attached. No one has sent a note through it yet. Until someone does, I do not treat the prototype as validated.
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
    call: (
      <p>
        I kept two ways to use the week, and I cut the rest of a coaching product.
      </p>
    ),
    body: (
      <>
        <p>
          The default is a flexible menu. Options are tagged by how the day feels, including an easy one, so the rider is not forced onto a calendar. The other choice is a Monday-through-Sunday week, with zones, fueling notes, and a note on the week after, for when they want the schedule.
        </p>
        <p className="mt-4">
          I did not build accounts, a library of past plans, or a way back to last week&apos;s draft.{" "}
          <Link href="/training" className="text-gray-900 underline underline-offset-4">
            /training
          </Link>{" "}
          is a short path on purpose: connect Strava, see the last 30 days of rides, then choose a plan.
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
    call: (
      <p>
        If the page cannot say what broke, it is not done.
      </p>
    ),
    body: (
      <>
        <p>
          Production <span className="text-gray-800">/training</span> used to stop on a prerendered spinner that said it was loading Strava data. A denied login was reported as a missing code, and the token was written to Supabase. That project was paused, so the exchange never became a session. Pull request 7 seals the token in the cookie and returns a specific error instead.
        </p>
        <p className="mt-4">
          That is how a bug gets closed here. The change is a pull request on the{" "}
          <a
            href="https://github.com/cjones88a/switchbacklabs"
            className="text-gray-900 underline underline-offset-4"
          >
            public repo
          </a>
          , and it does not merge until lint, typecheck, tests, and a production build pass.
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
    call: (
      <p>
        The franchise needed one place for the commercial work, not another tool that ignored the ones staff already used.
      </p>
    ),
    body: (
      <>
        <p>
          Leases, texts, the website, and appointments lived in separate products, and there was no shared deal path or ticket path. I shaped a HubSpot instance around that operation, in the current role.
        </p>
        <p className="mt-4">
          Rent Manager, SalesMsg, Contentful, and Vagaro connect through HubSpot. The pipeline follows this franchise&apos;s motion rather than a default sales path. Tickets sit with the deal and the property data. Custom objects sync with Rent Manager, so a deal can sit next to the location. Claude is in the instance the team uses.
        </p>
        <p className="mt-4">
          There is no public outcome number for this. The work is still open. The next step is to turn this instance into a reusable pattern for other franchises, adapted per brand.
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
            Each section opens with a call I made, then the page that holds the evidence.
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
          <p className="text-[11px] tracking-widest uppercase text-white/50 mb-6">06</p>
          <h2 className="font-serif text-3xl md:text-4xl font-light tracking-tight">
            Building with AI
          </h2>
          <div className="mt-6 max-w-[68ch] space-y-4 text-lg leading-relaxed">
            <p className="text-white">
              I decide what the slice has to answer. The coding agent and the model are how that answer gets in front of someone.
            </p>
            <p className="text-white/80">
              Those are different jobs. The agent writes the code: the coach, the crop budget, and this site. The model answers inside the product. Claude drafts the training week from the rider&apos;s recent rides, and Claude sits in the HubSpot instance. I do not treat either as the product.
            </p>
            <p className="text-white/80">
              The judgment stays on the call. The coach still has to say what broke when a token or a key is missing. The crop numbers stay labeled as sample assumptions, not a market. That budget was small enough to ship in the week the question came up: a plan that calculates, a share link, and a place to send a note. None of it merges until lint, types, tests, and the production build pass.
            </p>
            <p className="text-white/80">
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
