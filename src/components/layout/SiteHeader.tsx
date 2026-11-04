"use client";
import Link from "next/link";
import SwitchbackMark from "@/components/brand/SwitchbackMark";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-line">
      <div className="container-std h-16 md:h-24 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold shrink-0">
          <SwitchbackMark className="h-7 w-7" />
          <span>Switchback</span><span className="text-accent">&nbsp;Labs</span>
        </Link>
        <nav className="hidden sm:flex items-center gap-4 lg:gap-6 xl:gap-8 text-sm whitespace-nowrap">
          <Link href="/" className="hover:opacity-70">Home</Link>
          <Link href="/pm-of-the-future" className="hover:opacity-70">PM of the future</Link>
          <Link href="/how-i-work" className="hover:opacity-70">How I work</Link>
          <Link href="/projects" className="hover:opacity-70">Projects</Link>
          <Link href="/race-trackingV2" className="hidden lg:inline hover:opacity-70">Race Tracker</Link>
        </nav>
      </div>
    </header>
  );
}
