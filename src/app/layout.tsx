import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Switchback Labs – Product Strategy & Technical PM",
  description:
    "Fractional PM and product leadership. Crisp strategy, evidence-based decisions, and specs developers love.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-zinc-900 antialiased">
        {/* Sticky header */}
        <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
            <Link href="/" className="font-semibold tracking-tight">
              Switchback Labs
            </Link>
            <nav className="hidden gap-6 text-sm md:flex">
              <Link href="/#services" className="hover:underline underline-offset-4">Services</Link>
              <Link href="/projects" className="hover:underline underline-offset-4">Projects</Link>
              <Link href="/race-trackingV2" className="hover:underline underline-offset-4">Race Tracker</Link>
            </nav>
            <div className="flex items-center gap-2">
              <Link
                href="mailto:switchbacklabsco@gmail.com?subject=Project%20inquiry"
                className="inline-flex items-center rounded-full bg-[#D5FF3F] px-4 py-1.5 text-sm font-medium text-[#132E1E] hover:brightness-95"
              >
                Start a project
              </Link>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4">{children}</main>

        <footer className="border-t border-zinc-200 py-8">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 md:flex-row md:items-center">
            <p className="text-sm text-zinc-600">© Switchback Labs — Fort Collins, CO</p>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/privacy" className="hover:underline">Privacy</Link>
              <Link href="/terms" className="hover:underline">Terms</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
