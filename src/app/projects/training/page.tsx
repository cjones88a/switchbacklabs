import SiteHeader from "@/components/layout/SiteHeader";
import Link from "next/link";
import PillArrow from "@/components/ui/PillArrow";
import { DEFAULT_ANTHROPIC_MODEL } from "@/lib/anthropicModel";

export const metadata = { title: "Project: Training Coach — Switchback Labs" };

const FLOW = [
  {
    n: "01",
    title: "Connect Strava",
    detail: "Read-only OAuth. Scopes are read and activity:read_all.",
  },
  {
    n: "02",
    title: "Seal the session",
    detail: "Access and refresh tokens go into an encrypted httpOnly cookie. Nothing is written to a database.",
  },
  {
    n: "03",
    title: "Pull recent riding",
    detail: "The last 60 activities. Rides and virtual rides become a 30-day summary.",
  },
  {
    n: "04",
    title: "Add racing context",
    detail: "FTP, hours per week, A and B races, racing type, and course style.",
  },
  {
    n: "05",
    title: "Generate a week",
    detail: "Claude returns either a flexible interval menu or a day-by-day plan.",
  },
];

export default function TrainingCoachProject() {
  return (
    <>
      <SiteHeader />

      <section className="relative">
        <div className="section">
          <p className="text-[11px] tracking-widest uppercase text-muted mb-6">
            Project Details
          </p>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-2.5 py-1 text-[11px] font-medium uppercase tracking-widest text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FC4C02]" aria-hidden />
              Live
            </span>
            <span className="text-[11px] tracking-widest uppercase text-muted">
              Session-only Strava
            </span>
          </div>
          <h1 className="h2">TRAINING COACH</h1>
          <p className="lead mt-6 max-w-[68ch]">
            A weekly training plan built from the athlete&apos;s own recent Strava rides,
            plus a short racing brief. The working app lives at{" "}
            <Link href="/training" className="text-gray-900 underline underline-offset-4">
              /training
            </Link>
            . There is no account and no database. The Strava token lasts for the browser session, then it is gone.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/training" className="btn btn-primary">Launch app</Link>
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
              A rider who already logs everything on Strava still has to translate that history into a week of training.
              Generic plans ignore last month&apos;s volume, the longest recent ride, and whether the next event is a climb, a flat race, or a mix.
              A full coaching product — accounts, stored tokens, a riders table — is a lot of infrastructure for a plan you regenerate when the week changes.
            </p>
            <p className="text-muted leading-relaxed mt-4">
              The product question was narrower. Can the plan be personal, and can the Strava credential stay off the server, if the only persistence is an encrypted cookie in the browser that requested it?
            </p>

            <h2 className="h2 mt-14 mb-6">How it works</h2>
            <p className="text-muted leading-relaxed">
              Signed out, the page is a connect card. Strava&apos;s authorize URL is built server-side. After the athlete approves, the callback exchanges the code, seals the tokens, and returns to the coach. Denied access, a failed token exchange, and missing environment variables each get their own message. The page does not sit on a spinner.
            </p>
          </div>

          <ol className="mt-10 grid gap-3 md:grid-cols-5" aria-label="From sign-in to a weekly plan">
            {FLOW.map((step) => (
              <li
                key={step.n}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="text-[11px] tracking-widest text-muted">{step.n}</div>
                <div className="mt-2 font-medium text-gray-900">{step.title}</div>
                <p className="mt-2 text-sm text-muted leading-relaxed">{step.detail}</p>
              </li>
            ))}
          </ol>

          <div className="max-w-3xl">
            <p className="text-muted leading-relaxed mt-8">
              With a valid session, the server reads the cookie and fetches the athlete profile plus the latest 60 activities directly from Strava. Rides and virtual rides are kept. The setup screen shows a 30-day summary: hours, ride count, and the longest ride. If Strava has a weight on the profile, the form pre-fills it in pounds. Power rides that recorded device watts are listed with average and weighted-average watts.
            </p>
            <p className="text-muted leading-relaxed mt-4">
              The athlete then sets FTP, available hours (the form starts at 8), and two questions about racing: endurance, sprint and punch, or both; and climbing, flat, rolling, or mixed. Races are a name, a date, and an A or B priority. The form opens with Unbound 100 as an editable placeholder, not a fixed event. A flexible menu needs an FTP. A day-by-day week also needs a weight and at least one race.
            </p>
            <p className="text-muted leading-relaxed mt-4">
              Generate posts that brief to the plan API. The model has to call a tool and return a structured object, so the UI can render it instead of scraping a paragraph. Either plan can be downloaded as CSV or printed to PDF. If the model key is missing, the app says the plan is not configured. It does not pretend a plan is on the way.
            </p>
          </div>
        </div>
      </section>

      <section className="relative">
        <div className="section">
          <div className="max-w-3xl">
            <h2 className="h2 mb-6">Two ways to use the week</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-gray-200 p-5">
                <h3 className="font-medium text-gray-900">Flexible menu</h3>
                <p className="mt-2 text-sm text-muted leading-relaxed">
                  The default. A short philosophy, a loose weekly rhythm, volume guidance, and five to eight interval options tagged by how the athlete feels that day, including a genuinely easy option. Each option has a watt target, a session length, a coaching note, and a power-and-time bar. The prompt asks for about two quality sessions plus easy riding, chosen by feel, for events in the two-to-four-hour range.
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 p-5">
                <h3 className="font-medium text-gray-900">Detailed week</h3>
                <p className="mt-2 text-sm text-muted leading-relaxed">
                  One week, Monday through Sunday. Phase, target volume, the week&apos;s focus, a limiter, insights, and a note on the following week. Each day has a zone, a session, intervals, and a fueling note. The summary also includes a field the UI labels &quot;Unbound target pace,&quot; carried over from the original gravel brief.
                </p>
              </div>
            </div>
            <p className="text-muted leading-relaxed mt-6">
              Both prompts bias the work toward the racing type and the course. Climbing courses pull toward sustained efforts. A sprint focus pulls toward short hard repeats. With no rides in the last 30 days, the flexible prompt tells the model to stay conservative.
            </p>

            <h2 className="h2 mt-14 mb-6">Privacy by design</h2>
            <p className="text-muted leading-relaxed">
              The Strava access token and refresh token live in a cookie named <code className="text-gray-800">training_strava</code>. It is httpOnly, SameSite=Lax, and Secure in production, so page scripts cannot read it and it is not sent on cross-site requests. The value is AES-256-GCM ciphertext. The key is the SHA-256 hash of <code className="text-gray-800">TRAINING_SESSION_SECRET</code>. A tampered cookie fails to open.
            </p>
            <p className="text-muted leading-relaxed mt-4">
              The cookie holds the access token, the refresh token, the Strava expiry, the athlete id, and an absolute session deadline. That deadline is 14 days from sign-in. Refreshing the Strava token writes a new cookie and does not extend the deadline. If the access token is inside five minutes of expiry, the server refreshes it in place before calling Strava. A failed refresh clears the cookie and the athlete connects again. There is no riders table and no token table for this app. When the cookie expires, or the browser drops it, the session is over.
            </p>

            <h2 className="h2 mt-14 mb-6">Dropping the database</h2>
            <p className="text-muted leading-relaxed">
              An earlier version of the race tracker stored Strava tokens in Supabase and read them back on each visit. On the free tier that project kept pausing. A login that depends on a paused database fails even when the environment variables are set, and it fails as a network error rather than a clear message. For a portfolio piece that has to keep working, that was the wrong dependency.
            </p>
            <p className="text-muted leading-relaxed mt-4">
              Training Coach dropped server-side storage. The tradeoff is the product: there is no saved history of generated plans, no account to come back to, and the session ends with the cookie. The race tracker on this site made the same call from the other direction. The public page is now a static demo with bundled sample riders, so it still renders when Supabase is paused and when no environment variables are set. The original tracker did use Strava and Supabase. This portfolio copy does not.
            </p>
          </div>
        </div>
      </section>

      <section className="section-paper">
        <div className="container-std">
          <div className="max-w-3xl">
            <h2 className="h2 mb-6">Stack</h2>
            <ul className="space-y-3 text-muted">
              <li>• Next.js App Router. The page is a server gate. The form is a client component.</li>
              <li>• Vercel. Required environment variables are the Strava client id, secret, and redirect URI, plus the session secret. The Anthropic key is required only when generating a plan.</li>
              <li>• Strava OAuth. Redirect path is <code className="text-gray-800">/api/strava/callback</code>.</li>
              <li>• Anthropic Claude, default model <code className="text-gray-800">{DEFAULT_ANTHROPIC_MODEL}</code>, overridable with <code className="text-gray-800">ANTHROPIC_MODEL</code>. The plan is requested with tool use so the response matches the menu or the week schema.</li>
              <li>• No database on this path.</li>
            </ul>

            <h2 className="h2 mt-14 mb-6">Built with AI</h2>
            <p className="text-muted leading-relaxed">
              Two different uses, and they stay separate. At runtime, Claude drafts the week from the Strava summary and the form. The app around that call — the OAuth callback, the sealed cookie, the form, the error states — was built in Cursor while learning to ship software with an AI coding agent. The constraint that shaped it was a coach that works without a database, and a page that says what is wrong when a token or a key is missing.
            </p>

            <h2 className="h2 mt-14 mb-6">Role</h2>
            <p className="text-muted">
              Product framing, the decision to keep tokens in the session, the choice between a flexible menu and a scheduled week, and the implementation.
            </p>
          </div>
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
