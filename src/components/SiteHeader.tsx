import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight">Switchback Labs</Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="hover:underline">Home</Link>
          {/* Internal route: safe to prefetch */}
          <Link
            href="/race-trackingV2"
            className="inline-flex items-center rounded-md border px-3 py-1.5 hover:bg-gray-50"
          >
            Race Tracker
          </Link>
        </nav>
      </div>
    </header>
  );
}
