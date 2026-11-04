import SiteHeader from "@/components/layout/SiteHeader";
import Link from "next/link";

export const metadata = {
  title: "The PM of the Future — Switchback Labs",
  description:
    "I prototype, I move fast, I empathize. Customer need hasn't changed. The way I get there has.",
};

const PILLARS: {
  n: string;
  title: string;
  body: string;
  links: { href: string; label: string }[];
}[] = [
  {
    n: "01",
    title: "Prototype",
    body: "A deck describes the product. A static mock is a picture of it. I would rather hand someone software they can use. The crop budget calculates margin, break-even, and a price-and-yield scenario from numbers you can edit. Training Coach connects to Strava and writes a week. Both are open.",
    links: [
      { href: "/projects/crop-planning", label: "Crop planning case study" },
      { href: "/projects/crop-planning/demo", label: "Launch the prototype" },
      { href: "/projects/training", label: "Training Coach" },
    ],
  },
  {
    n: "02",
    title: "Move fast",
    body: "I want the idea in front of a person the same week, and the next version in the days after they react. The crop budget started as a click-through that could not calculate. It is now a plan you can edit, share, and send a note against. Training Coach is live, and the production fix that kept the session alive shipped as a pull request.",
    links: [
      { href: "/how-i-work", label: "How I work" },
      { href: "/projects/crop-planning", label: "The crop planning loop" },
      { href: "/projects/training", label: "How the coach shipped" },
    ],
  },
  {
    n: "03",
    title: "Empathize",
    body: "Speed is wasted on the wrong job. I still sit with the person who does the work, and I stay with the need. Training Coach is for one rider who already logs rides and wants a week from that history. The HubSpot instance is for a multi-location franchise, shaped around the systems they already run. The prototype gives us something to react to. The need decides what stays.",
    links: [
      { href: "/projects/training", label: "How the coach was scoped" },
      { href: "/projects/hubspot-franchise", label: "HubSpot case study" },
      { href: "/how-i-work", label: "Discovery, on the record" },
    ],
  },
];

const THEN = [
  "Write the PRD.",
  "Then mockups.",
  "Then wait on an engineering sprint.",
  "Then a reveal, and a meeting about whether it was the right thing.",
];

const NOW = [
  "Start with the conversation.",
  "Put a working prototype in the room.",
  "Take feedback on that prototype, with the scenario still in front of us.",
  "Ship the next version.",
];

const STAYS = [
  {
    title: "Customer need",
    body: "Someone is still trying to get a job done. That is the point of the work.",
  },
  {
    title: "Judgment",
    body: "A faster way to build does not choose the right problem.",
  },
  {
    title: "Prioritization",
    body: "Most ideas should wait. A prototype makes the tradeoff easier to see. It does not make it for me.",
  },
  {
    title: "Saying no",
    body: "If the prototype shows the idea is wrong, the answer is still no.",
  },
];

