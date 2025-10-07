import clsx from "clsx";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={clsx("bg-[hsl(var(--surface))] border rounded-2xl shadow-[0_1px_0_0_hsl(var(--border)),0_8px_24px_-12px_hsl(var(--shadow))] p-4", className)}>{children}</div>;
}
export function CardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-2">
      <h3 className="font-medium">{title}</h3>
      {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
    </div>
  );
}