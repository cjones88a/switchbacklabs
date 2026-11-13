import Link from "next/link";
import type { ReactNode } from "react";
import SiteHeader from "@/components/layout/SiteHeader";
import ExpandAll from "./ExpandAll";
import styles from "./legal.module.css";

export function LegalPage({
  title,
  updated,
  lede,
  children,
}: {
  title: string;
  updated: string;
  lede: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main>
        <article className="section pt-12 md:pt-16">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted">Last updated {updated}</p>
          <h1 className="mt-3 font-serif text-4xl font-light tracking-tight text-gray-900 md:text-5xl">
            {title}
          </h1>
          <div className="mt-6 max-w-[68ch] text-lg leading-relaxed text-gray-700">{lede}</div>
          <div className="mt-10 max-w-3xl">
            <div className="no-print mb-1 flex justify-end">
              <ExpandAll />
            </div>
            <div className={styles.list} data-legal-list>
              {children}
            </div>
          </div>
        </article>
      </main>
      <footer className="border-t border-line">
        <div className="container-std flex flex-col gap-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
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

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details data-legal-section className={styles.details}>
      <summary className={styles.summary}>
        <span className="font-serif text-2xl font-light">{title}</span>
        <svg className={styles.chevron} viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M5 7.5 10 12.5 15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>
      <div className={`${styles.body} prose prose-gray max-w-none`}>{children}</div>
    </details>
  );
}
