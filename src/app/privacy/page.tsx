export const metadata = { title: "Privacy Policy — Switchback Labs" };

export default function Privacy() {
  return (
    <article className="prose max-w-3xl">
      <h1>Privacy Policy</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>

      <h2>What we collect</h2>
      <ul>
        <li>Your Strava athlete profile (name, avatar) after you authorize.</li>
        <li>Activity times for five specific segment IDs used by the 4SOH race.</li>
        <li>Authentication tokens needed to read your activities from Strava.</li>
      </ul>

      <h2>How we use the data</h2>
      <ul>
        <li>Compute your overall season time and the sums for climber/descender awards.</li>
        <li>Show a public leaderboard <em>only for athletes who opt in</em>.</li>
      </ul>

      <h2>What we do <em>not</em> do</h2>
      <ul>
        <li>No write access to Strava (read-only).</li>
        <li>No sale or sharing of data with third parties.</li>
        <li>No use beyond the event leaderboard.</li>
      </ul>

      <h2>Data retention & deletion</h2>
      <p>
        We retain leaderboard data for historical results. You may ask us to remove your data at any time by emailing
        <a href="mailto:switchbacklabsco@gmail.com"> switchbacklabsco@gmail.com</a>. We’ll delete your data and revoke tokens.
      </p>

      <h2>Contact</h2>
      <p>Email: <a href="mailto:switchbacklabsco@gmail.com">switchbacklabsco@gmail.com</a></p>
    </article>
  );
}
