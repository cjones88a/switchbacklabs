export const metadata = { title: "Services — Switchback Labs" };

const Section = ({title, children}:{title:string; children:React.ReactNode}) => (
  <section className="space-y-2">
    <h2 className="text-xl font-semibold">{title}</h2>
    <div className="text-gray-700">{children}</div>
  </section>
);

export default function Services() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Services</h1>

      <Section title="Product Strategy">
        <ul className="list-disc ml-5">
          <li>North star, outcomes, and success metrics</li>
          <li>Market & user segmentation, opportunity sizing</li>
          <li>Roadmapping and prioritization frameworks</li>
        </ul>
      </Section>

      <Section title="Research">
        <ul className="list-disc ml-5">
          <li>Discovery interviews and synthesis</li>
          <li>JTBD, task analysis, and qualitative testing</li>
          <li>Rapid validation with prototypes</li>
        </ul>
      </Section>

      <Section title="Design">
        <ul className="list-disc ml-5">
          <li>Information architecture and user flows</li>
          <li>Wireframes and hi-fi prototypes</li>
          <li>Design systems and spec handoff</li>
        </ul>
      </Section>

      <Section title="Requirements & Delivery">
        <ul className="list-disc ml-5">
          <li>PRDs and acceptance criteria developers love</li>
          <li>Backlog management and sprint rituals</li>
          <li>Launch plans and KPI instrumentation</li>
        </ul>
      </Section>

      <div className="rounded-md border p-4">
        <p className="text-sm">
          Need a fractional PM or a focused discovery/delivery engagement?
          Email <a className="underline" href="mailto:switchbacklabsco@gmail.com">switchbacklabsco@gmail.com</a>.
        </p>
      </div>
    </div>
  );
}
