import DashedRing from "./DashedRing";

export default function OutlineCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="card-outline p-6 md:p-8 relative bg-[hsl(var(--pb-paper))]">
      <div className="absolute right-6 top-6 hidden md:block">
        <DashedRing className="w-20 h-20" />
      </div>
      {subtitle && <div className="text-[11px] tracking-widest uppercase text-muted mb-2">{subtitle}</div>}
      <div className="text-xl font-semibold">{title}</div>
      {children && <div className="text-muted mt-2 text-sm">{children}</div>}
    </div>
  );
}
