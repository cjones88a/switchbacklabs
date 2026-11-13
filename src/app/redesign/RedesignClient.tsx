"use client";

import { Archivo_Black, DM_Sans, Fraunces, IBM_Plex_Sans, Source_Sans_3 } from "next/font/google";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PALETTES, type Palette } from "./palette";
import styles from "./redesign.module.css";

const archivo = Archivo_Black({ weight: "400", subsets: ["latin"], display: "swap" });
const dm = DM_Sans({ subsets: ["latin"], display: "swap" });
const plex = IBM_Plex_Sans({ weight: ["400", "500"], subsets: ["latin"], display: "swap" });
const fraunces = Fraunces({ subsets: ["latin"], display: "swap" });
const sourceSans = Source_Sans_3({ subsets: ["latin"], display: "swap" });

const PROJECTS: {
  index: string;
  title: string;
  body: string;
  href: string;
  label: string;
  study?: string;
}[] = [
  {
    index: "01",
    title: "Training Coach",
    body: "A weekly plan from your own Strava rides. The token stays in an encrypted browser cookie, and the page still works without a database. Flexible interval menu or a day-by-day week.",
    href: "/training",
    label: "Launch app",
    study: "/projects/training",
  },
  {
    index: "02",
    title: "Four Seasons One Hour",
    body: "Seasonal leaderboard for the Horsetooth Four Seasons challenge. This portfolio build shows the real UI on bundled sample riders, with no live Strava or database calls.",
    href: "/race-trackingV2",
    label: "View demo",
    study: "/projects/4soh",
  },
  {
    index: "03",
    title: "Crop planning",
    body: "A living budget prototype: sample cost assumptions you can edit, price and yield scenarios, and a share link so feedback points at the exact plan. No database.",
    href: "/projects/crop-planning/demo",
    label: "Launch prototype",
    study: "/projects/crop-planning",
  },
  {
    index: "04",
    title: "Franchise CRM on HubSpot",
    body: "A customized HubSpot instance for a multi-location franchise brand. Rent Manager, SalesMsg, Contentful, and Vagaro, with a custom pipeline, ticketing, and Claude in the instance.",
    href: "/projects/hubspot-franchise",
    label: "Case study",
  },
];

const THEME: Record<
  Palette,
  { bg: string; fg: string; accent: string; onAccent: string; label: string }
> = {
  tangerine: { bg: "#F7F2EA", fg: "#0C0C0D", accent: "#FF5A1F", onAccent: "#0C0C0D", label: "Tangerine" },
  cobalt: { bg: "#0C0C0D", fg: "#F7F2EA", accent: "#2E4BFF", onAccent: "#F7F2EA", label: "Cobalt" },
  coral: { bg: "#F3EDE2", fg: "#0E1A3A", accent: "#FF5A4C", onAccent: "#0E1A3A", label: "Coral" },
};

