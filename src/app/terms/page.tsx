export const metadata = { title: "Terms of Service — Switchback Labs" };

export default function Terms() {
  return (
    <article className="prose max-w-3xl">
      <h1>Terms of Service</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>

      <h2>Summary</h2>
      <p>
        Switchback Labs provides a race tracking service for the Horsetooth Four-Seasons Challenge.
        By using the site, you agree to these terms.
      </p>

      <h2>Eligibility & Conduct</h2>
      <ul>
        <li>Use is voluntary and at your own risk; follow all trail rules and closures.</li>
        <li>Do not attempt to manipulate results.</li>
      </ul>

      <h2>Account & Content</h2>
      <ul>
        <li>You connect via Strava OAuth; we never see your Strava password.</li>
        <li>You can revoke access in Strava at any time.</li>
      </ul>

      <h2>Leaderboard & Consent</h2>
      <p>
        Your name and times are shown publicly only if you consent during connect. You can withdraw consent by email and we’ll remove display of your data.
      </p>

      <h2>Liability</h2>
      <p>The service is provided “as is” with no warranty. We’re not liable for indirect or incidental damages.</p>

      <h2>Contact</h2>
      <p>Email: <a href="mailto:switchbacklabsco@gmail.com">switchbacklabsco@gmail.com</a></p>
    </article>
  );
}
