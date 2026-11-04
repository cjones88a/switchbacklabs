import SiteHeader from "@/components/layout/SiteHeader";
import Link from "next/link";
import PillArrow from "@/components/ui/PillArrow";
import { PROTOTYPE_VERSION } from "@/lib/cropBudget";

export const metadata = { title: "Project: Crop Planning Prototype — Switchback Labs" };

const CHANGELOG = [
  {
    version: "v0.1",
    title: "Click-through",
    body: "Named fields, acreage, and a crop count. You could add a field and add a crop. The screen did not calculate a budget.",
  },
  {
    version: "v0.2",
    title: "A budget that calculates",
    body: "Corn, soybeans, wheat, and sugar beets, each with sample yield, price, and cost lines you can edit. Revenue, total cost, cost per acre, margin, margin per acre, break-even yield, and break-even price update as you type. The preset numbers are labeled as sample assumptions.",
  },
  {
    version: "v0.3",
    title: "Scenarios, sharing, and a place for feedback",
    body: "Price and yield sliders, a margin table across those moves, optional actuals and variance, a share link, CSV export, and the feedback panel. v0.2 and v0.3 are the two slices of this upgrade. They ship together. v0.1 is what the site had before them.",
  },
];

/**
 * TODO: When a real note arrives, set this to true and add the entry people
 * actually sent: version, what they were trying to do, what was confusing,
 * the rating, and the scenario link. Do not invent quotes, names, or counts.
 */
const SHOW_SHAPED_FEEDBACK = false;
const SHAPED_FEEDBACK: {
  version: string;
  trying: string;
  confusing: string;
  rating: number;
  scenarioUrl?: string;
}[] = [];

export default function CropPlanningOverview() {
  return (
    <>
      <SiteHeader />

      <section className="relative">
        <div className="section">
          <p className="text-[11px] tracking-widest uppercase text-muted mb-6">
            Project Details
          </p>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="inline-flex items-center rounded-full bg-gray-900 px-2.5 py-1 text-[11px] font-medium uppercase tracking-widest text-white">
              Prototype {PROTOTYPE_VERSION}
            </span>
          </div>
          <h1 className="h2">CROP PLANNING PROTOTYPE</h1>
          <p className="lead mt-6 max-w-[68ch]">
            A living budget, not a slide of one. Fifteen years in digital agriculture product work shows up here as a plan a grower or an advisor can change, share, and mark up. The current slice is {PROTOTYPE_VERSION}.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/projects/crop-planning/demo" className="btn btn-primary">
              Launch prototype
            </Link>
            <Link href="/projects/crop-planning/prd" className="btn btn-pill">
              Read the PRD
            </Link>
            <Link href="/projects" className="btn btn-pill">
              Back to projects <PillArrow />
            </Link>
          </div>
        </div>
      </section>

      <section className="section-paper">
        <div className="container-std">
          <div className="max-w-3xl">
            <h2 className="h2 mb-6">The problem</h2>
            <p className="text-muted leading-relaxed">
              A crop budget usually lives in a spreadsheet. Price, yield, and a dozen cost lines are in cells that only the author can find. Trying &quot;what if the price is off 15%&quot; means copying a tab, and the person across the table cannot open that same scenario on their own later. A static mock of the screens shows the layout and cannot answer the question.
            </p>

            <h2 className="h2 mt-14 mb-6">Why a living prototype</h2>
            <p className="text-muted leading-relaxed">
              The smallest useful slice is a plan that calculates. A field has acres and one crop. The crop brings sample yield, price, and cost lines. Those numbers are sample assumptions, labeled that way, and every one of them can be edited. Revenue, cost, margin, break-even yield, and break-even price update while you type. There is no account and no database. The point of the hour is the conversation, not a signup.
            </p>
            <p className="text-muted leading-relaxed mt-4">
              Price and yield sliders sit on top of the entered numbers, with a table of whole-farm margin across a few steps in each direction. Actual spend can be typed on a cost line when someone has it, and the variance is actual minus budget. Reset puts the sample plan back. CSV takes the budget out. Share this plan puts the exact scenario in the URL.
            </p>

            <h2 className="h2 mt-14 mb-6">The loop</h2>
            <ol className="mt-2 space-y-4 text-muted leading-relaxed list-decimal pl-5">
              <li>Build the smallest slice that answers a budgeting question.</li>
              <li>Put it in front of a grower or an advisor and let them use their own acres, prices, and costs.</li>
              <li>Ask what they were trying to do, what was confusing, and how useful it was. Attach the scenario they were looking at.</li>
              <li>Ship the next version the same week, from that note, not from a guessed roadmap.</li>
            </ol>
            <p className="text-muted leading-relaxed mt-4">
              The feedback control is in the prototype. It opens a GitHub issue on this repo, with email as the fallback. Attaching the scenario includes the share URL, so the next edit starts from the plan they had on screen. No one has sent a note through it yet.
            </p>

            <h2 className="h2 mt-14 mb-6">Building it with AI</h2>
            <p className="text-muted leading-relaxed">
              The loop only works if the next slice is cheap. AI coding agents are how a product manager ships that slice: the budget math, the sliders, the share link, and the feedback panel, in the same week the question came up. The agents write the code. The judgment stays on what the prototype has to answer, and on not pretending sample numbers are a market. The same practice is on{" "}
              <Link href="/how-i-work" className="text-gray-900 underline underline-offset-4">
                How I work
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <section className="relative" id="changelog">
        <div className="section">
          <div className="max-w-3xl">
            <h2 className="h2 mb-6">Changelog</h2>
            <ol className="space-y-8">
              {CHANGELOG.map((entry) => (
                <li key={entry.version} className="border-l border-gray-200 pl-5">
                  <p className="text-[11px] tracking-widest uppercase text-muted">{entry.version}</p>
                  <h3 className="mt-1 text-xl font-medium text-gray-900">{entry.title}</h3>
                  <p className="mt-2 text-muted leading-relaxed">{entry.body}</p>
                </li>
              ))}
            </ol>

            <h2 className="h2 mt-14 mb-6">Feedback that shaped the next version</h2>
            {SHOW_SHAPED_FEEDBACK && SHAPED_FEEDBACK.length > 0 ? (
              <ul className="space-y-4">
                {SHAPED_FEEDBACK.map((entry) => (
                  <li key={`${entry.version}-${entry.rating}`} className="rounded-xl border border-gray-200 p-4">
                    <p className="text-[11px] tracking-widest uppercase text-muted">
                      {entry.version} · usefulness {entry.rating} of 5
                    </p>
                    <p className="mt-2 text-gray-900">{entry.trying}</p>
                    <p className="mt-2 text-muted">{entry.confusing}</p>
                    {entry.scenarioUrl ? (
                      <a href={entry.scenarioUrl} className="mt-2 inline-block text-sm underline">
                        Open the scenario
                      </a>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted leading-relaxed">
                Nothing here yet. When a grower or advisor sends a note, this section will show that note: the prototype version, what they were trying to do, what was confusing, the usefulness rating, and the scenario link. Those lines stay empty until then.
              </p>
            )}
          </div>
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
