import Link from "next/link";

export const metadata = { title: "About — Switchback Labs" };

export default function About() {
  return (
    <article className="prose max-w-3xl">
      <h1>About Switchback Labs</h1>
      <p>
        I&apos;m Colt Jones, a senior product manager. I spent 15 years in digital agriculture product work at Nutrien, including a large enterprise ERP system. Switchback Labs is the portfolio: the product work, and learning to ship software with AI.
      </p>
      <p>
        The HubSpot write-up is a customized instance for a multi-location franchise brand.{" "}
        <Link href="/projects/hubspot-franchise">Read the case study</Link>.
        The way the work gets done is on <Link href="/how-i-work">How I work</Link>.
      </p>
      <p>Email me: <a href="mailto:switchbacklabsco@gmail.com">switchbacklabsco@gmail.com</a></p>
    </article>
  );
}
