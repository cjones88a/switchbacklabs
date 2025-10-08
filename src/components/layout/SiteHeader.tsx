"use client";
import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-line">
      <div className="container-std h-16 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold">
          <span className="align-middle">Switchback</span>
          <span className="align-middle">&nbsp;</span>
          <span className="align-middle text-accent">Labs</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/" className="hover:opacity-70">Home</Link>
          <Link href="/services" className="hover:opacity-70">Services</Link>
          <Link href="/projects" className="hover:opacity-70">Projects</Link>
          <Link href="/race-trackingV2" className="hover:opacity-70">Race Tracker</Link>
          <a className="btn btn-primary" href="mailto:switchbacklabsco@gmail.com">Start a project</a>
        </nav>
      </div>
    </header>
  );
}
