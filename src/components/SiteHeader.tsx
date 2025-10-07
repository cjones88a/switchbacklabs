import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function SiteHeader() {
  return (
    <header className="border-b bg-white/60 backdrop-blur dark:bg-surface/60">
      <div className="container-std py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight">Switchback Labs</Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="hover:underline">Home</Link>
          <Link href="/services" className="hover:underline">Services</Link>
          <Link href="/projects" className="hover:underline">Projects</Link>
          <Link href="/race-trackingV2" className="inline-flex items-center rounded-md border px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-surface">
            Race Tracker
          </Link>
          <Link href="/admin" className="text-gray-500 hover:underline">Admin</Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
