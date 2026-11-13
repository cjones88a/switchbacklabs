import { LegalPage, LegalSection } from "@/components/legal/LegalPage";

export const metadata = { title: "Privacy Policy — Switchback Labs" };

export default function Privacy() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="November 13, 2026"
      lede={
        <>
          <p>
            Switchback Labs is my site. I&apos;m Colt Jones, in Fort Collins, Colorado. This page is what switchbacklabsco.com does with information today.
          </p>
          <ul className="mt-6 list-disc space-y-3 pl-5 text-base leading-relaxed">
            <li>
              <strong className="font-medium text-gray-900">Training Coach</strong>, if you connect it, reads your Strava profile and recent rides, including private activities. The tokens sit in an encrypted cookie for 14 days. Generating a week sends a ride summary and your form to Anthropic. The plan is not saved. If you accept the disclaimer, this browser also keeps that acceptance (the version and the time) in a second encrypted cookie.
            </li>
            <li>
              <strong className="font-medium text-gray-900">The race page</strong> shows fictional sample riders. It does not read your Strava account, and this site does not keep a database of race results.
            </li>
            <li>
              <strong className="font-medium text-gray-900">The crop prototype</strong> keeps a plan in this browser, and in a share link if you copy one.
            </li>
            <li>
              <strong className="font-medium text-gray-900">PedalHub</strong> can ask the browser for your location to place a dot on the map. That location is not saved here.
            </li>
            <li>The site is hosted on Vercel. The code does not add an analytics product, and there is no contact form.</li>
          </ul>
          <p className="mt-6 text-base">
            Email{" "}
            <a className="text-gray-900 underline underline-offset-4" href="mailto:switchbacklabsco@gmail.com">
              switchbacklabsco@gmail.com
            </a>{" "}
            if you want a message you sent deleted, or help disconnecting Strava.
          </p>
        </>
      }
    >
      <LegalSection title="Training Coach">
        <p>
          Training Coach is at <a href="/training">/training</a>. Connecting it sends you to Strava. The permission requested is Strava&apos;s <code>read</code> scope and <code>activity:read_all</code>. That second scope includes private activities. The app does not request permission to change your Strava account.
        </p>
        <p>After you approve, the server asks Strava for:</p>
        <ul>
          <li>An access token, a refresh token, and when the access token expires.</li>
          <li>Your numeric Strava athlete id.</li>
          <li>On later visits, your athlete profile (first name, last name, profile photo URL, and weight if Strava has it) and up to 60 of your most recent activities.</li>
        </ul>
        <p>
          From those activities the app keeps rides and virtual rides. The summary you see uses about the last 30 days: hours, ride count, the longest ride&apos;s name and duration, up to 15 recent rides (name, date, duration, distance, power, heart rate, elevation, sport), and up to five power-meter rides. I do not run a Training Coach account or a riders table for this app.
        </p>
      </LegalSection>

      <LegalSection title="The session cookie">
        <p>
          The access token, refresh token, token expiry, athlete id, and a session deadline are stored in a cookie named <code>training_strava</code>. The cookie is httpOnly, so scripts on the page cannot read it. In production it is only sent over HTTPS. It is SameSite=Lax and is sent back to this site, not attached to other sites&apos; requests. The value is encrypted. The session deadline is 14 days from sign-in. Refreshing the Strava token does not extend that deadline. If a refresh fails, the server clears the cookie.
        </p>
        <p>
          Accepting the plan disclaimer stores a second cookie, <code>training_disclaimer</code>. It holds the disclaimer version and the time you accepted it. It does not hold your rides, your name, or the plan. It is encrypted, httpOnly, and lasts 180 days. If the disclaimer text changes, you are asked again. Deleting the cookie in your browser clears it.
        </p>
        <p>
          There is no disconnect button in the app. You can revoke Switchback Labs in{" "}
          <a href="https://www.strava.com/settings/apps">Strava&apos;s app settings</a>. You can also delete the cookie in your browser. After 14 days the cookie is no longer accepted.
        </p>
      </LegalSection>

      <LegalSection title="The training plan">
        <p>
          When you generate a week, your browser sends the Strava summary and your form to this site. The form is FTP, hours per week, racing type, and course style. The detailed week also requires weight and at least one race name, date, and priority. Weight can be prefilled from Strava and edited.
        </p>
        <p>
          The server sends a prompt to Anthropic (Claude) to draft the plan. That prompt includes FTP, weight if you provided it, hours, race names and dates, racing type, course style, and a text summary of recent rides: name, duration, power, and sport. The request body also includes heart rate, distance, elevation, your name, and the profile photo URL. Those fields are not copied into the prompt. The plan comes back to your browser. It is not written to a database. Leaving the page drops it, unless your own browser kept it.
        </p>
        <p>
          Anthropic processes that prompt to produce the plan. I do not use the plan to train a model of my own. I do not control Anthropic&apos;s retention of API inputs. Their terms apply to that processing.
        </p>
      </LegalSection>

      <LegalSection title="The race page">
        <p>
          The public page at <a href="/race-trackingV2">/race-trackingV2</a> shows fictional riders bundled with the site. That page does not call Strava and does not call a database. The names and times on it are sample data, not other athletes. This site does not keep a database of rider names, segment times, or Strava tokens.
        </p>
      </LegalSection>

      <LegalSection title="Crop planning prototype">
        <p>
          The crop budget prototype runs in your browser. It has no account. The plan (a farm name, field names, acres, crop, yield, price, and cost figures) is saved in this browser under the local storage key <code>switchback-crop-plan-v1</code>. Reset clears that entry.
        </p>
        <p>
          A share link puts that same plan in the URL. Anyone with the link can open that scenario. It is not a private account. Feedback, if you send it, opens a GitHub issue on the public repository cjones88a/switchbacklabs, or your email app addressed to me. The issue or email can include what you typed and, if you leave the box checked, the share link. I do not receive that note unless you send it.
        </p>
      </LegalSection>

      <LegalSection title="PedalHub">
        <p>
          PedalHub is a prototype with sample rides. Its weather figures are placeholders, not a live forecast. The map can ask your browser for your location and keep a dot on the map in the page. That location is not saved on this server. If the map tiles load, Mapbox receives the request for the area on the screen.
        </p>
      </LegalSection>

      <LegalSection title="Hosting, email, and logs">
        <p>
          The site is hosted on Vercel. Serving a page means Vercel receives the request, including the IP address and ordinary request headers. This repository does not add a separate analytics product.
        </p>
        <p>
          There is no contact form. Email links open your own mail app to switchbacklabsco@gmail.com. I receive a message only if you send one.
        </p>
        <p>
          If generating a training plan fails, the server log on Vercel can include a short slice of the error and up to a few hundred characters of the model&apos;s text. I do not set a custom log retention period in this repository.
        </p>
      </LegalSection>

      <LegalSection title="What I don't do">
        <ul>
          <li>I don&apos;t sell this information.</li>
          <li>I don&apos;t write to your Strava account from Training Coach.</li>
          <li>I don&apos;t keep a database of plans, rides, tokens, or race results.</li>
          <li>The public race page does not publish your name or your times.</li>
        </ul>
      </LegalSection>

      <LegalSection title="How long it stays">
        <ul>
          <li>The Training Coach cookie lasts 14 days, or until you delete it, or until a failed token refresh clears it.</li>
          <li>The disclaimer acceptance cookie lasts 180 days, or until you delete it. It stores the version and the time only.</li>
          <li>A generated plan is not stored on the server.</li>
          <li>A crop plan stays in this browser until you reset it or clear site data. A share link lasts as long as someone keeps the URL.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Children">
        <p>
          The site is not aimed at children. It does not ask for a child&apos;s account, and it does not check age. If you believe a child&apos;s information was sent here, email me and I will delete what I can.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Email: <a href="mailto:switchbacklabsco@gmail.com">switchbacklabsco@gmail.com</a>
        </p>
      </LegalSection>
    </LegalPage>
  );
}
