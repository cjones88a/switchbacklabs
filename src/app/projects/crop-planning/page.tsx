import SiteHeader from "@/components/layout/SiteHeader";
import Link from "next/link";
import PillArrow from "@/components/ui/PillArrow";

export const metadata = { title: "Project: Crop Planning App — Switchback Labs" };

export default function CropPlanningOverview() {
  return (
    <>
      <SiteHeader />

      <section className="relative">
        <div className="section">
          <p className="text-[11px] tracking-widest uppercase text-muted mb-6">
            Project
          </p>
          <h1 className="h2">CROP PLANNING & BUDGETING APP</h1>
          <p className="lead mt-6 max-w-[62ch]">
            Product specification for MVP: crop planning, budget tracking, and expense actuals for small to medium-sized farms.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/projects/crop-planning/prd" className="btn btn-primary">
              Read PRD
            </Link>
            <Link href="/projects/crop-planning/demo" className="btn btn-pill">
              Try demo
            </Link>
            <Link href="/projects" className="btn btn-pill">
              Back to projects <PillArrow />
            </Link>
          </div>
        </div>
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