export default function RedesignClient({ initial }: { initial: Palette }) {
  const router = useRouter();
  const [palette, setPalette] = useState(initial);
  const theme = THEME[palette];

  useEffect(() => {
    setPalette(initial);
  }, [initial]);

  useEffect(() => {
    const previousBg = document.body.style.backgroundColor;
    const previousColor = document.body.style.color;
    document.body.style.backgroundColor = theme.bg;
    document.body.style.color = theme.fg;
    return () => {
      document.body.style.backgroundColor = previousBg;
      document.body.style.color = previousColor;
    };
  }, [theme.bg, theme.fg]);

  function choose(next: Palette) {
    if (next === palette) return;
    setPalette(next);
    router.replace(`/redesign?palette=${next}`, { scroll: false });
  }

  const display =
    palette === "tangerine" ? archivo.style.fontFamily : palette === "coral" ? fraunces.style.fontFamily : plex.style.fontFamily;
  const body =
    palette === "tangerine" ? dm.style.fontFamily : palette === "coral" ? sourceSans.style.fontFamily : plex.style.fontFamily;

  return (
    <div
      className={`${styles.shell} ${archivo.className} ${dm.className} ${plex.className} ${fraunces.className} ${sourceSans.className}`}
      data-palette={palette}
      style={{
        fontFamily: body,
        ["--bg" as string]: theme.bg,
        ["--fg" as string]: theme.fg,
        ["--accent" as string]: theme.accent,
        ["--on-accent" as string]: theme.onAccent,
        ["--ink" as string]: "#0C0C0D",
        ["--lime" as string]: "#D4FF3A",
        ["--muted" as string]: palette === "cobalt" ? "#CFC9BF" : palette === "coral" ? "#0E1A3A" : "#0C0C0D",
        ["--line" as string]: palette === "cobalt" ? "rgba(207,201,191,0.4)" : "rgba(12,12,13,0.18)",
        ["--card" as string]: palette === "cobalt" ? "#111216" : theme.bg,
        ["--focus" as string]: palette === "cobalt" ? "#D4FF3A" : "#2E4BFF",
        ["--navy" as string]: "#0E1A3A",
        ["--ivory" as string]: "#F3EDE2",
        ["--display" as string]: display,
        ["--body" as string]: body,
      }}
    >
      <div className={styles.switcher}>
        <Link href="/" className={styles.mark}>
          Switchback Labs
        </Link>
        <div className={styles.choices} role="group" aria-label="Color palette">
          {PALETTES.map((id) => (
            <button key={id} type="button" aria-pressed={palette === id} onClick={() => choose(id)}>
              {THEME[id].label}
            </button>
          ))}
        </div>
        <Link href="/" className={styles.live}>
          Live site
        </Link>
      </div>

      <header className={styles.hero}>
        <div className={styles.inner}>
          <p className={styles.wordmark}>Switchback</p>
          <p className={styles.kicker}>Product strategy and technical PM</p>
          <h1 className={styles.heroTitle}>
            Less Talk. <span>More Shipped.</span>
          </h1>
          <p className={styles.lead}>
            A portfolio of product work, and of learning to ship it with AI. Training Coach is the live app. The case studies are the write-ups.
          </p>
          <div className={styles.actions}>
            <a className={styles.cta} href="#work">
              View the work
            </a>
            <a className={`${styles.cta} ${styles.ghost}`} href="#contact">
              Say hi
            </a>
          </div>
        </div>
      </header>

      <section className={styles.band} aria-labelledby="pm-future">
        <div className={styles.inner}>
          <p className={styles.kicker}>The PM of the Future</p>
          <h2 id="pm-future">I prototype. I move fast. I empathize.</h2>
          <p>Customer need hasn&apos;t changed. The way I get there has.</p>
          <div className={styles.actions}>
            <Link className={styles.cta} href="/pm-of-the-future">
              Read it
            </Link>
          </div>
        </div>
      </section>

      <section id="work" className={styles.section}>
        <div className={styles.inner}>
          <p className={styles.kicker}>Featured work</p>
          <div className={styles.grid}>
            {PROJECTS.map((project) => (
              <article key={project.title} className={styles.card}>
                <p className={styles.index}>{project.index}</p>
                <h3>{project.title}</h3>
                <p>{project.body}</p>
                <div className={styles.cardLinks}>
                  <Link className={styles.cta} href={project.href}>
                    {project.label}
                  </Link>
                  {project.study ? (
                    <Link className={styles.textLink} href={project.study}>
                      Case study
                    </Link>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.practice}`} id="how">
        <div className={styles.inner}>
          <p className={styles.kicker}>How I work</p>
          <h2>Decisions you can open</h2>
          <p>
            I start with the job someone is trying to finish. I cut that job to a small piece that is useful on its own, and I put a working version in the room with the people who do the job and the people who decide what gets built. Each section on the practice page is one of those pieces, then the page that holds the proof, including what it has not shown yet.
          </p>
          <div className={styles.actions}>
            <Link className={styles.cta} href="/how-i-work">
              How I work
            </Link>
            <Link className={`${styles.cta} ${styles.ghost}`} href="/projects/hubspot-franchise">
              HubSpot case study
            </Link>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.about}`} id="about">
        <div className={styles.inner}>
          <p className={styles.kicker}>About</p>
          <h2>Colt Jones</h2>
          <p>
            I&apos;m Colt Jones, a senior product manager. I spent 15 years in digital agriculture product work at Nutrien, including a large enterprise ERP system. Switchback Labs is the portfolio: the product work, and learning to ship software with AI.
          </p>
          <p>
            <Link className={styles.textLink} href="/about">
              About page
            </Link>
          </p>
        </div>
      </section>

      <section className={styles.band} id="contact">
        <div className={`${styles.inner} ${styles.contact}`}>
          <h2>Say hi</h2>
          <p>The work is on the site. Email if you want to talk about it.</p>
          <div className={styles.actions}>
            <a className={styles.cta} href="mailto:switchbacklabsco@gmail.com">
              switchbacklabsco@gmail.com
            </a>
            <a
              className={`${styles.cta} ${styles.ghost}`}
              href="https://github.com/cjones88a"
              target="_blank"
              rel="noopener noreferrer"
            >
              View GitHub
            </a>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <span>© Switchback Labs — Fort Collins, CO</span>
        <span>Redesign prototype. Not indexed.</span>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
      </footer>
    </div>
  );
}
