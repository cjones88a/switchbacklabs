"use client";

import Link from "next/link";
import { Inter, Space_Grotesk } from "next/font/google";
import { motion } from "framer-motion";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk" });

// NOTE: This component is drop-in for app/page.tsx in a Next.js 13+ app.
// TailwindCSS required. No shadcn dependency to avoid deploy friction.
// Colors used: slate, off-white, lime accent. Adjust via Tailwind config if desired.

export default function SwitchbackLabsLanding() {
  return (
    <main className={`${inter.variable} ${grotesk.variable} bg-white text-slate-900 antialiased`}> 
      {/* Site wrapper */}
      <div className="min-h-screen">
        <Header />
        <Hero />
        <Availability />
        <Footer />
      </div>
    </main>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b border-slate-200">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="group inline-flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-gradient-to-br from-green-400 to-emerald-500 ring-1 ring-gray-300 shadow-sm" />
          <span className="font-semibold tracking-tight text-gray-900" style={{fontFamily:"var(--font-grotesk)"}}>Switchback Labs</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
          <Link href="#work" className="nav-link">Work</Link>
          <Link href="#services" className="nav-link">Services</Link>
          <Link href="#contact" className="nav-link">Contact</Link>
          <Link href="/projects" className="btn btn--ghost">See Projects</Link>
        </nav>
        <div className="md:hidden">
          <Link href="/projects" className="btn btn--ghost">Projects</Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* subtle grain */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.06]" style={{backgroundImage:"url('data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'200\\' height=\\'200\\'><filter id=\\'n\\'><feTurbulence type=\\'fractalNoise\\' baseFrequency=\\'.9\\' numOctaves=\\'2\\'/></filter><rect width=\\'100%\\' height=\\'100%\\' filter=\\'url(%23n)\\' opacity=\\'0.4\\'/></svg>')"}} />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28">
        <motion.h1
          initial={{opacity:0, y:8}}
          animate={{opacity:1, y:0}}
          transition={{duration:0.5}}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.05]">
          <span style={{fontFamily:"var(--font-grotesk)"}}>Less Talk.</span>
          <br/>
          <span className="relative inline-block" style={{fontFamily:"var(--font-grotesk)"}}>
            <span className="relative z-10">More Shipped.</span>
            <span className="absolute left-0 bottom-1 h-3 w-full rounded bg-lime-300/70 -z-0" />
          </span>
        </motion.h1>

        <motion.p
          initial={{opacity:0}}
          animate={{opacity:1}}
          transition={{delay:0.2}}
          className="mt-6 max-w-2xl text-lg text-gray-600">
          I help founders and teams turn fuzzy ideas into shipped experiences: crisp strategy, evidence‑based decisions, and specs developers love.
        </motion.p>

        <motion.div
          initial={{opacity:0, y:8}}
          animate={{opacity:1, y:0}}
          transition={{delay:0.35}}
          className="mt-8 flex flex-wrap items-center gap-3">
          <Link href="/projects" className="btn btn--ghost">See work</Link>
        </motion.div>
      </div>
    </section>
  );
}


function Availability() {
  return (
    <section id="contact" className="py-14 bg-gradient-to-b from-white to-gray-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="rounded-2xl ring-1 ring-gray-200 p-8 sm:p-10 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-semibold" style={{fontFamily:"var(--font-grotesk)"}}>Availability</h3>
            <p className="mt-2 text-gray-600 max-w-2xl">Fractional PM or project‑based sprints. Typical response within one business day.</p>
          </div>
          <div className="flex gap-3">
            <Link href="mailto:hello@switchbacklabsco.com" className="btn btn--primary">Email me</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-100 py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <p className="text-sm opacity-80">© {new Date().getFullYear()} Switchback Labs — Built in Fort Collins, CO</p>
        <nav className="flex items-center gap-5 text-sm opacity-90">
          <Link href="/privacy" className="hover:underline">Privacy</Link>
          <Link href="/terms" className="hover:underline">Terms</Link>
          <Link href="https://github.com/cjones88a" className="hover:underline" target="_blank">GitHub</Link>
          <Link href="/projects" className="hover:underline">Projects</Link>
        </nav>
      </div>
    </footer>
  );
}

// ------- Utility Styles via Tailwind classes -------
// Tailwind shortcuts as classNames for buttons, cards, etc.
// Consider extracting to a CSS module if preferred.

declare module "react" { interface CSSProperties { [key: string]: string | number } }

// Extend Link components with button styling via className props
// Usage: className="btn btn--primary"

// Add these utilities to globals.css if you prefer, but inline here for portability via @apply-like classes.

// In globals.css, you can add:
// .btn { @apply inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2; }
// .btn--primary { @apply bg-lime-300 text-slate-900 hover:bg-lime-200 focus:ring-lime-400; }
// .btn--secondary { @apply bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-400; }
// .btn--ghost { @apply ring-1 ring-slate-300 text-slate-900 hover:bg-slate-100; }
// .card { @apply rounded-2xl bg-white p-6 ring-1 ring-slate-200 shadow-sm hover:shadow-md transition-shadow; }
// .icon-wrap { @apply h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 ring-1 ring-slate-200; }
// .nav-link { @apply hover:text-slate-900; }