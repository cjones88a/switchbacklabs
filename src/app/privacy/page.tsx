export const metadata = { title: "Privacy Policy — Switchback Labs" };

export default function Privacy() {
  return (
    <article className="prose max-w-3xl">
      <h1>Privacy Policy</h1>
      <p>Last updated: November 13, 2026</p>
      <p>
        Switchback Labs is my site. I&apos;m Colt Jones, in Fort Collins, Colorado. This page describes what switchbacklabsco.com does with information today. Email{" "}
        <a href="mailto:switchbacklabsco@gmail.com">switchbacklabsco@gmail.com</a> if you want a record deleted or a Strava connection cut off.
      </p>

      <h2>The short version</h2>
      <p>
        Most pages are writing. They do not ask you to make an account. The live app that reads personal data is Training Coach. It uses Strava, keeps the Strava tokens in an encrypted cookie in your browser, and sends a summary of recent rides plus the form you fill in to Anthropic to draft a training week. That plan is not saved in a database.
      </p>
      <p>
        The Four Seasons race page on this site is a demo with fictional riders. It does not connect your Strava account. Older race-tracker routes are still deployed. I describe those below, including what I cannot confirm from the code.
      </p>

      <h2>Training Coach</h2>
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

      <h3>The session cookie</h3>
      <p>
        The access token, refresh token, token expiry, athlete id, and a session deadline are stored in a cookie named <code>training_strava</code>. The cookie is httpOnly, so scripts on the page cannot read it. In production it is only sent over HTTPS. It is SameSite=Lax and is sent back to this site, not attached to other sites&apos; requests. The value is encrypted. The session deadline is 14 days from sign-in. Refreshing the Strava token does not extend that deadline. If a refresh fails, the server clears the cookie.
      </p>
      <p>
        There is no disconnect button in the app. You can revoke Switchback Labs in{" "}
        <a href="https://www.strava.com/settings/apps">Strava&apos;s app settings</a>. You can also delete the cookie in your browser. After 14 days the cookie is no longer accepted.
      </p>

      <h3>The training plan</h3>
      <p>
        When you generate a week, your browser sends the Strava summary and your form to this site. The form is FTP, hours per week, racing type, and course style. The detailed week also requires weight and at least one race name, date, and priority. Weight can be prefilled from Strava and edited.
      </p>
      <p>
        The server sends a prompt to Anthropic (Claude) to draft the plan. That prompt includes FTP, weight if you provided it, hours, race names and dates, racing type, course style, and a text summary of recent rides: name, duration, power, and sport. The request body also includes heart rate, distance, elevation, your name, and the profile photo URL. Those fields are not copied into the prompt. The plan comes back to your browser. It is not written to a database. Leaving the page drops it, unless your own browser kept it.
      </p>
      <p>
        Anthropic processes that prompt to produce the plan. I do not use the plan to train a model of my own. I do not control Anthropic&apos;s retention of API inputs. Their terms apply to that processing.
      </p>

      <h2>Four Seasons race page</h2>
      <p>
        The public page at <a href="/race-trackingV2">/race-trackingV2</a> shows fictional riders bundled with the site. That page does not call Strava and does not call a database. The names and times on it are sample data, not other athletes.
      </p>
      <p>
        The original tracker did use Strava and Supabase. Code for that tracker is still in the project, and some of those routes are still deployed even though the public page does not link to them. If they are called, they can read or write Supabase tables used for rider ids, first and last name, a profile photo URL, segment times, and Strava tokens. A leaderboard route can return stored names and times when those rows exist. A debug route can report whether an old rider-id cookie is present, and it can return counts of stored attempts and tokens plus season-window dates. The current Strava callback does not set that old rider cookie and does not write tokens into Supabase.
      </p>
      <p>
        I cannot tell from this repository whether the production database still has anyone&apos;s rows. If you used the old tracker and want those records removed, email me and I will delete what I can find for you.
      </p>

      <h2>Crop planning prototype</h2>
      <p>
        The crop budget prototype runs in your browser. It has no account. The plan (a farm name, field names, acres, crop, yield, price, and cost figures) is saved in this browser under the local storage key <code>switchback-crop-plan-v1</code>. Reset clears that entry.
      </p>
      <p>
        A share link puts that same plan in the URL. Anyone with the link can open that scenario. It is not a private account. Feedback, if you send it, opens a GitHub issue on the public repository cjones88a/switchbacklabs, or your email app addressed to me. The issue or email can include what you typed and, if you leave the box checked, the share link. I do not receive that note unless you send it.
      </p>

      <h2>PedalHub</h2>
      <p>
        PedalHub is a prototype with sample rides. Its weather figures are placeholders, not a live forecast. The map can ask your browser for your location and keep a dot on the map in the page. That location is not saved on this server. If the map tiles load, Mapbox receives the request for the area on the screen.
      </p>

      <h2>Hosting, email, and logs</h2>
      <p>
        The site is hosted on Vercel. Serving a page means Vercel receives the request, including the IP address and ordinary request headers. This repository does not add a separate analytics product.
      </p>
      <p>
        There is no contact form. Email links open your own mail app to switchbacklabsco@gmail.com. I receive a message only if you send one.
      </p>
      <p>
        If a Training Coach or race route fails, the server log on Vercel can include a short slice of the error. Training plan failures can include up to a few hundred characters of the model&apos;s text. Race routes can log a rider id or a sample of stored rider fields. I do not set a custom log retention period in this repository.
      </p>
      <p>
        The admin page stores its password in that browser&apos;s local storage and sends it to routes that edit season dates. That is not a visitor account, and those routes do not take a Strava login.
      </p>

      <h2>What I don&apos;t do</h2>
      <ul>
        <li>I don&apos;t sell this information.</li>
        <li>I don&apos;t write to your Strava account from Training Coach.</li>
        <li>I don&apos;t keep a Training Coach database of plans, rides, or tokens.</li>
        <li>The public race page does not publish your name or your times.</li>
      </ul>

      <h2>How long it stays</h2>
      <ul>
        <li>The Training Coach cookie lasts 14 days, or until you delete it, or until a failed token refresh clears it.</li>
        <li>A generated plan is not stored on the server.</li>
        <li>A crop plan stays in this browser until you reset it or clear site data. A share link lasts as long as someone keeps the URL.</li>
        <li>I have no automatic deletion schedule in the code for older race rows in Supabase. Email me to ask for deletion.</li>
      </ul>

      <h2>Children</h2>
      <p>
        The site is not aimed at children. It does not ask for a child&apos;s account, and it does not check age. If you believe a child&apos;s information was sent here, email me and I will delete what I can.
      </p>

      <h2>Contact</h2>
      <p>
        Email: <a href="mailto:switchbacklabsco@gmail.com">switchbacklabsco@gmail.com</a>
      </p>
    </article>
  );
}
