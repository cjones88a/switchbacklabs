import SiteHeader from "@/components/layout/SiteHeader";
import Link from "next/link";
import PillArrow from "@/components/ui/PillArrow";

export const metadata = { title: "Project: Franchise CRM on HubSpot — Switchback Labs" };

const INTEGRATIONS = [
  { name: "Contentful", detail: "Headless CMS" },
  { name: "SalesMsg", detail: "SMS" },
  { name: "Vagaro", detail: "Booking and scheduling" },
  { name: "Rent Manager", detail: "Property management" },
];

function IntegrationNode({ name, detail }: { name: string; detail: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-4 text-center shadow-sm">
      <div className="font-medium text-gray-900">{name}</div>
      <div className="mt-1 text-sm text-muted">{detail}</div>
    </div>
  );
}

function HubNode() {
  return (
    <div className="rounded-2xl bg-gray-900 px-4 py-6 text-center text-white shadow-sm">
      <div className="text-[11px] tracking-widest uppercase text-white/50">Center</div>
      <div className="mt-1 text-xl font-medium">HubSpot</div>
      <p className="mt-2 text-sm text-white/70 leading-snug">
        Pipeline, tickets, custom objects, Claude
      </p>
    </div>
  );
}

export default function HubSpotFranchiseProject() {
  return (
    <>
      <SiteHeader />

      <section className="relative">
        <div className="section">
          <p className="text-[11px] tracking-widest uppercase text-muted mb-6">
            Project Details
          </p>
          <h1 className="h2">FRANCHISE CRM ON HUBSPOT</h1>
          <p className="lead mt-6 max-w-[68ch]">
            A customized HubSpot instance for a multi-location franchise brand. Property operations, messaging, content, and booking lived in separate products. This work connects them through HubSpot. It is still underway.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/projects" className="btn btn-pill">
              Back to projects <PillArrow />
            </Link>
            <Link href="/how-i-work" className="btn btn-pill">
              How I work
            </Link>
          </div>
        </div>
      </section>

      <section className="section-paper">
        <div className="container-std">
          <div className="max-w-3xl">
            <h2 className="h2 mb-6">Context and problem</h2>
            <p className="text-muted leading-relaxed">
              A franchise with many locations runs on more than a CRM. Leases and property records sit in a property-management system. Texts go out through an SMS tool. The website is a headless CMS. Appointments are booked in a scheduling product. Staff were working across those tools without a shared deal path or a shared ticket path.
            </p>
            <p className="text-muted leading-relaxed mt-4">
              The job was a HubSpot instance shaped around that operation. The brand stays unnamed. The write-up is the pattern: one franchise, many locations, one system of record for the commercial work.
            </p>
          </div>

          <div className="mt-14 max-w-3xl">
            <h2 className="h2 mb-6">What was built</h2>
            <p className="text-muted leading-relaxed">
              HubSpot sits in the middle. Rent Manager, SalesMsg, Contentful, and Vagaro connect to it. On top of that hub: a fully custom deal pipeline with automations, a custom ticketing system, many custom objects that sync with Rent Manager, and Claude integrated into the instance.
            </p>
          </div>

          <figure className="mt-8" aria-label="HubSpot at the center, with Contentful, SalesMsg, Vagaro, and Rent Manager around it">
            <div className="hidden md:grid md:grid-cols-3 md:grid-rows-3 md:gap-3 md:items-stretch">
              <div />
              <IntegrationNode name="Contentful" detail="Headless CMS" />
              <div />
              <IntegrationNode name="SalesMsg" detail="SMS" />
              <HubNode />
              <IntegrationNode name="Vagaro" detail="Booking and scheduling" />
              <div />
              <IntegrationNode name="Rent Manager" detail="Property management" />
              <div />
            </div>
            <div className="md:hidden space-y-3">
              <HubNode />
              {INTEGRATIONS.map((item) => (
                <IntegrationNode key={item.name} name={item.name} detail={item.detail} />
              ))}
            </div>
            <figcaption className="mt-4 text-sm text-muted">
              HubSpot is the center. The four products around it are the systems the franchise already used.
            </figcaption>
          </figure>

          {/*
            TODO: add qualitative or measured outcomes here once there are public ones.
            Do not invent adoption, time saved, revenue, ticket volume, or location counts.
          */}
        </div>
      </section>

      <section className="relative">
        <div className="section">
          <div className="max-w-3xl">
            <h2 className="h2 mb-6">Custom data model</h2>
            <p className="text-muted leading-relaxed">
              The instance uses many custom objects, and those objects sync with Rent Manager. Property data stays in the property-management system. HubSpot holds the commercial view of the same records, so a deal or a ticket can sit next to the location it belongs to.
            </p>

            <h2 className="h2 mt-14 mb-6">Deal flow and automations</h2>
            <p className="text-muted leading-relaxed">
              The deal pipeline is fully custom, with automations on it. The stages follow this franchise&apos;s motion rather than a default sales pipeline. The automations carry work between those stages and the systems around HubSpot.
            </p>

            <h2 className="h2 mt-14 mb-6">Ticketing</h2>
            <p className="text-muted leading-relaxed">
              A custom ticketing system lives in the same instance. Requests sit with the deal and the property data, in HubSpot, instead of in a separate inbox that cannot see either.
            </p>

            <h2 className="h2 mt-14 mb-6">Claude in the instance</h2>
            <p className="text-muted leading-relaxed">
              Claude is integrated into the HubSpot instance. It is part of the system the team uses, alongside the pipeline, the tickets, and the synced objects. This is separate from the AI coding agents used to build software on this site.
            </p>
          </div>
        </div>
      </section>

      <section className="section-paper">
        <div className="container-std">
          <div className="max-w-3xl">
            <h2 className="h2 mb-6">Role</h2>
            <p className="text-muted leading-relaxed">
              Product manager on this instance in the current role: requirements, the data model, integration design, and rollout. Before that, 15 years in digital agriculture product work at Nutrien, including a large enterprise ERP system.
            </p>

            <h2 className="h2 mt-14 mb-6">What&apos;s next</h2>
            <p className="text-muted leading-relaxed">
              The work is ongoing. The next step is to generalize this instance into a reusable pattern for other franchises: HubSpot at the center, the same kinds of integrations, a custom pipeline, ticketing, and synced objects, adapted per brand.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="container-std py-8 text-sm text-muted flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