export default function PmOfTheFuturePage() {
  return (
    <>
      <SiteHeader />

      <section className="relative">
        <div className="section pb-12 md:pb-20">
          <p className="text-[11px] tracking-widest uppercase text-muted mb-6">
            The PM of the Future
          </p>
          <h1 className="font-serif text-5xl md:text-7xl font-light leading-[1.05] tracking-tight max-w-[14ch]">
            I prototype.
            <br />
            I move fast.
            <br />
            I empathize.
          </h1>
          <p className="mt-8 max-w-[36ch] text-xl md:text-2xl text-gray-800 leading-snug">
            Customer need hasn&apos;t changed. The way I get there has.
          </p>
          <p className="mt-6 max-w-[62ch] text-muted leading-relaxed">
            I still start with what someone is trying to get done. I don&apos;t spend the month describing it. I build a small version, put it in the room, and change it from what people actually do with it.
          </p>
        </div>
      </section>

      <section className="section-paper">
        <div className="container-std">
          <ol>
            {PILLARS.map((pillar) => (
              <li
                key={pillar.n}
                className="grid gap-4 border-t border-gray-200 py-10 first:border-t-0 first:pt-0 md:grid-cols-12 md:gap-10 md:py-14"
              >
                <div className="md:col-span-4">
                  <p className="text-[11px] tracking-widest uppercase text-muted">{pillar.n}</p>
                  <h2 className="mt-2 font-serif text-4xl md:text-5xl font-light tracking-tight text-gray-900">
                    {pillar.title}
                  </h2>
                </div>
                <div className="md:col-span-8 md:pt-6">
                  <p className="text-gray-700 leading-relaxed">{pillar.body}</p>
                  <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
                    {pillar.links.map((link) => (
                      <Link
                        key={link.href + link.label}
                        href={link.href}
                        className="text-sm font-medium text-gray-900 underline underline-offset-4"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="relative">
        <div className="section">
          <p className="text-[11px] tracking-widest uppercase text-muted mb-6">Then, and now</p>
          <h2 className="h2 max-w-[18ch]">The loop got shorter. The job did not.</h2>
          <p className="lead mt-6 max-w-[62ch]">
            This is the loop I used to run, and the loop I run now. Documents still have a place when a decision needs to be written down. They are no longer the thing I wait on.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
              <p className="text-[11px] tracking-widest uppercase text-muted">Then</p>
              <ol className="mt-6 space-y-4">
                {THEN.map((step, i) => (
                  <li key={step} className="flex gap-4 text-gray-700 leading-relaxed">
                    <span className="font-serif text-2xl font-light text-gray-300 tabular-nums">
                      {i + 1}
                    </span>
                    <span className="pt-1">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-xl bg-gray-900 p-6 text-white sm:p-8">
              <p className="text-[11px] tracking-widest uppercase text-white/50">Now</p>
              <ol className="mt-6 space-y-4">
                {NOW.map((step, i) => (
                  <li key={step} className="flex gap-4 leading-relaxed">
                    <span className="font-serif text-2xl font-light text-white/30 tabular-nums">
                      {i + 1}
                    </span>
                    <span className="pt-1 text-white/90">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="section-paper">
        <div className="container-std">
          <p className="text-[11px] tracking-widest uppercase text-muted mb-6">In the room</p>
          <h2 className="h2 max-w-[20ch]">Customers and leadership, with the same prototype.</h2>
          <div className="mt-8 grid gap-8 md:grid-cols-2 max-w-4xl">
            <p className="text-gray-700 leading-relaxed">
              I work directly with customers and with leadership teams. A working prototype changes those conversations. Leadership can point at something that already runs, instead of agreeing to a description of it. A customer can try the job and say where it breaks.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Same artifact, different questions. Leadership is deciding what to build. The customer is telling me whether it fits. The reaction is about the work, not about how well a deck was written.
            </p>
          </div>
        </div>
      </section>

      <section className="relative">
        <div className="section">
          <p className="text-[11px] tracking-widest uppercase text-muted mb-6">What doesn&apos;t change</p>
          <h2 className="h2 max-w-[16ch]">Faster is not the same as careless.</h2>
          <ul className="mt-10 grid gap-px overflow-hidden rounded-xl border border-gray-200 bg-gray-200 sm:grid-cols-2">
            {STAYS.map((item) => (
              <li key={item.title} className="bg-white p-6 sm:p-8">
                <h3 className="font-serif text-2xl font-light tracking-tight">{item.title}</h3>
                <p className="mt-3 text-muted leading-relaxed">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-gray-900 text-white">
        <div className="section">
          <h2 className="font-serif text-4xl md:text-6xl font-light tracking-tight leading-[1.05] max-w-[14ch]">
            And it&apos;s more fun.
          </h2>
          <p className="mt-6 max-w-[54ch] text-lg text-white/80 leading-relaxed">
            I still focus on the customer need. The way I work is faster, more efficient, and more fun. I would rather spend the week building the thing and sitting with the person who uses it than polishing a story about the thing.
          </p>
          <p className="mt-8 text-white/80">
            The work is on the site. Email{" "}
            <a
              href="mailto:switchbacklabsco@gmail.com"
              className="text-white underline underline-offset-4"
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
