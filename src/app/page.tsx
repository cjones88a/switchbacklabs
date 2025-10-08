import SiteHeader from "@/components/layout/SiteHeader";
import ScrollCue from "@/components/ui/ScrollCue";
import Link from "next/link";
import OutlineCard from "@/components/ui/OutlineCard";
import PillArrow from "@/components/ui/PillArrow";

export const metadata = {
  title: "Switchback Labs — Less talk. More shipped.",
  description: "Senior PM with principal-level engineering skills. Strategy, research, design, and developer-loved specs.",
};

export default function Home() {
  return (
    <>
      <SiteHeader />

      {/* HERO (white canvas) */}
      <section className="relative">
        <div className="section">
          <p className="text-[11px] tracking-widest uppercase text-muted mb-6">
            Product Strategy · Research · Design · Requirements · Delivery
          </p>
          <h1 className="h1">LESS TALK.<br/> MORE SHIPPED.</h1>
          <p className="lead mt-6 max-w-[62ch]">
            I help founders and teams move from fuzzy ideas to shipped experiences: crisp strategy,
            evidence-based decisions, and specs developers love.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a className="btn btn-primary" href="mailto:switchbacklabsco@gmail.com">Start a project</a>
            <Link className="btn btn-pill" href="/projects">
              Projects <PillArrow />
            </Link>
          </div>
        </div>
        <ScrollCue />
      </section>


      <footer className="border-t border-line">
        <div className="container-std py-8 text-sm text-muted flex items-center justify-between">
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