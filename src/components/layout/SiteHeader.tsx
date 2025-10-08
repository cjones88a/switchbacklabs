"use client";
import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-line">
      <div className="container-std h-24 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold">
          <span>Switchback</span><span className="text-accent">&nbsp;Labs</span>
        </Link>
        <nav className="flex items-center gap-10 text-sm">
          <Link href="/" className="hover:opacity-70">Home</Link>
          <Link href="/services" className="hover:opacity-70">Services</Link>
          <Link href="/projects" className="hover:opacity-70">Projects</Link>
          <Link href="/race-trackingV2" className="hover:opacity-70">Race Tracker</Link>
        </nav>
      </div>
    </header>
  );
}
